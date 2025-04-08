type SideOrAngle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';
type SideOrAngleOrCenter = SideOrAngle | 'center';

interface DeckCounter {
    /**
     * Show a card counter on the deck. Default true.
     */
    show?: boolean;

    /**
     * Counter position. Default 'bottom'.
     */
    position?: SideOrAngleOrCenter;

    /**
     * Classes to add to counter (separated with spaces). Pre-built are `round` and `text-shadow`. Default `round`.
     */
    extraClasses?: string;

    /**
     * Show the counter when empty. Default true.
     */
    hideWhenEmpty?: boolean;

    /**
     * Set a counter id if you want to set a tooltip on it, for example. Default unset.
     */
    counterId?: string;
}

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

    /**
     * Show a card counter on the stock. Not visible if unset.
     */
    counter?: DeckCounter;
}

interface AddCardSettings {
    /**
     * Card side at the beginning of the animation. Default 'auto' to isCardVisible. Ignored if the card already exists.
     */
    initialSide?: 'auto' | 'front' | 'back';

    /**
     * Card side at the end of the animation. Default to initialSide.
     */
    finalSide?: 'auto' | 'front' | 'back';

    forceToElement?: HTMLElement;

    /**
     * Force card position. Default to end of list. Do not use if sort is defined, as it will override it.
     */
    index?: number;
    
    /**
     * Set if the card is selectable. Default is true, but will be ignored if the stock is not selectable.
     */
    selectable?: boolean;

    /**
     * Indicates if we add a fade in effect when adding card (if it comes from an invisible or abstract element).
     */
    fadeIn?: boolean;

    /**
     * For counters.
     * Indicate if the card count is automatically updated when a card is added or removed. Default true.
     */
    autoUpdateCardNumber?: boolean;
}

interface RemoveCardSettings {
}

type CardSelectionMode = 'none' | 'single' | 'multiple';

/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
class CardStock<T> {
    protected cards: T[] = [];
    protected selectableCards: T[] = [];
    protected selectedCards: T[] = [];
    protected selectionMode: CardSelectionMode = 'none';
    protected sort?: SortFunction; 

    protected counterDiv: HTMLDivElement | null = null;

    /**
     * Called when selection change. Returns the selection.
     * 
     * selection: the selected cards of the stock  
     * lastChange: the last change on selection card (can be selected or unselected)
     */
    public onSelectionChange?: (selection: T[], lastChange: T | null) => void;

    /**
     * Called when a card is clicked. Returns the clicked card.
     * 
     * card: the clicked card (can be selected or unselected)
     */
    public onCardClick?: (card: T) => void;

    /**
     * Called when card count change. Returns the clicked card.
     * 
     * card: the clicked card (can be selected or unselected)
     */
    public onCardCountChange?: (cardCount: number) => void;

    /**
     * Creates the stock and register it on the manager.
     * 
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, protected settings?: CardStockSettings) {
        manager.addStock(this);
        element?.classList.add('card-stock'/*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();

        this.sort = settings?.sort;

        if (settings?.counter && (settings.counter.show ?? true)) {
            this.createCounter(settings.counter.position ?? 'bottom', settings.counter.extraClasses ?? 'round', settings.counter.hideWhenEmpty, settings.counter.counterId);

            if (settings.counter?.hideWhenEmpty) {
                this.element.querySelector('.bga-cards_card-counter').classList.add('hide-when-empty');
                this.element.dataset.empty = 'true';
            }
        }
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
     * @returns if the card is selectable
     */
    public isSelectable(card: T): boolean {
        return this.selectableCards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }

