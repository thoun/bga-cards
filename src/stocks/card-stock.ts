interface CardStockSettings {
    /**
     * Indicate the card sorting (unset means no sorting, new cards will be added at the end).
     * For example, use `sort: sortFunction('type', '-type_arg')` to sort by type then type_arg (in reversed order if prefixed with `-`). 
     * Be sure you typed the values correctly! Else '11' will be before '2'.
     */
    sort?: SortFunction;

    /**
     * The class to apply to selectable cards. Use class from manager is unset.
     */
    selectableCardClass?: string | null;

    /**
     * The class to apply to selectable cards. Use class from manager is unset.
     */
    unselectableCardClass?: string | null;

    /**
     * The class to apply to selected cards. Use class from manager is unset.
     */
    selectedCardClass?: string | null;
}

interface AddCardSettings {
    /**
     * If the card will be on its visible side on the stock
     */
    visible?: boolean;

    forceToElement?: HTMLElement;

    /**
     * Force card position. Default to end of list. Do not use if sort is defined, as it will override it.
     */
    index?: number;
    
    /**
     * If the card need to be updated. Default true, will flip the card if needed.
     */
    updateInformations?: boolean;
    
    /**
     * Set if the card is selectable. Default is true, but will be ignored if the stock is not selectable.
     */
    selectable?: boolean;
}

interface RemoveCardSettings {
}

type CardSelectionMode = 'none' | 'single' | 'multiple';

/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
class CardStock<T> {
    protected cards: T[] = [];
    protected selectedCards: T[] = [];
    protected selectionMode: CardSelectionMode = 'none';
    protected sort?: SortFunction; 

    /**
     * Called when selection change. Returns the selection.
     * 
     * selection: the selected cards of the stock  
     * lastChange: the last change on selection card (can be selected or unselected)
     */
    public onSelectionChange?: (selection: T[], lastChange: T | null) => void;

    /**
     * Called when selection change. Returns the clicked card.
     * 
     * card: the clicked card (can be selected or unselected)
     */
    public onCardClick?: (card: T) => void;

    /**
     * Creates the stock and register it on the manager.
     * 
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, private settings?: CardStockSettings) {
        manager.addStock(this);
        element?.classList.add('card-stock'/*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();

        this.sort = settings?.sort;
    }

    /**
     * Removes the stock and unregister it on the manager.
     */
    public remove() {
        this.manager.removeStock(this);
        this.element?.remove();
    }
    
    /**
     * @returns the cards on the stock
     */
    public getCards(): T[] {
        return this.cards.slice();
    }

    /**
     * @returns if the stock is empty
     */
    public isEmpty(): boolean {
        return !this.cards.length;
    }

    /**
     * @returns the selected cards
     */
    public getSelection(): T[] {
        return this.selectedCards.slice();
    }

    /**
     * @returns the selected cards
     */
    public isSelected(card: T): boolean {
        return this.selectedCards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }

    /**
     * @param card a card  
     * @returns if the card is present in the stock
     */
    public contains(card: T): boolean {
        return this.cards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }

    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    public getCardElement(card: T): HTMLElement {
        return this.manager.getCardElement(card);
    }

    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     * 
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    protected canAddCard(card: T, settings?: AddCardSettings) {
        return !this.contains(card);
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
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }

        let promise: Promise<boolean>;

        // we check if card is in a stock
        const originStock = this.manager.getCardStock(card);

        const index = this.getNewCardIndex(card);
        const settingsWithIndex: AddCardSettings = {
            index,
            ...(settings ?? {})
        };

        const updateInformations = settingsWithIndex.updateInformations ?? true;

