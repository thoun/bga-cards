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

    updateInformations?: boolean;
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

        if (originStock?.contains(card)) {
            let element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, { ...animation, fromStock: originStock,  }, settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = (settingsWithIndex?.visible ?? this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        } else if (animation?.fromStock && animation.fromStock.contains(card)) {
            let element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        } else {
            const element = this.manager.createCardElement(card, (settingsWithIndex?.visible ?? this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }

        this.setSelectableCard(card, this.selectionMode != 'none');

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

        const element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        const fromRect = element.getBoundingClientRect();

        this.addCardElementToParent(cardElement, settings);

        cardElement.classList.remove('selectable', 'selected', 'disabled');
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide, 
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
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
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
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
     * Set the selectable class for each card.
     * 
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     * @param unselectableCardsClass the class to add to unselectable cards (for example to mark them as disabled). Default 'disabled'.
     */
    public setSelectableCards(selectableCards?: T[], unselectableCardsClass: string = 'disabled') {
        if (this.selectionMode === 'none') {
            return
        }

        const selectableCardsIds = (selectableCards ?? this.getCards()).map(card => this.manager.getId(card));

        this.cards.forEach(card => {
            const element = this.getCardElement(card);
            const selectable = selectableCardsIds.includes(this.manager.getId(card));
            element.classList.toggle('selectable', selectable);
            if (unselectableCardsClass) {
                element.classList.toggle(unselectableCardsClass, !selectable);
            }
        });
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

    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts. 
     * @param fromElement The HTMLElement to animate from.
     */
    protected animationFromElement(element: HTMLElement, fromRect: DOMRect, settings: CardAnimationSettings): Promise<boolean> {
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

        const animation: AnimationFunction = settings.animation ?? slideAnimation;
        return animation(element, <AnimationWithOriginSettings>{
            duration: this.manager.animationManager.getSettings()?.duration ?? 500,
            scale: this.manager.animationManager.getZoomManager()?.zoom ?? undefined,

            ...settings ?? {},

            game: this.manager.game,
            fromRect
        }) ?? Promise.resolve(false);
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
