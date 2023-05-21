type SideOrAngle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';
type SideOrAngleOrCenter = SideOrAngle | 'center';

interface DeckCounter {
    /**
     * Show a card counter on the deck. Default true.
     */
    show?: boolean;

    /**
     * Counter position. Default 'bottom'.
     */
    position?: SideOrAngleOrCenter;

    /**
     * Classes to add to counter (separated with spaces). Pre-built are `round` and `text-shadow`. Default `round`.
     */
    extraClasses?: string;

    /**
     * Show the counter when empty. Default true.
     */
    hideWhenEmpty?: boolean;
}

interface DeckSettings<T> {
    /**
     * Indicate the current top card.
     */
    topCard?: T;

    /**
     * Indicate the current number of cards in the deck (default 52).
     */
    cardNumber?: number;

    /**
     * Indicate if the card count is automatically updated when a card is added or removed.
     */
    autoUpdateCardNumber?: boolean;

    /**
     * Indicate the thresholds to add 1px to the thickness of the pile. Default [0, 2, 5, 10, 20, 30].
     */
    thicknesses?: number[];

    /**
     * Shadow direction. Default 'bottom-right'.
     */
    shadowDirection?: SideOrAngle;

    /**
     * Show a card counter on the deck. Not visible if unset.
     */
    counter?: DeckCounter;
}

interface AddCardToDeckSettings extends AddCardSettings {
    /**
     * Indicate if the card count is automatically updated when a card is added or removed.
     */
    autoUpdateCardNumber?: boolean;
}

/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). * 
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
class Deck<T> extends CardStock<T> {
    protected cardNumber: number;
    protected autoUpdateCardNumber: boolean;
    private thicknesses: number[];

    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: DeckSettings<T>) {
        super(manager, element);
        
        element.classList.add('deck');
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        } else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        this.thicknesses = settings.thicknesses ?? [0, 2, 5, 10, 20, 30];
        this.setCardNumber(settings.cardNumber ?? 52);
        this.autoUpdateCardNumber = settings.autoUpdateCardNumber ?? true;

        const shadowDirection = settings.shadowDirection ?? 'bottom-right';
        const shadowDirectionSplit = shadowDirection.split('-');
        const xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        const yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        this.element.style.setProperty('--xShadowShift', ''+xShadowShift);
        this.element.style.setProperty('--yShadowShift', ''+yShadowShift);

        if (settings.topCard) {
            this.addCard(settings.topCard, undefined);
        } else if (settings.cardNumber > 0) {
            console.warn(`Deck is defined with ${settings.cardNumber} cards but no top card !`);
        }

        if (settings.counter && (settings.counter.show ?? true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error(`You need to set cardNumber if you want to show the counter`);
            } else {
                this.createCounter(settings.counter.position ?? 'bottom', settings.counter.extraClasses ?? 'round');

                if (settings.counter?.hideWhenEmpty) {
                    this.element.querySelector('.bga-cards-deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        
        this.setCardNumber(settings.cardNumber ?? 52);
    }

    protected createCounter(counterPosition: SideOrAngleOrCenter, extraClasses: string) {
        const left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        const top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', `${left}%`);
        this.element.style.setProperty('--bga-cards-deck-top', `${top}%`);

        this.element.insertAdjacentHTML('beforeend', `
            <div class="bga-cards-deck-counter ${extraClasses}"></div>
        `);
    }

    /**
     * Get the the cards number.
     * 
     * @returns the cards number
     */
    public getCardNumber() {
        return this.cardNumber;
    }

    /**
     * Set the the cards number.
     * 
     * @param cardNumber the cards number
     */
    public setCardNumber(cardNumber: number, topCard: T | null = null) {
        if (topCard) {
            this.addCard(topCard);
        }

        this.cardNumber = cardNumber;

        this.element.dataset.empty = (this.cardNumber == 0).toString();

        let thickness = 0;
        this.thicknesses.forEach((threshold, index) => {
            if (this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', `${thickness}px`);

        const counterDiv = this.element.querySelector('.bga-cards-deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = `${cardNumber}`;
        }
    }

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean> {
        if (this.autoUpdateCardNumber && (settings?.autoUpdateCardNumber ?? true)) {
            this.setCardNumber(this.cardNumber + 1);
        }

        return super.addCard(card, animation, settings);
    }

    public cardRemoved(card: T) {
        if (this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        super.cardRemoved(card);
    }
}