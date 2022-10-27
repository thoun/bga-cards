interface DeckSettings {
    /**
     * Indicate the width of the deck (should be the width of a card, in px)
     */
    width: number;
    /**
     * Indicate the height of the deck (should be the height of a card, in px)
     */
    height: number;

    /**
     * Indicate the current number of cards in the deck (default 52)
     */
    cardNumber?: number;

    /**
     * Indicate if the line should be centered (default yes)
     */
    autoUpdateCardNumber?: boolean;

    /**
     * Indicate the thresholds to add 1px to the thickness of the pile. Default [0, 2, 5, 10, 20, 30].
     */
    thicknesses?: number[];

    /**
     * Shadow direction. Default 'bottom-right'.
     */
    shadowDirection?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness).
 */
class Deck<T> extends CardStock<T> {
    protected cardNumber: number;
    protected autoUpdateCardNumber: boolean;
    private thicknesses: number[];

    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: DeckSettings) {
        super(manager, element);
        element.classList.add('deck');
        this.element.style.setProperty('--width', settings.width+'px');
        this.element.style.setProperty('--height', settings.height+'px');
        this.thicknesses = settings.thicknesses ?? [0, 2, 5, 10, 20, 30];
        this.setCardNumber(settings.cardNumber ?? 52);
        this.autoUpdateCardNumber = settings.autoUpdateCardNumber ?? true;

        const shadowDirection = settings.shadowDirection ?? 'bottom-right';
        const shadowDirectionSplit = shadowDirection.split('-');
        const xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        const yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        this.element.style.setProperty('--xShadowShift', ''+xShadowShift);
        this.element.style.setProperty('--yShadowShift', ''+yShadowShift);
    }

    public setCardNumber(cardNumber: number) {
        this.cardNumber = cardNumber;

        this.element.dataset.empty = (this.cardNumber == 0).toString();

        let thickness = 0;
        this.thicknesses.forEach((threshold, index) => {
            if (this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', thickness+'px');
    }

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        return super.addCard(card, animation, settings);
    }

    public cardRemoved(card: T) {
        if (this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        super.cardRemoved(card);
    }
}