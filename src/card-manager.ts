interface CardManagerSettings<T> {
    /**
     * Define the id that will be set to each card div. It must generate a unique id for each different card, so it's often linked to card id.
     * If you use different cards types that couldhave the same ids, you must define this method to make it different for each type (for example : `getId: (card) => 'other-card-type-' + card.id`).
     * 
     * Default: the id will be set to `card-${card.id}`.
     * 
     * @param card the card informations
     * @return the id for a card
     */
    getId?: (card: T) => string;

    /**
     * Allow to populate the main div of the card. You can set classes or dataset, if it's informations shared by both sides.
     * 
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupDiv?: (card: T, element: HTMLDivElement) => void;

    /**
     * Allow to populate the front div of the card. You can set classes or dataset to show the correct card face.
     * You can also add some translated text on the card at this moment.
     * 
     * @param card the card informations
     * @param element the card front Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupFrontDiv?: (card: T, element: HTMLDivElement) => void;

    /**
     * Allow to populate the back div of the card. You can set classes or dataset to show the correct card face.
     * You can also add some translated text on the card at this moment.
     * 
     * @param card the card informations
     * @param element  the card back Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupBackDiv?: (card: T, element: HTMLDivElement) => void;

    /**
     * @param card the card informations
     * @param element  the card back Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    // WIP isCardVisible?: (card: T) => boolean;

    /**
     * The animation manager used in the game. If not provided, a new one will be instanciated for this card manager. Useful if you use AnimationManager outside of card manager, to avoid double instanciation.
     */
    animationManager?: AnimationManager;
}

interface FlipCardSettings {
    /**
     * Updates the data of the flipped card, so the stock containing it will return the new data when using getCards().
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method. 
     * Default true
     */
    updateData?: boolean;

    /**
     * Updates the front display, by calling `setupFrontDiv`.
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method. 
     * Default true
     */
    updateFront?: boolean;

    /**
     * Updates the back display, by calling `setupBackDiv`.
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method. 
     * Default false
     */
    updateBack?: boolean;
}

class CardManager<T> {
    public animationManager: AnimationManager;

    private stocks: CardStock<T>[] = [];

    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    constructor(public game: Game, private settings: CardManagerSettings<T>) {
        this.animationManager = settings.animationManager ?? new AnimationManager(game);
    }

    public addStock(stock: CardStock<T>) {
        this.stocks.push(stock);
    }

    /**
     * @param card the card informations
     * @return the id for a card
     */
    public getId(card: T) {
        return this.settings.getId?.(card) ?? `card-${(card as any).id}`;
    }

    public createCardElement(card: T, visible: boolean = true): HTMLDivElement {
        const id = this.getId(card);
        const side = visible ? 'front' : 'back';

        // TODO check if exists
        const element = document.createElement("div");
        element.id = id;
        element.dataset.side = ''+side;
        element.innerHTML = `
            <div class="card-sides">
                <div class="card-side front">
                </div>
                <div class="card-side back">
                </div>
            </div>
        `;
        element.classList.add('card');
        document.body.appendChild(element);
        this.settings.setupDiv?.(card, element);
        this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement);
        this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement);
        document.body.removeChild(element);
        return element;
    }

    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    public getCardElement(card: T): HTMLElement {
        return document.getElementById(this.getId(card));
    }

    public removeCard(card: T) {
        const id = this.getId(card);
        const div = document.getElementById(id);
        if (!div) {
            return;
        }

        // if the card is in a stock, notify the stock about removal
        this.getCardStock(card)?.cardRemoved(card);

        div.id = `deleted${id}`;
        // TODO this.removeVisibleInformations(div);
        div.remove();
    }

    /**
     * @param card the card informations
     * @return the stock containing the card
     */
    public getCardStock(card: T): CardStock<T> {
        return this.stocks.find(stock => stock.contains(card));
    }

    /**
     * Set the card to its front (visible) or back (not visible) side.
     * 
     * @param card the card informations
     * @param visible if the card is set to visible face
     * @param settings the flip params (to update the card in current stock)
     */
    public setCardVisible(card: T, visible: boolean, settings?: FlipCardSettings): void {
        const element = this.getCardElement(card);
        if (!element) {
            return;
        }

        element.dataset.side = visible ? 'front' : 'back';
        if (settings?.updateFront ?? true) {
            this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement);
        }
        if (settings?.updateBack ?? false) {
            this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement);
        }

        if (settings?.updateData ?? true) {
            // card data has changed
            const stock = this.getCardStock(card);
            const cards = stock.getCards();
            const cardIndex = cards.findIndex(c => this.getId(c) === this.getId(card));
            if (cardIndex !== -1) {
                (stock as any).cards.splice(cardIndex, 1, card);
            }
        }
    }

    /**
     * Flips the card.
     * 
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    public flipCard(card: T, settings?: FlipCardSettings): void {
        const element = this.getCardElement(card);
        const currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    }
}