    /**
     * @returns if the card is selected
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
    public addCard(card: T, animation?: CardAnimationSettings, settings?: AddCardSettings): Promise<boolean> {
        if (!this.canAddCard(card, settings)) {
            this.manager.updateCardInformations(card);
            return Promise.resolve(false);
        }

        // we check if card is in a stock
        let cardElement = this.getCardElement(card);
        const originStock = this.manager.getCardStock(card);

        if (cardElement && !originStock) {
            throw new Error('The card element exists but is not attached to any Stock');
        }
        if (cardElement) { // unselect the card
            originStock.unselectCard(card);
            this.removeSelectionClassesFromElement(cardElement);
        }
        const animationSettings: CardAnimationSettings = animation ?? {};
        if (originStock) { // if the card is in a Stock, the animation must come from it
            animationSettings.fromStock = originStock;
        }

        const addCardSettings: AddCardSettings = settings ?? {};
        const index = this.getNewCardIndex(card);
        if (index !== undefined) {
            addCardSettings.index = index;
        }

        if (addCardSettings.index !== null && addCardSettings.index !== undefined) {
            this.cards.splice(index, 0, card);
        } else {
            this.cards.push(card);
        }

        let promise: Promise<boolean> = cardElement ? 
            this.addExistingCardElement(card, cardElement, animationSettings, addCardSettings) : 
            this.addUnexistingCardElement(card, animationSettings, addCardSettings);

        this.manager.updateCardInformations(card);

        // if the card was from a stock, we remove the card from it. 
        // Must be called after the animation is started, so it doesn't delete the element
        if (animationSettings.fromStock && animationSettings.fromStock != this) {
            animationSettings.fromStock.removeCard(card);
        }

        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(() => this.setSelectableCard(card, addCardSettings.selectable ?? true));
        }
        
        this.cardNumberUpdated();

        return promise;
    }

    protected addExistingCardElement(card: T, cardElement: HTMLElement, animation: CardAnimationSettings, settings?: AddCardSettings): Promise<boolean> {
        const toElement = settings?.forceToElement ?? this.element;

        let insertBefore = undefined;
        if (settings?.index === null || settings?.index === undefined || !toElement.children.length || settings?.index >= toElement.children.length) {
        } else {
            insertBefore = toElement.children[settings.index];
        }

        const promise = this.animationFromElement(card, cardElement, animation.fromStock?.element ?? animation.fromElement, toElement, insertBefore, animation, settings);

        return promise;
    }

    protected addUnexistingCardElement(card: T, animation: CardAnimationSettings, settings?: AddCardSettings): Promise<boolean> {
        let initialSide = settings?.initialSide;        
        
        if (!['front', 'back'].includes(initialSide)) { // unset or invalid value
            // if the card comes from a stock but is not found in this stock, the card is probably hidden (deck with a fake top card)
            if (animation?.fromStock && !animation?.fromStock?.contains(card)) {
                initialSide = 'back';
            } else {
                initialSide = this.manager.isCardVisible(card) ? 'front' : 'back';
            }
        }

        const cardElement = this.manager.createCardElement(card, initialSide);

        return this.addExistingCardElement(card, cardElement, animation, settings);
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

    /**
     * Add an array of cards to the stock.
     * 
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    public async addCards(cards: T[], animation?: CardAnimationSettings, settings?: AddCardSettings, shift: number | boolean = false): Promise<boolean> {
        if (!this.manager.game.bgaAnimationsActive()) {
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

        this.cardNumberUpdated();
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
            element?.querySelectorAll(`.${BGA_CARDS_CARD_SIDE_CLASS}`).forEach(cardSideDiv => cardSideDiv.classList.toggle(selectableCardsClass, selectable));
        }
        if (unselectableCardsClass) {
            element?.querySelectorAll(`.${BGA_CARDS_CARD_SIDE_CLASS}`).forEach(cardSideDiv => cardSideDiv.classList.toggle(unselectableCardsClass, !selectable));
        }

        const index = this.selectableCards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
        if (selectable) {
            if (index === -1) {
                this.selectableCards.push(card);
            }
        } else {
            if (index !== -1) {
                this.selectableCards.splice(index, 1);
            }

            if (this.isSelected(card)) {
                this.unselectCard(card, true);
            }
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

        this.selectableCards = selectableCards;
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

        if (!element || !this.selectableCards.some(c => this.manager.getId(c) == this.manager.getId(card))) {
            return;
        }
        
        if (this.selectionMode === 'single') {
            this.cards.filter(c => this.manager.getId(c) != this.manager.getId(card)).forEach(c => this.unselectCard(c, true));
        }

        const selectableCardsClass = this.getSelectableCardClass();
        const selectedCardsClass = this.getSelectedCardClass();
        element?.querySelectorAll(`.${BGA_CARDS_CARD_SIDE_CLASS}`).forEach(cardSideDiv => {
            cardSideDiv.classList.remove(selectableCardsClass);
            cardSideDiv.classList.add(selectedCardsClass);
        });
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
        const selectable = this.selectableCards.some(c => this.manager.getId(c) == this.manager.getId(card));
        const selectableCardsClass = this.getSelectableCardClass();
        const selectedCardsClass = this.getSelectedCardClass();
        element?.querySelectorAll(`.${BGA_CARDS_CARD_SIDE_CLASS}`).forEach(cardSideDiv => {
            cardSideDiv.classList.remove(selectedCardsClass);
            if (selectable) {
                cardSideDiv.classList.add(selectableCardsClass);
            }
        });

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
            const cardDiv = (event.target as HTMLElement).closest(`.${BGA_CARDS_CARD_CLASS}`);
            if (!cardDiv) {
                return;
            }
            const card = this.cards.find(c => this.manager.getCardElementId(c) === cardDiv.id);
            if (!card) {
                return;
            }
            this.cardClick(card);
        });
    }

    protected cardClick(card: T) {
        if (this.selectionMode != 'none') {
            const alreadySelected = this.selectedCards.some(c => this.manager.getId(c) === this.manager.getId(card));

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
     * @param toElement The HTMLElement to attach the card to.
     */
    protected async animationFromElement(card: T, element: HTMLElement, fromElement: HTMLElement | null | undefined, toElement: HTMLElement, insertBefore: HTMLElement | null | undefined, animation: CardAnimationSettings, settings: AddCardSettings): Promise<boolean> {
        if (document.contains(element)) {
            const result = await this.manager.animationManager.slideAndAttach(element, toElement, animation, insertBefore);
            return result?.played ?? false;
        } else {
            this.manager.animationManager.base.attachToElement(element, toElement, insertBefore);
            let result = null;
            if (!animation.fromStock || settings.fadeIn) {
                result = await this.manager.animationManager.fadeIn(element, fromElement, animation);
            } else {
                result = await this.manager.animationManager.slideIn(element, fromElement, animation);
            }            

            return result?.played ?? false;
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

        cardElement?.querySelectorAll(`.${BGA_CARDS_CARD_SIDE_CLASS}`).forEach(cardSideDiv => cardSideDiv.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass));
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

    protected createCounter(counterPosition: SideOrAngleOrCenter, extraClasses: string, hideWhenEmpty?: boolean, counterId?: string) {
        const left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        const top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', `${left}%`);
        this.element.style.setProperty('--bga-cards-deck-top', `${top}%`);

        this.counterDiv = document.createElement('div');
        if (counterId) {
            this.counterDiv.id = counterId;
        }
        this.counterDiv.classList.add('bga-cards_card-counter', ...(extraClasses.trim() === '' ? [] : extraClasses.split(/\s+/)));
        this.counterDiv.innerText = '0';

        if (hideWhenEmpty ?? false) {
            this.counterDiv.classList.add('hide-when-empty');
        }

        this.element.appendChild(this.counterDiv);
    }

    /**
     * Returns the card count in the deck (what the player think there is, for decks, the real number of cards for all visible card stocks).
     * 
     * @returns the number of card in the stock
     */
    public getCardCount(): number {
        return this.cards.length;
    }

    /**
     * Updates the cards number, if the counter is visible.
     */
    protected cardNumberUpdated() {
        const cardNumber = this.getCardCount();
        this.element.style.setProperty('--tile-count', ''+cardNumber);
        this.element.dataset.empty = (cardNumber == 0).toString();
        this.onCardCountChange?.(cardNumber);

        if (this.counterDiv) {
            this.counterDiv.innerHTML = `${cardNumber}`;
        }
    }
}
