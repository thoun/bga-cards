interface DeckSettings {
    /**
     * Indicate the number of cards in the deck (default 0)
     */
    cardNumber?: number;

    /**
     * indicate if the line should be centered (default yes)
     */
    autoUpdateCardNumber?: boolean;
}

/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness).
 */
class Deck<T> extends CardStock<T> {
    private cardNumber: number;
    private autoUpdateCardNumber: boolean;
    private thicknessArray = [0, 2, 5, 10, 20];

    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: DeckSettings) {
        super(manager, element);
        element.classList.add('deck');
        this.setCardNumber(settings?.cardNumber ?? 0);
        this.autoUpdateCardNumber = settings?.autoUpdateCardNumber ?? true;
    }

    public setCardNumber(cardNumber: number) {
        this.cardNumber = cardNumber;

        this.element.dataset.empty = (this.cardNumber === 0).toString();

        let thickness = 0;
        this.thicknessArray.forEach((threshold, index) => {
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