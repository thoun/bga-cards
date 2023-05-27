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
    isCardVisible?: (card: T) => boolean;

    /**
     * The animation manager used in the game. If not provided, a new one will be instanciated for this card manager. Useful if you use AnimationManager outside of card manager, to avoid double instanciation.
     */
    animationManager?: AnimationManager;

    /**
     * Indicate the width of a card (in px). Used for Deck stocks.
     */
    cardWidth?: number;

    /**
     * Indicate the height of a card (in px). Used for Deck stocks.
     */
    cardHeight?: number;

    /**
     * The class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    selectableCardClass?: string | null;

    /**
     * The class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    unselectableCardClass?: string | null;

    /**
     * The class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    selectedCardClass?: string | null;
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

    /**
     * Delay before updateFront (in ms).
     * Allow the card front to be visible during the flip animation. 
     * Default 500
     */
    updateFrontDelay?: number;

    /**
     * Delay before updateBackDelay (in ms).
     * Allow the card back to be visible during the flip animation. 
     * Default 0
     */
    updateBackDelay?: number;
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
    
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     * 
     * @returns if the animations are active.
     */
    public animationsActive(): boolean {
        return this.animationManager.animationsActive();
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

        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }

        const element = document.createElement("div");
        element.id = id;
        element.dataset.side = ''+side;
        element.innerHTML = `
            <div class="card-sides">
                <div id="${id}-front" class="card-side front">
                </div>
                <div id="${id}-back" class="card-side back">
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

    /**
     * Remove a card.
     * 
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    public removeCard(card: T, settings?: RemoveCardSettings) {
        const id = this.getId(card);
        const div = document.getElementById(id);
        if (!div) {
            return false;
        }

        div.id = `deleted${id}`;
        div.remove();

        // if the card is in a stock, notify the stock about removal
        this.getCardStock(card)?.cardRemoved(card, settings);

        return true;
    }

    /**
     * Returns the stock containing the card.
     * 
     * @param card the card informations
     * @return the stock containing the card
     */
    public getCardStock(card: T): CardStock<T> {
        return this.stocks.find(stock => stock.contains(card));
    }

    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     * 
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    public isCardVisible(card: T): boolean {
        return this.settings.isCardVisible?.(card) ?? ((card as any).type ?? false);
    }

    /**
     * Set the card to its front (visible) or back (not visible) side.
     * 
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    public setCardVisible(card: T, visible?: boolean, settings?: FlipCardSettings): void {
        const element = this.getCardElement(card);
        if (!element) {
            return;
        }

        const isVisible = visible ?? this.isCardVisible(card);

        element.dataset.side = isVisible ? 'front' : 'back';

        if (settings?.updateFront ?? true) {
            const updateFrontDelay = settings?.updateFrontDelay ?? 500;

            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                setTimeout(() => this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement), updateFrontDelay);
            } else {
                this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement);
            }
        }
        if (settings?.updateBack ?? false) {
            const updateBackDelay = settings?.updateBackDelay ?? 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                setTimeout(() => this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement), updateBackDelay);
            } else {
                this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement);
            }
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

    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     * 
     * @param card the card informations
     */
    public updateCardInformations(card: T, settings?: Omit<FlipCardSettings, 'updateData'>): void {
        const newSettings = { ...(settings ?? {}), updateData: true, };
        this.setCardVisible(card, undefined, newSettings);
    }

    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    public getCardWidth(): number | undefined {
        return this.settings?.cardWidth;
    }

    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    public getCardHeight(): number | undefined {
        return this.settings?.cardHeight;
    }

    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    public getSelectableCardClass(): string | null {
        return this.settings?.selectableCardClass === undefined ? 'bga-cards_selectable-card' : this.settings?.selectableCardClass;
    }

    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    public getUnselectableCardClass(): string | null {
        return this.settings?.unselectableCardClass === undefined ? 'bga-cards_disabled-card' : this.settings?.unselectableCardClass;
    }

    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    public getSelectedCardClass(): string | null {
        return this.settings?.selectedCardClass === undefined ? 'bga-cards_selected-card' : this.settings?.selectedCardClass;
    }
}