interface AllVisibleDeckSettings extends CardStockSettings {
    /**
     * The shift between each card (default 3)
     */
    shift?: string;

    /**
     * The direction when it expands (default 'vertical')
     */
    direction?: 'vertical' | 'horizontal';
}


class AllVisibleDeck<T> extends CardStock<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: AllVisibleDeckSettings) {
        super(manager, element, settings);
        element.classList.add('all-visible-deck', settings.direction ?? 'vertical');

        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        } else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        element.style.setProperty('--shift', settings.shift ?? '3px');
    }        

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        const order = this.cards.length;
        promise = super.addCard(card, animation, settings);
        
        const cardId = this.manager.getId(card);
        const cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', ''+order);

        this.element.style.setProperty('--tile-count', ''+this.cards.length);

        return promise;
    }

    /**
     * Set opened state. If true, all cards will be entirely visible.
     * 
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    public setOpened(opened: boolean) {
        this.element.classList.toggle('opened', opened);
    }

    public cardRemoved(card: T) {
        super.cardRemoved(card);
        this.cards.forEach((c, index) => {
            const cardId = this.manager.getId(c);
            const cardDiv = document.getElementById(cardId)
            cardDiv.style.setProperty('--order', ''+index);
        });
        this.element.style.setProperty('--tile-count', ''+this.cards.length);
    }
}