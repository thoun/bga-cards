interface CardManagerSettings<T> {
    /**
     * The type of cards, if you game has multiple cards types (each card manager should have a different type).
     * Default `${yourgamename}-card`.
     * 
     * The card element will have this type as a class, and each side will have the class `${type}-${'front'/'back'}`.
     */
    type?: string;

    /**
     * Define the id that will be set to each card div. It must return a unique id for each different card, so it's often linked to card id.
     * 
     * Default: the id will be set to `card.id`.
     * 
     * @param card the card informations
     * @return the id for a card
     */
    getId?: (card: T) => string | number;

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
     * A function to determine if the card should show front side or back side, based on the informations of the card object.
     * If you only manage visible cards, set it to `() => true`.
     * Default is `card.type` is truthy.
     * 
     * @param card the card informations
     * @return true if front side should be visible
     */
    isCardVisible?: (card: T) => boolean;

    /** 
     * Return the card rotation.
     * Use `getCardRotation` from settings if set, else will return 0
     * 
     * @param card the card informations
     * @return the card rotation
     */
    getCardRotation?: (card: T) => number;
    /**
     * A generator of fake cards, to generate decks top card automatically.
     * Default is generating an empty card, with only id set.
     * 
     * @param deckId the deck id
     * @return the fake card to be generated (usually, only informations to show back side)
     */
    fakeCardGenerator?: (deckId: string) => T;

    /**
     * The animation manager used in the game. If not provided, a new one will be instanciated for this card manager. Useful if you use AnimationManager outside of card manager, to avoid double instanciation.
     */
    animationManager?: AnimationManager;

    /**
     * Indicate the width of a card (in px).
     */
    cardWidth?: number;

    /**
     * Indicate the height of a card (in px).
     */
    cardHeight?: number;

    /**
     * Indicate the width of a card border radius (example : '10px', '50%').
     */
    cardBorderRadius?: string;

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

    /**
     * The class to apply to selectable slots. Default 'bga-cards_selectable-slot'.
     */
    selectableSlotClass?: string | null;

    /**
     * The class to apply to selectable slots. Default 'bga-cards_disabled-slot'.
     */
    unselectableSlotClass?: string | null;

    /**
     * The class to apply to selected slots. Default 'bga-cards_selected-slot'.
     */
    selectedSlotClass?: string | null;

    /**
     * The class to apply to the last played card. Default 'bga-cards_last-played-card'.
     */
    lastPlayedCardClass?: string | null;
}

interface FlipCardSettings {
    /**
     * Updates the data of the flipped card, so the stock containing it will return the new data when using getCards().
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method. 
     * Default true
     */
    updateData?: boolean;

    /**
     * Updates the main div display, by calling `setupDiv`.
     * Default true
     */
    updateMain?: boolean;

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
     * Delay before updateMain (in ms).
     * Allow the card main div setting to be visible during the flip animation.
     * Default 0.
     */
    updateMainDelay?: number;

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

    private updateMainTimeoutId = [];
    private updateFrontTimeoutId = [];
    private updateBackTimeoutId = [];

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

    public removeStock(stock: CardStock<T>) {
        const index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    }

    /**
     * @param card the card informations
     * @return the id for a card
     */
    public getId(card: T): string | number {
        return this.settings.getId?.(card) ?? `${(card as any).id}`;
    }

    /**
     * @param card the card informations
     * @return the id for a card element
     */
    public getCardElementId(card: T): string {
        return `${this.getType()}-${this.getId(card)}`;
    }

    /**
     * 
     * @returns the type of the cards, either set in the settings or by using game_name if there is only 1 type.
     */
    public getType(): string {
        return this.settings.type ?? `${(this.game as any).game_name}-card`;
    }

    public createCardElement(card: T, initialSide: 'auto' | 'front' | 'back' = 'auto'): HTMLDivElement {
        const id = this.getCardElementId(card);
        const side = ['front', 'back'].includes(initialSide) ? initialSide : (this.isCardVisible(card) ? 'front' : 'back'); // to apply auto & ignore invalid values
        const rotation = this.getCardRotation(card);
        const lying = rotation % 2 === 1;
        const type = this.getType();

        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }

