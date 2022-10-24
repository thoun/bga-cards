class AllVisibleDeck<T> extends CardStock<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, width: string, height: string, shift: string) {
        super(manager, element);
        element.classList.add('all-visible-deck');
        element.style.setProperty('--width', width);
        element.style.setProperty('--height', height);
        element.style.setProperty('--shift', shift);
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