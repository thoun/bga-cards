class VisibleDeck<T> extends Deck<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: DeckSettings) {
        super(manager, element, settings);
        element.classList.add('visible-deck');
    }

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean> {
        const currentCard = this.cards[this.cards.length - 1];
        if (currentCard) {
            // we remove the card under, only when the animation is done. TODO use promise result
            setTimeout(() => {
                this.removeCard(currentCard);

                // counter the autoUpdateCardNumber as the card isn't really removed, we just remove it from the dom so player cannot see it's content.
                if (this.autoUpdateCardNumber) {
                    this.setCardNumber(this.cardNumber + 1);
                }
            }, 600);
        }

        return super.addCard(card, animation, settings);
    }
}