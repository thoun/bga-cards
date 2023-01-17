/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
class VoidStock<T> extends CardStock<T> {

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement) {
        super(manager, element);
        element.classList.add('void-stock');
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
        let promise = super.addCard(card, animation, settings);

        // center the element
        const cardElement = this.getCardElement(card);
        cardElement.style.left = `${(this.element.clientWidth - cardElement.clientWidth) / 2}px`;
        cardElement.style.top = `${(this.element.clientHeight - cardElement.clientHeight) / 2}px`;

        if (!promise) {
            console.warn(`VoidStock.addCard didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        return promise.then<boolean>(result => {
            this.removeCard(card);
            return result;
        });
    }
}