        const element = document.createElement("div");
        element.id = id;
        element.dataset.side = ''+side;
        element.style.setProperty('--bga-cards_card-width', `${this.getCardWidth()}px`);
        element.style.setProperty('--bga-cards_card-height', `${this.getCardHeight()}px`);
        element.style.setProperty('--bga-cards_card-effective-width', `${lying ? this.getCardHeight() : this.getCardWidth()}px`);
        element.style.setProperty('--bga-cards_card-effective-height', `${lying ? this.getCardWidth() : this.getCardHeight()}px`);
        element.style.setProperty('--bga-cards_card-rotation', `${rotation * 90}deg`);
        element.style.setProperty('--bga-cards_card-border-radius', `${this.getCardBorderRadius()}`);
        element.innerHTML = `
            <div class="card-sides">
                <div id="${id}-front" class="card-side front ${type}-front">
                </div>
                <div id="${id}-back" class="card-side back ${type}-back">
                </div>
            </div>
        `;
        element.classList.add('card', type);
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
        return document.getElementById(this.getCardElementId(card));
    }

    /**
     * Remove a card.
     * 
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    public removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean> {
        const div = this.getCardElement(card);
        if (!div) {
            return Promise.resolve(false);
        }

        div.id = `deleted-${div.id}`;
        div.remove();

        // if the card is in a stock, notify the stock about removal
        this.getCardStock(card)?.cardRemoved(card, settings);

        return Promise.resolve(true);
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
     * Return the card rotation.
     * Use `getCardRotation` from settings if set, else will return 0
     * 
     * @param card the card informations
     * @return the card rotation
     */
    public getCardRotation(card: T): number {
        return this.settings.getCardRotation?.(card) ?? 0;
    }

    /**
     * Set the card to its front (visible) or back (not visible) side.
     * 
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    public setCardVisible(card: T, visible?: boolean, settings?: FlipCardSettings): void {
        const element = this.getCardElement(card) as HTMLDivElement;

        if (!element) {
            return;
        }

        const isVisible = visible ?? this.isCardVisible(card);

        element.dataset.side = isVisible ? 'front' : 'back';

        const stringId = JSON.stringify(this.getId(card));
        

        if (settings?.updateMain ?? false) {
            if (this.updateMainTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }

            const updateMainDelay = settings?.updateMainDelay ?? 0;
            if (isVisible && updateMainDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(() => this.settings.setupDiv?.(card, element), updateMainDelay);
            } else {
                this.settings.setupDiv?.(card, element);
            }
        }

        if (settings?.updateFront ?? true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }

            const updateFrontDelay = settings?.updateFrontDelay ?? 500;

            if (!isVisible && updateFrontDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(() => this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement), updateFrontDelay);
            } else {
                this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement);
            }
        }

        if (settings?.updateBack ?? false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }

            const updateBackDelay = settings?.updateBackDelay ?? 0;
            if (isVisible && updateBackDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(() => this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement), updateBackDelay);
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

        const rotation = this.getCardRotation(card);
        const lying = rotation % 2 === 1;

        const element = this.getCardElement(card);
        
        element.style.setProperty('--bga-cards_card-effective-width', `${lying ? this.getCardHeight() : this.getCardWidth()}px`);
        element.style.setProperty('--bga-cards_card-effective-height', `${lying ? this.getCardWidth() : this.getCardHeight()}px`);
        element.style.setProperty('--bga-cards_card-rotation', `${rotation * 90}deg`);
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
     * @returns the card height set in the settings (undefined if unset)
     */
    public getCardBorderRadius(): string | undefined {
        return this.settings?.cardBorderRadius; 
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

    /**
     * @returns the class to apply to selectable slots. Default 'bga-cards_selectable-slot'.
     */
    public getSelectableSlotClass(): string | null {
        return this.settings?.selectableSlotClass === undefined ? 'bga-cards_selectable-slot' : this.settings?.selectableSlotClass;
    }

    /**
     * @returns the class to apply to selectable slots. Default 'bga-cards_disabled-slot'.
     */
    public getUnselectableSlotClass(): string | null {
        return this.settings?.unselectableSlotClass === undefined ? 'bga-cards_disabled-slot' : this.settings?.unselectableSlotClass;
    }

    /**
     * @returns the class to apply to selected slots. Default 'bga-cards_selected-slot'.
     */
    public getSelectedSlotClass(): string | null {
        return this.settings?.selectedSlotClass === undefined ? 'bga-cards_selected-slot' : this.settings?.selectedSlotClass;
    }

    /**
     * @returns the class to apply to the last played card. Default 'bga-cards_last-played-card'.
     */
    public getLastPlayedCardClass(): string | null {
        return this.settings?.lastPlayedCardClass === undefined ? 'bga-cards_last-played-card' : this.settings?.lastPlayedCardClass;
    }
    
    public getFakeCardGenerator(): (deckId: string) => T {
        return this.settings?.fakeCardGenerator ?? (deckId => ({ id: this.getId({ id: `${deckId}-fake-top-card` as any} as T)} as T));
    }

    /**
     * Mark the last play card. Remove the other last play card classes.
     * 
     * @param card the card to mark as last played
     * @param color the color to use to mark the last played card, usually the player color
     * @param cardClass a class applied on this type of cards, to limit removal to these type of cards.
     */
    public setLastPlayedCard(card: T | null, color?: string, cardClass?: string) {
        this.setLastPlayedCards(card ? [card] : null, color, cardClass);
    }

    /**
     * Mark the last play cards. Remove the other last play card classes.
     * 
     * @param cards the cards to mark as last played
     * @param color the color to use to mark the last played card, usually the player color
     * @param cardClass a class applied on this type of cards, to limit removal to these type of cards.
     */
    public setLastPlayedCards(cards: T[] | null, color?: string, cardClass?: string) {
        const lastPlayedClass = this.getLastPlayedCardClass();

        let selector = `.${lastPlayedClass}`;
        if (cardClass) {
            selector = `.${cardClass} .${selector}`;
        }
        document.querySelectorAll(selector).forEach(elem => elem.classList.remove(lastPlayedClass));

        if (color.match(/^[\da-f]{6}$/i)) { // if the color sent is a color player without the #
            color = `#${color}`;
        }
        cards.map(card => this.getCardElement(card)).filter(element => !!element).forEach(element => {
            element.style.setProperty('--last-played-card-color', color ?? 'red');
            element.querySelectorAll('.card-side').forEach(cardSideDiv => cardSideDiv.classList.add(lastPlayedClass));
        });
    }
}