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
    mapCardToSlot: (card: T) => SlotId;

    /**
     * The class to apply to selectable slots. Use class from manager is unset.
     */
    selectableSlotClass?: string | null;

    /**
     * The class to apply to selectable slots. Use class from manager is unset.
     */
    unselectableSlotClass?: string | null;

    /**
     * The class to apply to selected slots. Use class from manager is unset.
     */
    selectedSlotClass?: string | null;
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
    protected mapCardToSlot: (card: T) => SlotId;
    protected selectedSlots: SlotId[] = [];
    protected slotSelectionMode: CardSelectionMode = 'none';

    /**
     * Called when the slot selection change. Returns the selection.
     * 
     * selection: the selected SlotId of the stock  
     * lastChange: the last change on selection slot (can be selected or unselected)
     */
    public onSlotSelectionChange?: (selection: SlotId[], lastChange: SlotId | null) => void;

    /**
     * Called when slot selection change. Returns the clicked slot.
     * 
     * slot: the clicked slot (can be selected or unselected)
     */
    public onSlotClick?: (slotId: SlotId) => void;

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: SlotStockSettings<T>) {
        super(manager, element, settings);
        if (!settings.mapCardToSlot) {
            throw new Error('You need to define SlotStock settings.mapCardToSlot to use SlotStock');
        }
        element.classList.add('slot-stock');

        this.mapCardToSlot = settings.mapCardToSlot;
        this.slotsIds = settings.slotsIds ?? [];
        this.slotClasses = settings.slotClasses ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    protected createSlot(slotId: SlotId) {
        if (this.slots[slotId]) {
            throw new Error(`The element for ${slotId} already exists`);
        }
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        this.slots[slotId].classList.add(...['slot', ...this.slotClasses]);
        this.slots[slotId].addEventListener('click', () => {
            if (this.slotSelectionMode != 'none') {
                const alreadySelected = this.selectedSlots.includes(slotId);
    
                if (alreadySelected) {
                    this.unselectSlot(slotId);
                } else {
                    this.selectSlot(slotId);
                }
            }
    
            this.onSlotClick?.(slotId);
        })
    }

    /**
     * Add a card to the stock.
     *
     * @param card the card to add  
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addCard(card: T, animation?: CardAnimationSettings, settings?: AddCardToSlotSettings): Promise<boolean> {
        const slotId = settings?.slot ?? this.mapCardToSlot(card);
        if (slotId === undefined) {
            throw new Error(`Impossible to add card to slot : no SlotId. Add slotId to settings or make sure mapCardToSlot return a valid slotId.`);
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

    public getSlotsIds() {
        return this.slotsIds;
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
        this.selectedSlots = [];
        this.slots = [];
        this.slotsIds = slotsIds ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    public removeSlot(slotId: SlotId) {
        const removedCards = this.getCards().filter(card => this.mapCardToSlot(card) === slotId);
        this.removeCards(removedCards);

        this.slots[slotId]?.remove();
        delete this.slots[slotId];
        this.slotsIds = this.slotsIds.filter(si => si !== slotId);
        this.selectedSlots = this.selectedSlots.filter(si => si !== slotId);
    }

    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     * 
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    public addSlotsIds(newSlotsIds: SlotId[]) {
        // ignore slotsIds we already have
        const filteredSlotsIds = newSlotsIds.filter(slotId => !this.slotsIds.includes(slotId));
        if (filteredSlotsIds.length == 0) {
            // no change
            return;
        }

        this.slotsIds.push(...filteredSlotsIds);
        filteredSlotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }

    /**
     * @returns the class to apply to selectable slots. Use class from manager is unset.
     */
    public getSelectableSlotClass(): string | null {
        return (this.settings as SlotStockSettings<T>)?.selectableSlotClass === undefined ? this.manager.getSelectableSlotClass() : (this.settings as SlotStockSettings<T>)?.selectableSlotClass;
    }

    /**
     * @returns the class to apply to selectable slots. Use class from manager is unset.
     */
    public getUnselectableSlotClass(): string | null {
        return (this.settings as SlotStockSettings<T>)?.unselectableSlotClass === undefined ? this.manager.getUnselectableSlotClass() : (this.settings as SlotStockSettings<T>)?.unselectableSlotClass;
    }

    /**
     * @returns the class to apply to selected slots. Use class from manager is unset.
     */
    public getSelectedSlotClass(): string | null {
        return (this.settings as SlotStockSettings<T>)?.selectedSlotClass === undefined ? this.manager.getSelectedSlotClass() : (this.settings as SlotStockSettings<T>)?.selectedSlotClass;
    }

    protected canAddCard(card: T, settings?: AddCardToSlotSettings) {
        if (!this.contains(card)) {
            return true;
        } else {
            const closestSlot = this.getCardElement(card).closest('.slot') as HTMLDivElement | null;
            if (closestSlot) {
                const currentCardSlot = closestSlot.dataset.slotId;
                const slotId = settings?.slot ?? this.mapCardToSlot(card);
                return currentCardSlot != slotId;
            } else {
                return true;
            }
        }
    }

    /**
     * Swap cards inside the slot stock.
     * 
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    public swapCards(cards: T[], settings?: AddCardSettings) {
        const elements = cards.map(card => this.manager.getCardElement(card));

        cards.forEach((card, index) => {
            const cardElement = elements[index];

            const cardIndex = this.cards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
            if (cardIndex !== -1) {
                this.cards.splice(cardIndex, 1, card);
            }
    
            this.manager.updateCardInformations(card);

            this.removeSelectionClassesFromElement(cardElement);
        });

        const promise = this.manager.animationManager.swap(elements);

        cards.forEach((card, index) => {
            promise.then(() => {
                //this.manager.animationManager.base.attachToElement(cardElement, this.slots[slotId]);
                this.setSelectableCard(card, settings?.selectable ?? true);
            });
        });

        return promise;
    }

    /**
     * Set if the stock slot are selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected slots.
     * 
     * @param selectionMode the selection mode
     * @param selectableSlots the selectable slats (all if unset). Calls `setSelectableSlots` method
     */
    public setSlotSelectionMode(selectionMode: CardSelectionMode, selectableSlots?: SlotId[]) {
        if (selectionMode !== this.slotSelectionMode) {
            this.unselectAll(true);
        }

        this.slotsIds.forEach(slotId => this.setSelectableSlot(slotId, selectionMode != 'none'));
        this.element.classList.toggle('bga-cards_selectable-stock-slots', selectionMode != 'none');
        this.slotSelectionMode = selectionMode;
        
        if (selectionMode === 'none') {
            this.slotsIds.forEach(slotId => this.removeSlotSelectionClasses(slotId));
        } else {
            this.setSelectableSlots(selectableSlots ?? this.slotsIds);
        }
    }

    public removeSlotSelectionClasses(slotId: SlotId) {        
        this.removeSlotSelectionClassesFromElement(this.slots[slotId]);
    }

    public removeSlotSelectionClassesFromElement(slotElement: HTMLElement) {        
        const selectableSlotsClass = this.getSelectableSlotClass();
        const unselectableSlotsClass = this.getUnselectableSlotClass();
        const selectedSlotsClass = this.getSelectedSlotClass();

        slotElement?.classList.remove(selectableSlotsClass, unselectableSlotsClass, selectedSlotsClass);
    }

    protected setSelectableSlot(slotId: SlotId, selectable: boolean) {
        if (this.slotSelectionMode === 'none') {
            return;
        }

        const element = this.slots[slotId];            
        const selectableSlotClass = this.getSelectableSlotClass();
        const unselectableSlotClass = this.getUnselectableSlotClass();

        if (selectableSlotClass) {
            element?.classList.toggle(selectableSlotClass, selectable);
        }
        if (unselectableSlotClass) {
            element?.classList.toggle(unselectableSlotClass, !selectable);
        }

        if (!selectable && this.isSlotSelected(slotId)) {
            this.unselectSlot(slotId);
        }
    }

    /**
     * Set the selectable class for each slot.
     * 
     * @param selectableSlots the selectable slots. If unset, all slots are marked selectable. Default unset.
     */
    public setSelectableSlots(slotIds?: SlotId[]) {
        if (this.slotSelectionMode === 'none') {
            return;
        }

        console.warn(slotIds);
        this.slotsIds.forEach(slotId =>
            this.setSelectableSlot(slotId, slotIds ? slotIds.includes(slotId) : true)
        );
    }

    /**
     * Set selected state to a slot.
     * 
     * @param slotId the slot to select
     */
    public selectSlot(slotId: SlotId) {
        if (this.slotSelectionMode == 'none') {
            return;
        }

        const element = this.slots[slotId];

        const selectableSlotsClass = this.getSelectableSlotClass();
        if (!element || !element.classList.contains(selectableSlotsClass)) {
            return;
        }
        
        if (this.slotSelectionMode === 'single') {
            this.slotsIds.filter(c => c !== slotId).forEach(c => this.unselectSlot(c));
        }

        const selectedSlotsClass = this.getSelectedSlotClass();
        element.classList.add(selectedSlotsClass);
        this.selectedSlots.push(slotId);

        this.onSlotSelectionChange?.(this.selectedSlots.slice(), slotId);
    }

    /**
     * Set unselected state to a slot.
     * 
     * @param slot the slot to unselect
     */
    public unselectSlot(slotId: SlotId) {
        const element = this.slots[slotId];      
        const selectedSlotClass = this.getSelectedSlotClass();
        element?.classList.remove(selectedSlotClass);

        const index = this.selectedSlots.findIndex(c => c === slotId);
        if (index !== -1) {
            this.selectedSlots.splice(index, 1);
        }

        this.onSlotSelectionChange?.(this.selectedSlots.slice(), slotId);
    }

    /**
     * Select all slots
     */
    public selectAllSlots() {
        if (this.slotSelectionMode == 'none') {
            return;
        }

        this.slotsIds.forEach(slotId => this.selectSlot(slotId));
    }

    /**
     * Unselect all slots
     */
    public unselectAllSlots() {
        this.slotsIds.forEach(slotId => this.unselectSlot(slotId));
    }

    /**
     * @returns the selected slots
     */
    public getSlotSelection(): SlotId[] {
        return this.selectedSlots.slice();
    }

    /**
     * @returns if the slot is selectd
     */
    public isSlotSelected(slotId: SlotId): boolean {
        return this.selectedSlots.includes(slotId);
    }
}