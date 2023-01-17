interface CardStockSettings {
    /**
     * Indicate the card sorting (unset means no sorting, new cards will be added at the end).
     * For example, use `sort: sortFunction('type', '-type_arg')` to sort by type then type_arg (in reversed order if prefixed with `-`). 
     * Be sure you typed the values correctly! Else '11' will be before '2'.
     */
    sort?: SortFunction;
}

interface AddCardSettings {
    /**
     * If the card will be on its visible side on the stock
     */
    visible?: boolean;

    forceToElement?: HTMLElement;

    index?: number;
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
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings?: CardStockSettings) {
        manager.addStock(this);
        element?.classList.add('card-stock'/*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();

        this.sort = settings?.sort;
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
     * @param card a card  
     * @returns if the card is present in the stock
     */
    public contains(card: T): boolean {
        return this.cards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }
    // TODO keep only one ?
    protected cardInStock(card: T): boolean {
        const element = document.getElementById(this.manager.getId(card));
        return element ? this.cardElementInStock(element) : false;
    }

    protected cardElementInStock(element: HTMLElement): boolean {
        return element?.parentElement == this.element;
    }

    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    public getCardElement(card: T): HTMLElement {
        return document.getElementById(this.manager.getId(card));
    }

    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     * 
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    protected canAddCard(card: T, settings?: AddCardSettings) {
        return !this.cardInStock(card);
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

        // we check if card is in stock then we ignore animation
        const currentStock = this.manager.getCardStock(card);

        const index = this.getNewCardIndex(card);
        const settingsWithIndex: AddCardSettings = {
            index,
            ...(settings ?? {})
        };

        if (currentStock?.cardInStock(card)) {
            let element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, { ...animation, fromStock: currentStock,  }, settingsWithIndex);
            element.dataset.side = (settingsWithIndex?.visible ?? true) ? 'front' : 'back';
        } else if (animation?.fromStock && animation.fromStock.cardInStock(card)) {
            let element = document.getElementById(this.manager.getId(card));
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        } else {
            const element = this.manager.createCardElement(card, (settingsWithIndex?.visible ?? true));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }

        this.setSelectableCard(card, this.selectionMode != 'none');

        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        } else {
            this.cards.push(card);
        }

        if (!promise) {
            console.warn(`CardStock.addCard didn't return a Promise`);
            return Promise.resolve(false);
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

        this.addCardElementToParent(cardElement, settings);

        cardElement.classList.remove('selectable', 'selected', 'disabled');
        promise = this.animationFromElement({
            element: cardElement, 
            fromElement: animation.fromStock.element, 
            originalSide: animation.originalSide, 
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock != this) {
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
                promise = this.animationFromElement({
                    element: cardElement, 
                    fromElement: animation.fromStock.element, 
                    originalSide: animation.originalSide, 
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            } else if (animation.fromElement) {
                promise = this.animationFromElement({
                    element: cardElement, 
                    fromElement: animation.fromElement, 
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
    public addCards(cards: T[], animation?: CardAnimation<T>, settings?: AddCardSettings, shift: number | boolean = false) {
        if (shift === true) {
            if (cards.length) {
                this.addCard(cards[0], animation, settings).then(
                    () => this.addCards(cards.slice(1), animation, settings, shift)
                );
            }
            return;
        }

        if (shift) {
            for (let i=0; i<cards.length; i++) {
                setTimeout(() => this.addCard(cards[i], animation, settings), i * shift);
            }
        } else {
            cards.forEach(card => this.addCard(card, animation, settings));
        }
    }

    /**
     * Remove a card from the stock.
     * 
     * @param card the card to remove
     */
    public removeCard(card: T) {
        if (this.cardInStock(card)) {
            this.manager.removeCard(card);
        }
        this.cardRemoved(card);
    }

    public cardRemoved(card: T) {
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
     */
    public removeCards(cards: T[]) {
        cards.forEach(card => this.removeCard(card));
    }

    /**
     * Remove all cards from the stock.
     */
    public removeAll() {
        const cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(card => this.removeCard(card));
    }

    protected setSelectableCard(card: T, selectable: boolean) {
        const element = this.getCardElement(card);
        element.classList.toggle('selectable', selectable);
    }

    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     * 
     * @param selectionMode the selection mode
     */
    public setSelectionMode(selectionMode: CardSelectionMode) {
        if (selectionMode === 'none') {
            this.unselectAll(true);
        }

        this.cards.forEach(card => this.setSelectableCard(card, selectionMode != 'none'));
        this.element.classList.toggle('selectable', selectionMode != 'none');
        this.selectionMode = selectionMode;
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
        
        if (this.selectionMode === 'single') {
            this.cards.filter(c => this.manager.getId(c) != this.manager.getId(card)).forEach(c => this.unselectCard(c, true));
        }

        const element = this.getCardElement(card);
        element.classList.add('selected');
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
        element.classList.remove('selected');

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
     * Unelect all cards
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

    protected animationFromElement(settings: AnimationSettings): Promise<boolean> {
        if (document.visibilityState !== 'hidden' && !(this.manager.game as any).instantaneousMode) {
            const animation = settings.animation ?? stockSlideAnimation;
            return animation(settings);
        } else {
            return Promise.resolve(false);
        }
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
}
