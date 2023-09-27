/**
 * A stock with manually placed cards
 */
class ManualPositionStock<T> extends CardStock<T> {

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: CardStockSettings, protected updateDisplay: (element: HTMLElement, cards: T[], lastCard: T, stock: ManualPositionStock<T>) => any) {
        super(manager, element, settings);
        element.classList.add('manual-position-stock');
    }

    /**
     * Add a card to the stock.
     *
     * @param card the card to add  
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        const promise = super.addCard(card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    }

    public cardRemoved(card: T, settings?: RemoveCardSettings) {
        super.cardRemoved(card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    }
}