        let needsCreation = true;
        if (originStock?.contains(card)) {
            let element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, { ...animation, fromStock: originStock,  }, settingsWithIndex);
                needsCreation = false;
                if (!updateInformations) {
                    element.dataset.side = (settingsWithIndex?.visible ?? this.manager.isCardVisible(card)) ? 'front' : 'back';
                }
            }
        } else if (animation?.fromStock?.contains(card)) {
            let element = this.getCardElement(card);
            if (element) {
                promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
                needsCreation = false;
            }
        } 
        
        if (needsCreation) {
            const element = this.getCardElement(card);
            if (needsCreation && element) {
                console.warn(`Card ${this.manager.getId(card)} already exists, not re-created.`);
            }

            // if the card comes from a stock but is not found in this stock, the card is probably hudden (deck with a fake top card)
            const fromBackSide = !settingsWithIndex?.visible && !animation?.originalSide && animation?.fromStock && !animation?.fromStock?.contains(card);
            
            const createdVisible = fromBackSide ? false : settingsWithIndex?.visible ?? this.manager.isCardVisible(card);

            const newElement = element ?? this.manager.createCardElement(card, createdVisible);

            promise = this.moveFromElement(card, newElement, animation, settingsWithIndex);
        }

        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        } else {
            this.cards.push(card);
        }

        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }

        if (!promise) {
            console.warn(`CardStock.addCard didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(() => this.setSelectableCard(card, settingsWithIndex.selectable ?? true));
        }

        return promise;
    }

    protected getNewCardIndex(card: T): number | undefined {
        if (this.sort) {
            const otherCards = this.getCards();
            for (let i = 0; i<otherCards.length; i++) {
                const otherCard = otherCards[i];

                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        } else {
            return undefined;
        }
    }

    protected addCardElementToParent(cardElement: HTMLElement, settings?: AddCardSettings) {
        const parent = settings?.forceToElement ?? this.element;

        if (settings?.index === null || settings?.index === undefined || !parent.children.length || settings?.index >= parent.children.length) {
            parent.appendChild(cardElement);
        } else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    }

    protected moveFromOtherStock(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        const element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        const fromRect = element?.getBoundingClientRect();

        this.addCardElementToParent(cardElement, settings);

        this.removeSelectionClassesFromElement(cardElement);

        promise = fromRect ? this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide, 
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        }) : Promise.resolve(false);
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        
        if (!promise) {
            console.warn(`CardStock.moveFromOtherStock didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        return promise;
    }

    protected moveFromElement(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        this.addCardElementToParent(cardElement, settings);
    
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide, 
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            } else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement,  animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide, 
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        } else {
            promise = Promise.resolve(false);
        }
        
        if (!promise) {
            console.warn(`CardStock.moveFromElement didn't return a Promise`);
            promise = Promise.resolve(false);
        }

        return promise;
    }

    /**
     * Add an array of cards to the stock.
     * 
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    public async addCards(cards: T[], animation?: CardAnimation<T>, settings?: AddCardSettings, shift: number | boolean = false): Promise<boolean> {
        if (!this.manager.animationsActive()) {
            shift = false;
        }
        let promises: Promise<boolean>[] = [];

        if (shift === true) {
            if (cards.length) {
                const result = await this.addCard(cards[0], animation, settings);
                const others = await this.addCards(cards.slice(1), animation, settings, shift);
                return result || others;
            }
        } else if (typeof shift === 'number') {
            for (let i=0; i<cards.length; i++) {
                promises.push(new Promise(resolve => {
                    setTimeout(
                        () =>  this.addCard(cards[i], animation, settings).then(result => resolve(result)),
                        i * (shift as number)
                    );
                }));
            }
        } else {
            promises = cards.map(card => this.addCard(card, animation, settings));
        }

        const results = await Promise.all(promises);
        return results.some(result => result);
    }

    /**
     * Remove a card from the stock.
     * 
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    public removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean> {
        let promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        } else {
            promise = Promise.resolve(false);
        }
        this.cardRemoved(card, settings);

        return promise;
    }

    /**
     * Notify the stock that a card is removed.
     * 
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    public cardRemoved(card: T, settings?: RemoveCardSettings) {
        const index = this.cards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(c => this.manager.getId(c) == this.manager.getId(card))) {
            this.unselectCard(card);
        }
    }

    /**
     * Remove a set of card from the stock.
     * 
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    public async removeCards(cards: T[], settings?: RemoveCardSettings): Promise<boolean> {
        const promises = cards.map(card => this.removeCard(card, settings))
        const results = await Promise.all(promises);
        return results.some(result => result);
    }

    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    public async removeAll(settings?: RemoveCardSettings): Promise<boolean> {
        const cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        return this.removeCards(cards, settings);
    }

    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     * 
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    public setSelectionMode(selectionMode: CardSelectionMode, selectableCards?: T[]) {
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }

        this.cards.forEach(card => this.setSelectableCard(card, selectionMode != 'none'));
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        
        if (selectionMode === 'none') {
            this.getCards().forEach(card => this.removeSelectionClasses(card));
        } else {
            this.setSelectableCards(selectableCards ?? this.getCards());
        }
    }

    protected setSelectableCard(card: T, selectable: boolean) {
        if (this.selectionMode === 'none') {
            return;
        }

        const element = this.getCardElement(card);              
        const selectableCardsClass = this.getSelectableCardClass();
        const unselectableCardsClass = this.getUnselectableCardClass();

        if (selectableCardsClass) {
            element?.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element?.classList.toggle(unselectableCardsClass, !selectable);
        }

        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    }

    /**
     * Set the selectable class for each card.
     * 
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    public setSelectableCards(selectableCards?: T[]) {
        if (this.selectionMode === 'none') {
            return;
        }

        const selectableCardsIds = (selectableCards ?? this.getCards()).map(card => this.manager.getId(card));

        this.cards.forEach(card =>
            this.setSelectableCard(card, selectableCardsIds.includes(this.manager.getId(card)))
        );
    }

    /**
     * Set selected state to a card.
     * 
     * @param card the card to select
     */
    public selectCard(card: T, silent: boolean = false) {
        if (this.selectionMode == 'none') {
            return;
        }

        const element = this.getCardElement(card);

        const selectableCardsClass = this.getSelectableCardClass();
        if (!element || !element.classList.contains(selectableCardsClass)) {
            return;
        }
        
        if (this.selectionMode === 'single') {
            this.cards.filter(c => this.manager.getId(c) != this.manager.getId(card)).forEach(c => this.unselectCard(c, true));
        }

        const selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedCards.slice(), card);
        }
    }

    /**
     * Set unselected state to a card.
     * 
     * @param card the card to unselect
     */
    public unselectCard(card: T, silent: boolean = false) {
        const element = this.getCardElement(card);      
        const selectedCardsClass = this.getSelectedCardClass();
        element?.classList.remove(selectedCardsClass);

        const index = this.selectedCards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedCards.slice(), card);
        }
    }

    /**
     * Select all cards
     */
    public selectAll(silent: boolean = false) {
        if (this.selectionMode == 'none') {
            return;
        }

        this.cards.forEach(c => this.selectCard(c, true));
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedCards.slice(), null);
        }
    }

    /**
     * Unselect all cards
     */
    public unselectAll(silent: boolean = false) {
        const cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(c => this.unselectCard(c, true));
        
        if (!silent) {
            this.onSelectionChange?.(this.selectedCards.slice(), null);
        }
    }

    protected bindClick() {
        this.element?.addEventListener('click', event => {
            const cardDiv = (event.target as HTMLElement).closest('.card');
            if (!cardDiv) {
                return;
            }
            const card = this.cards.find(c => this.manager.getId(c) == cardDiv.id);
            if (!card) {
                return;
            }
            this.cardClick(card);
        });
    }

    protected cardClick(card: T) {
        if (this.selectionMode != 'none') {
            const alreadySelected = this.selectedCards.some(c => this.manager.getId(c) == this.manager.getId(card));

            if (alreadySelected) {
                this.unselectCard(card);
            } else {
                this.selectCard(card);
            }
        }

        this.onCardClick?.(card);
    }

    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts. 
     * @param fromElement The HTMLElement to animate from.
     */
    protected async animationFromElement(element: HTMLElement, fromRect: DOMRect, settings: CardAnimationSettings): Promise<boolean> {
        const side = element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const cardSides = element.getElementsByClassName('card-sides')[0] as HTMLDivElement;
            cardSides.style.transition = 'none';
            element.dataset.side = settings.originalSide;
            setTimeout(() => {
                cardSides.style.transition = null;
                element.dataset.side = side;
            });
        }

        let animation = settings.animation;
        if (animation) {
            animation.settings.element = element;
            (animation.settings as BgaAnimationWithOriginSettings).fromRect = fromRect;
        } else {
            animation = new BgaSlideAnimation({ element, fromRect });
        }

        const result = await this.manager.animationManager.play(animation);
        return result?.played ?? false;
    }

    /**
     * Set the card to its front (visible) or back (not visible) side.
     * 
     * @param card the card informations
     */
    public setCardVisible(card: T, visible: boolean, settings?: FlipCardSettings): void {
        this.manager.setCardVisible(card, visible, settings);
    }

    /**
     * Flips the card.
     * 
     * @param card the card informations
     */
    public flipCard(card: T, settings?: FlipCardSettings): void {
        this.manager.flipCard(card, settings);
    }

    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    public getSelectableCardClass(): string | null {
        return this.settings?.selectableCardClass === undefined ? this.manager.getSelectableCardClass() : this.settings?.selectableCardClass;
    }

    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    public getUnselectableCardClass(): string | null {
        return this.settings?.unselectableCardClass === undefined ?this.manager.getUnselectableCardClass() : this.settings?.unselectableCardClass;
    }

    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    public getSelectedCardClass(): string | null {
        return this.settings?.selectedCardClass === undefined ? this.manager.getSelectedCardClass() : this.settings?.selectedCardClass;
    }

    public removeSelectionClasses(card: T) {        
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    }

    public removeSelectionClassesFromElement(cardElement: HTMLElement) {        
        const selectableCardsClass = this.getSelectableCardClass();
        const unselectableCardsClass = this.getUnselectableCardClass();
        const selectedCardsClass = this.getSelectedCardClass();

        cardElement?.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    }

    /**
     * Changes the sort function of the stock.
     * 
     * @param sort the new sort function. If defined, the stock will be sorted with this new function.
     */
    public setSort(sort?: SortFunction) {
        this.sort = sort;

        if (this.sort && this.cards.length) {
            this.cards.sort(this.sort);

            let previouslyMovedCardDiv = this.getCardElement(this.cards[this.cards.length - 1]);
            this.element.appendChild(previouslyMovedCardDiv);
            for (let i = this.cards.length - 2; i >= 0; i--) {
                const movedCardDiv = this.getCardElement(this.cards[i]);
                this.element.insertBefore(movedCardDiv, previouslyMovedCardDiv);
                previouslyMovedCardDiv = movedCardDiv;
            }
        }
    }
}
