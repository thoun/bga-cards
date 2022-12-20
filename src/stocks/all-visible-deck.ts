interface AllVisibleDeckSettings extends CardStockSettings {
    /**
     * Indicate the width of a card, in CSS with unit
     */
    width: string;
    /**
     * Indicate the height of a card, in CSS with unit
     */
    height: string;

    /**
     * The shift between each card (default 3)
     */
    shift?: string;
}


class AllVisibleDeck<T> extends CardStock<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: AllVisibleDeckSettings) {
        super(manager, element, settings);
        element.classList.add('all-visible-deck');
        element.style.setProperty('--width', settings.width);
        element.style.setProperty('--height', settings.height);
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