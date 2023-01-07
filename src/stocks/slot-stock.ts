interface SlotStockSettings<T> extends LineStockSettings {
    /**
     * The ids for the slots (can be number or string)
     */
    slotsIds: SlotId[];

    /**
     * The classes to apply to each slot
     */
    slotClasses?: string[];

    /**
     * How to place the card on a slot automatically
     */
    mapCardToSlot?: (card: T) => SlotId;
}

type SlotId = number | string;

interface AddCardToSlotSettings extends AddCardSettings {
    /**
     * The slot to place the card on.
     */
    slot?: SlotId;
}

/**
 * A stock with fixed slots (some can be empty)
 */
class SlotStock<T> extends LineStock<T> {
    protected slotsIds: SlotId[] = [];
    protected slots: HTMLDivElement[] = [];
    protected slotClasses: string[];
    protected mapCardToSlot?: (card: T) => SlotId;

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: SlotStockSettings<T>) {
        super(manager, element, settings);
        element.classList.add('slot-stock');

        this.mapCardToSlot = settings.mapCardToSlot;
        this.slotsIds = settings.slotsIds ?? [];
        this.slotClasses = settings.slotClasses ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    protected createSlot(slotId: SlotId) {
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        this.slots[slotId].classList.add(...['slot', ...this.slotClasses]);
    }

    /**
     * Add a card to the stock.
     *
     * @param card the card to add  
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToSlotSettings): Promise<boolean> {
        const slotId = settings?.slot ?? this.mapCardToSlot?.(card);
        if (slotId === undefined) {
            throw new Error(`Impossible to add card to slot : no SlotId. Add slotId to settings or set mapCardToSlot to SlotCard constructor.`);
        }
        if (!this.slots[slotId]) {
            throw new Error(`Impossible to add card to slot "${slotId}" : slot "${slotId}" doesn't exists.`);
        }

        const newSettings = {
            ...settings,
            forceToElement: this.slots[slotId],
        };
        return super.addCard(card, animation, newSettings);
    }

    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     * 
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    public setSlotsIds(slotsIds: SlotId[]) {
        if (slotsIds.length == this.slotsIds.length && slotsIds.every((slotId, index) => this.slotsIds[index] === slotId)) {
            // no change
            return;
        }

        this.removeAll();
        this.element.innerHTML = '';
        this.slotsIds = slotsIds ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    protected cardElementInStock(element: HTMLElement): boolean {
        return element?.parentElement.parentElement == this.element;
    }

    protected canAddCard(card: T, settings?: AddCardToSlotSettings) {
        if (!this.cardInStock(card)) {
            return true;
        } else {
            const currentCardSlot = (this.getCardElement(card).closest('.slot') as HTMLDivElement).dataset.slotId;
            const slotId = settings?.slot ?? this.mapCardToSlot?.(card);
            return currentCardSlot != slotId;
        }
    }
}