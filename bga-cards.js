function sortFunction(...sortedFields) {
    return (a, b) => {
        for (let i = 0; i < sortedFields.length; i++) {
            let direction = 1;
            let field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            const type = typeof a[field];
            if (type === 'string') {
                const compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare * direction;
                }
            }
            else if (type === 'number') {
                const compare = (a[field] - b[field]);
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
class CardStock {
    /**
     * Creates the stock and register it on the manager.
     *
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager, element, settings) {
        var _a, _b, _c, _d;
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectableCards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        this.counterDiv = null;
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
        if ((settings === null || settings === void 0 ? void 0 : settings.counter) && ((_a = settings.counter.show) !== null && _a !== void 0 ? _a : true)) {
            this.createCounter((_b = settings.counter.position) !== null && _b !== void 0 ? _b : 'bottom', (_c = settings.counter.extraClasses) !== null && _c !== void 0 ? _c : 'round', settings.counter.hideWhenEmpty, settings.counter.counterId);
            if ((_d = settings.counter) === null || _d === void 0 ? void 0 : _d.hideWhenEmpty) {
                this.element.querySelector('.bga-cards_card-counter').classList.add('hide-when-empty');
                this.element.dataset.empty = 'true';
            }
        }
    }
    /**
     * Removes the stock and unregister it on the manager.
     */
    remove() {
        var _a;
        this.manager.removeStock(this);
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.remove();
    }
    /**
     * @returns the cards on the stock
     */
    getCards() {
        return this.cards.slice();
    }
    /**
     * @returns if the stock is empty
     */
    isEmpty() {
        return !this.cards.length;
    }
    /**
     * @returns the selected cards
     */
    getSelection() {
        return this.selectedCards.slice();
    }
    /**
     * @returns if the card is selectable
     */
    isSelectable(card) {
        return this.selectableCards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }
    /**
     * @returns if the card is selected
     */
    isSelected(card) {
        return this.selectedCards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    contains(card) {
        return this.cards.some(c => this.manager.getId(c) == this.manager.getId(card));
    }
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    getCardElement(card) {
        return this.manager.getCardElement(card);
    }
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    canAddCard(card, settings) {
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
    addCard(card, animation, settings) {
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
            this.removeSelectionClassesFromElement(cardElement);
            originStock.unselectCard(card);
        }
        const animationSettings = animation !== null && animation !== void 0 ? animation : {};
        if (originStock) { // if the card is in a Stock, the animation must come from it
            animationSettings.fromStock = originStock;
        }
        const addCardSettings = settings !== null && settings !== void 0 ? settings : {};
        const index = this.getNewCardIndex(card);
        if (index !== undefined) {
            addCardSettings.index = index;
        }
        if (addCardSettings.index !== null && addCardSettings.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        let promise = cardElement ?
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
            promise.then(() => { var _a; return this.setSelectableCard(card, (_a = addCardSettings.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        this.cardNumberUpdated();
        return promise;
    }
    addExistingCardElement(card, cardElement, animation, settings) {
        var _a, _b, _c;
        const toElement = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        let insertBefore = undefined;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !toElement.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= toElement.children.length) {
        }
        else {
            insertBefore = toElement.children[settings.index];
        }
        const promise = this.animationFromElement(card, cardElement, (_c = (_b = animation.fromStock) === null || _b === void 0 ? void 0 : _b.element) !== null && _c !== void 0 ? _c : animation.fromElement, toElement, insertBefore, animation, settings);
        return promise;
    }
    addUnexistingCardElement(card, animation, settings) {
        var _a;
        let initialSide = settings === null || settings === void 0 ? void 0 : settings.initialSide;
        if (!['front', 'back'].includes(initialSide)) { // unset or invalid value
            // if the card comes from a stock but is not found in this stock, the card is probably hidden (deck with a fake top card)
            if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && !((_a = animation === null || animation === void 0 ? void 0 : animation.fromStock) === null || _a === void 0 ? void 0 : _a.contains(card))) {
                initialSide = 'back';
            }
            else {
                initialSide = this.manager.isCardVisible(card) ? 'front' : 'back';
            }
        }
        const cardElement = this.manager.createCardElement(card, initialSide);
        return this.addExistingCardElement(card, cardElement, animation, settings);
    }
    getNewCardIndex(card) {
        if (this.sort) {
            const otherCards = this.getCards();
            for (let i = 0; i < otherCards.length; i++) {
                const otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    }
    addCardElementToParent(cardElement, settings) {
        var _a;
        const parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
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
    addCards(cards, animation, settings, shift = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.manager.game.bgaAnimationsActive()) {
                shift = false;
            }
            let promises = [];
            if (shift === true) {
                if (cards.length) {
                    const result = yield this.addCard(cards[0], animation, settings);
                    const others = yield this.addCards(cards.slice(1), animation, settings, shift);
                    return result || others;
                }
            }
            else if (typeof shift === 'number') {
                for (let i = 0; i < cards.length; i++) {
                    promises.push(new Promise(resolve => {
                        setTimeout(() => this.addCard(cards[i], animation, settings).then(result => resolve(result)), i * shift);
                    }));
                }
            }
            else {
                promises = cards.map(card => this.addCard(card, animation, settings));
            }
            const results = yield Promise.all(promises);
            return results.some(result => result);
        });
    }
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    removeCard(card, settings) {
        let promise;
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            promise = this.manager.removeCard(card, settings);
        }
        else {
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
    cardRemoved(card, settings) {
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
    removeCards(cards, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = cards.map(card => this.removeCard(card, settings));
            const results = yield Promise.all(promises);
            return results.some(result => result);
        });
    }
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    removeAll(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            const cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
            return this.removeCards(cards, settings);
        });
    }
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    setSelectionMode(selectionMode, selectableCards) {
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(card => this.setSelectableCard(card, selectionMode != 'none'));
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(card => this.removeSelectionClasses(card));
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    }
    setSelectableCard(card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        const element = this.getCardElement(card);
        const selectableCardsClass = this.getSelectableCardClass();
        const unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.querySelectorAll('.card-side').forEach(cardSideDiv => cardSideDiv.classList.toggle(selectableCardsClass, selectable));
        }
        if (unselectableCardsClass) {
            element === null || element === void 0 ? void 0 : element.querySelectorAll('.card-side').forEach(cardSideDiv => cardSideDiv.classList.toggle(unselectableCardsClass, !selectable));
        }
        const index = this.selectableCards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
        if (selectable) {
            if (index === -1) {
                this.selectableCards.push(card);
            }
        }
        else {
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
    setSelectableCards(selectableCards) {
        if (this.selectionMode === 'none') {
            return;
        }
        this.selectableCards = selectableCards;
        const selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(card => this.manager.getId(card));
        this.cards.forEach(card => this.setSelectableCard(card, selectableCardsIds.includes(this.manager.getId(card))));
    }
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    selectCard(card, silent = false) {
        var _a;
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
        element === null || element === void 0 ? void 0 : element.querySelectorAll('.card-side').forEach(cardSideDiv => {
            cardSideDiv.classList.remove(selectableCardsClass);
            cardSideDiv.classList.add(selectedCardsClass);
        });
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    }
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    unselectCard(card, silent = false) {
        var _a;
        const element = this.getCardElement(card);
        const selectable = this.selectableCards.some(c => this.manager.getId(c) == this.manager.getId(card));
        const selectableCardsClass = this.getSelectableCardClass();
        const selectedCardsClass = this.getSelectedCardClass();
        element === null || element === void 0 ? void 0 : element.querySelectorAll('.card-side').forEach(cardSideDiv => {
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
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    }
    /**
     * Select all cards
     */
    selectAll(silent = false) {
        var _a;
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(c => this.selectCard(c, true));
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    }
    /**
     * Unselect all cards
     */
    unselectAll(silent = false) {
        var _a;
        const cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(c => this.unselectCard(c, true));
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    }
    bindClick() {
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', event => {
            const cardDiv = event.target.closest('.card');
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
    cardClick(card) {
        var _a;
        if (this.selectionMode != 'none') {
            const alreadySelected = this.selectedCards.some(c => this.manager.getId(c) == this.manager.getId(card));
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    }
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param toElement The HTMLElement to attach the card to.
     */
    animationFromElement(card, element, fromElement, toElement, insertBefore, animation, settings) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (document.contains(element)) {
                const result = yield this.manager.animationManager.slideAndAttach(element, toElement, animation, insertBefore);
                return (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false;
            }
            else {
                this.manager.animationManager.base.attachToElement(element, toElement, insertBefore);
                let result = null;
                if (!animation.fromStock || settings.fadeIn) {
                    result = yield this.manager.animationManager.fadeIn(element, fromElement, animation);
                }
                else {
                    result = yield this.manager.animationManager.slideIn(element, fromElement, animation);
                }
                return (_b = result === null || result === void 0 ? void 0 : result.played) !== null && _b !== void 0 ? _b : false;
            }
        });
    }
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    setCardVisible(card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    }
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    flipCard(card, settings) {
        this.manager.flipCard(card, settings);
    }
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    getSelectableCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    }
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    getUnselectableCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    }
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    getSelectedCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    }
    removeSelectionClasses(card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    }
    removeSelectionClassesFromElement(cardElement) {
        const selectableCardsClass = this.getSelectableCardClass();
        const unselectableCardsClass = this.getUnselectableCardClass();
        const selectedCardsClass = this.getSelectedCardClass();
        cardElement === null || cardElement === void 0 ? void 0 : cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    }
    /**
     * Changes the sort function of the stock.
     *
     * @param sort the new sort function. If defined, the stock will be sorted with this new function.
     */
    setSort(sort) {
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
    createCounter(counterPosition, extraClasses, hideWhenEmpty, counterId) {
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
        if (hideWhenEmpty !== null && hideWhenEmpty !== void 0 ? hideWhenEmpty : false) {
            this.counterDiv.classList.add('hide-when-empty');
        }
        this.element.appendChild(this.counterDiv);
    }
    /**
     * Updates the cards number, if the counter is visible.
     */
    cardNumberUpdated() {
        var _a;
        const cardNumber = this.cards.length;
        this.element.style.setProperty('--tile-count', '' + cardNumber);
        this.element.dataset.empty = (cardNumber == 0).toString();
        (_a = this.onCardCountChange) === null || _a === void 0 ? void 0 : _a.call(this, cardNumber);
        if (this.counterDiv) {
            this.counterDiv.innerHTML = `${cardNumber}`;
        }
    }
}
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
class Deck extends CardStock {
    constructor(manager, element, settings) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        element.classList.add('deck');
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        }
        else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        this.fakeCardGenerator = (_a = settings === null || settings === void 0 ? void 0 : settings.fakeCardGenerator) !== null && _a !== void 0 ? _a : manager.getFakeCardGenerator();
        this.thicknesses = (_b = settings.thicknesses) !== null && _b !== void 0 ? _b : [0, 2, 5, 10, 20, 30];
        this.setCardNumber((_c = settings.cardNumber) !== null && _c !== void 0 ? _c : 0);
        this.autoUpdateCardNumber = (_d = settings.autoUpdateCardNumber) !== null && _d !== void 0 ? _d : true;
        this.autoRemovePreviousCards = (_e = settings.autoRemovePreviousCards) !== null && _e !== void 0 ? _e : true;
        const shadowDirection = (_f = settings.shadowDirection) !== null && _f !== void 0 ? _f : 'bottom-right';
        const shadowDirectionSplit = shadowDirection.split('-');
        const xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        const yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            this.addCard(settings.topCard);
        }
        else if (settings.cardNumber > 0) {
            this.addCard(this.getFakeCard());
        }
        if (settings.counter && ((_g = settings.counter.show) !== null && _g !== void 0 ? _g : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                console.warn(`Deck card counter created without a cardNumber`);
            }
        }
    }
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    getCardNumber() {
        return this.cardNumber;
    }
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
     */
    setCardNumber(cardNumber, topCard = undefined) {
        var _a;
        let promise = Promise.resolve(false);
        const oldTopCard = this.getTopCard();
        if (topCard !== null && cardNumber > 0) {
            const newTopCard = topCard || this.getFakeCard();
            if (!oldTopCard || this.manager.getId(newTopCard) != this.manager.getId(oldTopCard)) {
                promise = this.addCard(newTopCard, undefined, { autoUpdateCardNumber: false });
            }
        }
        else if (cardNumber == 0 && oldTopCard) {
            promise = this.removeCard(oldTopCard, { autoUpdateCardNumber: false });
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        let thickness = 0;
        this.thicknesses.forEach((threshold, index) => {
            if (this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', `${thickness}px`);
        if (this.counterDiv) {
            this.counterDiv.innerHTML = `${cardNumber}`;
        }
        (_a = this.onCardCountChange) === null || _a === void 0 ? void 0 : _a.call(this, cardNumber);
        return promise;
    }
    addCard(card, animation, settings) {
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1, null);
        }
        const promise = super.addCard(card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(() => {
                const previousCards = this.getCards().slice(0, -1); // remove last cards
                this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    }
    cardRemoved(card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        super.cardRemoved(card, settings);
    }
    removeAll(settings) {
        const _super = Object.create(null, {
            removeAll: { get: () => super.removeAll }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const promise = _super.removeAll.call(this, Object.assign(Object.assign({}, settings), { autoUpdateCardNumber: (_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : false }));
            if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _b !== void 0 ? _b : true) {
                this.setCardNumber(0, null);
            }
            return promise;
        });
    }
    getTopCard() {
        const cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    }
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    shuffle(settings) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const animatedCardsMax = (_a = settings === null || settings === void 0 ? void 0 : settings.animatedCardsMax) !== null && _a !== void 0 ? _a : 8;
            this.addCard((_b = settings === null || settings === void 0 ? void 0 : settings.newTopCard) !== null && _b !== void 0 ? _b : this.getFakeCard(), undefined, { autoUpdateCardNumber: false });
            if (!this.manager.game.bgaAnimationsActive()) {
                return Promise.resolve(false); // we don't execute as it's just visual temporary stuff
            }
            const animatedCards = Math.min(8, animatedCardsMax, this.getCardNumber());
            if (animatedCards > 1) {
                const elements = [this.getCardElement(this.getTopCard())];
                const getFakeCard = (uid) => {
                    let newCard;
                    if (settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter) {
                        newCard = {};
                        settings === null || settings === void 0 ? void 0 : settings.fakeCardSetter(newCard, uid);
                    }
                    else {
                        newCard = this.fakeCardGenerator(`${this.element.id}-shuffle-${uid}`);
                    }
                    return newCard;
                };
                let uid = 0;
                for (let i = elements.length; i <= animatedCards; i++) {
                    let newCard;
                    do {
                        newCard = getFakeCard(uid++);
                    } while (this.manager.getCardElement(newCard)); // To make sure there isn't a fake card remaining with the same uid
                    const newElement = this.manager.createCardElement(newCard, 'back');
                    newElement.dataset.tempCardForShuffleAnimation = 'true';
                    this.element.prepend(newElement);
                    elements.push(newElement);
                }
                yield this.manager.animationManager.playInterval(elements.map(element => {
                    // all directions
                    //const distance = (this.manager.getCardWidth() + this.manager.getCardHeight()) / 2;
                    //const angle = Math.random() * Math.PI * 2;
                    //const x = distance * Math.cos(angle);
                    //const y = distance * Math.sin(angle);
                    // to bottom
                    const distance = this.manager.getCardHeight() / 2;
                    const x = 0;
                    const y = distance;
                    const r = -15 + Math.random() * 30;
                    const parallelAnimations = [
                        {
                            keyframes: [{
                                    transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
                                    offset: 0.5
                                }],
                        }
                    ];
                    return () => this.manager.animationManager.slideIn(element, undefined, { parallelAnimations, duration: 1000 });
                }), 80);
                elements.filter(element => element.dataset.tempCardForShuffleAnimation === 'true').forEach(element => element === null || element === void 0 ? void 0 : element.remove());
                const pauseDelayAfterAnimation = (_c = settings === null || settings === void 0 ? void 0 : settings.pauseDelayAfterAnimation) !== null && _c !== void 0 ? _c : 500;
                if (pauseDelayAfterAnimation > 0) {
                    yield this.manager.game.wait(pauseDelayAfterAnimation);
                }
                return true;
            }
            else {
                return Promise.resolve(false);
            }
        });
    }
    getFakeCard() {
        return this.fakeCardGenerator(this.element.id);
    }
}
/**
 * A basic stock for a list of cards, based on flex.
 */
class LineStock extends CardStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    constructor(manager, element, settings) {
        var _a, _b, _c, _d;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        element.classList.add('line-stock');
        element.dataset.center = ((_a = settings === null || settings === void 0 ? void 0 : settings.center) !== null && _a !== void 0 ? _a : true).toString();
        element.style.setProperty('--wrap', (_b = settings === null || settings === void 0 ? void 0 : settings.wrap) !== null && _b !== void 0 ? _b : 'wrap');
        element.style.setProperty('--direction', (_c = settings === null || settings === void 0 ? void 0 : settings.direction) !== null && _c !== void 0 ? _c : 'row');
        element.style.setProperty('--gap', (_d = settings === null || settings === void 0 ? void 0 : settings.gap) !== null && _d !== void 0 ? _d : '8px');
    }
}
/**
 * A stock with fixed slots (some can be empty)
 */
class SlotStock extends LineStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(manager, element, settings) {
        var _a, _b;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        this.slotsIds = [];
        this.slots = [];
        this.selectedSlots = [];
        this.slotSelectionMode = 'none';
        if (!settings.mapCardToSlot) {
            throw new Error('You need to define SlotStock settings.mapCardToSlot to use SlotStock');
        }
        element.classList.add('slot-stock');
        this.mapCardToSlot = settings.mapCardToSlot;
        this.slotsIds = (_a = settings.slotsIds) !== null && _a !== void 0 ? _a : [];
        this.slotClasses = (_b = settings.slotClasses) !== null && _b !== void 0 ? _b : [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }
    createSlot(slotId) {
        if (this.slots[slotId]) {
            throw new Error(`The element for ${slotId} already exists`);
        }
        this.slots[slotId] = document.createElement("div");
        this.slots[slotId].dataset.slotId = slotId;
        this.element.appendChild(this.slots[slotId]);
        this.slots[slotId].classList.add(...['slot', ...this.slotClasses]);
        this.slots[slotId].addEventListener('click', () => {
            var _a;
            if (this.slotSelectionMode != 'none') {
                const alreadySelected = this.selectedSlots.includes(slotId);
                if (alreadySelected) {
                    this.unselectSlot(slotId);
                }
                else {
                    this.selectSlot(slotId);
                }
            }
            (_a = this.onSlotClick) === null || _a === void 0 ? void 0 : _a.call(this, slotId);
        });
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card, animation, settings) {
        var _a;
        const slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : this.mapCardToSlot(card);
        if (slotId === undefined) {
            throw new Error(`Impossible to add card to slot : no SlotId. Add slotId to settings or make sure mapCardToSlot return a valid slotId.`);
        }
        if (!this.slots[slotId]) {
            throw new Error(`Impossible to add card to slot "${slotId}" : slot "${slotId}" doesn't exists.`);
        }
        const newSettings = Object.assign(Object.assign({}, settings), { forceToElement: this.slots[slotId] });
        return super.addCard(card, animation, newSettings);
    }
    getSlotsIds() {
        return this.slotsIds;
    }
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    setSlotsIds(slotsIds) {
        if (slotsIds.length == this.slotsIds.length && slotsIds.every((slotId, index) => this.slotsIds[index] === slotId)) {
            // no change
            return;
        }
        this.removeAll();
        this.element.innerHTML = '';
        this.selectedSlots = [];
        this.slots = [];
        this.slotsIds = slotsIds !== null && slotsIds !== void 0 ? slotsIds : [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }
    removeSlot(slotId) {
        var _a;
        const removedCards = this.getCards().filter(card => this.mapCardToSlot(card) === slotId);
        this.removeCards(removedCards);
        (_a = this.slots[slotId]) === null || _a === void 0 ? void 0 : _a.remove();
        delete this.slots[slotId];
        this.slotsIds = this.slotsIds.filter(si => si !== slotId);
        this.selectedSlots = this.selectedSlots.filter(si => si !== slotId);
    }
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    addSlotsIds(newSlotsIds) {
        // ignore slotsIds we already have
        const filteredSlotsIds = newSlotsIds.filter(slotId => !this.slotsIds.includes(slotId));
        if (filteredSlotsIds.length == 0) {
            // no change
            return;
        }
        this.slotsIds.push(...filteredSlotsIds);
        filteredSlotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
    }
    /**
     * @returns the class to apply to selectable slots. Use class from manager is unset.
     */
    getSelectableSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableSlotClass) === undefined ? this.manager.getSelectableSlotClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableSlotClass;
    }
    /**
     * @returns the class to apply to selectable slots. Use class from manager is unset.
     */
    getUnselectableSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableSlotClass) === undefined ? this.manager.getUnselectableSlotClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableSlotClass;
    }
    /**
     * @returns the class to apply to selected slots. Use class from manager is unset.
     */
    getSelectedSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedSlotClass) === undefined ? this.manager.getSelectedSlotClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedSlotClass;
    }
    canAddCard(card, settings) {
        var _a;
        if (!this.contains(card)) {
            return true;
        }
        else {
            const closestSlot = this.getCardElement(card).closest('.slot');
            if (closestSlot) {
                const currentCardSlot = closestSlot.dataset.slotId;
                const slotId = (_a = settings === null || settings === void 0 ? void 0 : settings.slot) !== null && _a !== void 0 ? _a : this.mapCardToSlot(card);
                return currentCardSlot != slotId;
            }
            else {
                return true;
            }
        }
    }
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    swapCards(cards, settings) {
        const elements = cards.map(card => this.manager.getCardElement(card));
        cards.forEach((card, index) => {
            const cardElement = elements[index];
            const cardIndex = this.cards.findIndex(c => this.manager.getId(c) == this.manager.getId(card));
            if (cardIndex !== -1) {
                this.cards.splice(cardIndex, 1, card);
            }
            this.manager.updateCardInformations(card);
            this.removeSelectionClassesFromElement(cardElement);
        });
        const promise = this.manager.animationManager.swap(elements);
        cards.forEach((card, index) => {
            promise.then(() => {
                var _a;
                //this.manager.animationManager.base.attachToElement(cardElement, this.slots[slotId]);
                this.setSelectableCard(card, (_a = settings === null || settings === void 0 ? void 0 : settings.selectable) !== null && _a !== void 0 ? _a : true);
            });
        });
        return promise;
    }
    /**
     * Set if the stock slot are selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected slots.
     *
     * @param selectionMode the selection mode
     * @param selectableSlots the selectable slats (all if unset). Calls `setSelectableSlots` method
     */
    setSlotSelectionMode(selectionMode, selectableSlots) {
        if (selectionMode !== this.slotSelectionMode) {
            this.unselectAll(true);
        }
        this.slotsIds.forEach(slotId => this.setSelectableSlot(slotId, selectionMode != 'none'));
        this.element.classList.toggle('bga-cards_selectable-stock-slots', selectionMode != 'none');
        this.slotSelectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.slotsIds.forEach(slotId => this.removeSlotSelectionClasses(slotId));
        }
        else {
            this.setSelectableSlots(selectableSlots !== null && selectableSlots !== void 0 ? selectableSlots : this.slotsIds);
        }
    }
    removeSlotSelectionClasses(slotId) {
        this.removeSlotSelectionClassesFromElement(this.slots[slotId]);
    }
    removeSlotSelectionClassesFromElement(slotElement) {
        const selectableSlotsClass = this.getSelectableSlotClass();
        const unselectableSlotsClass = this.getUnselectableSlotClass();
        const selectedSlotsClass = this.getSelectedSlotClass();
        slotElement === null || slotElement === void 0 ? void 0 : slotElement.classList.remove(selectableSlotsClass, unselectableSlotsClass, selectedSlotsClass);
    }
    setSelectableSlot(slotId, selectable) {
        if (this.slotSelectionMode === 'none') {
            return;
        }
        const element = this.slots[slotId];
        const selectableSlotClass = this.getSelectableSlotClass();
        const unselectableSlotClass = this.getUnselectableSlotClass();
        if (selectableSlotClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(selectableSlotClass, selectable);
        }
        if (unselectableSlotClass) {
            element === null || element === void 0 ? void 0 : element.classList.toggle(unselectableSlotClass, !selectable);
        }
        if (!selectable && this.isSlotSelected(slotId)) {
            this.unselectSlot(slotId);
        }
    }
    /**
     * Set the selectable class for each slot.
     *
     * @param selectableSlots the selectable slots. If unset, all slots are marked selectable. Default unset.
     */
    setSelectableSlots(slotIds) {
        if (this.slotSelectionMode === 'none') {
            return;
        }
        this.slotsIds.forEach(slotId => this.setSelectableSlot(slotId, slotIds ? slotIds.includes(slotId) : true));
    }
    /**
     * Set selected state to a slot.
     *
     * @param slotId the slot to select
     */
    selectSlot(slotId) {
        var _a;
        if (this.slotSelectionMode == 'none') {
            return;
        }
        const element = this.slots[slotId];
        const selectableSlotsClass = this.getSelectableSlotClass();
        if (!element || !element.classList.contains(selectableSlotsClass)) {
            return;
        }
        if (this.slotSelectionMode === 'single') {
            this.slotsIds.filter(c => c !== slotId).forEach(c => this.unselectSlot(c));
        }
        const selectedSlotsClass = this.getSelectedSlotClass();
        element.classList.add(selectedSlotsClass);
        this.selectedSlots.push(slotId);
        (_a = this.onSlotSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedSlots.slice(), slotId);
    }
    /**
     * Set unselected state to a slot.
     *
     * @param slot the slot to unselect
     */
    unselectSlot(slotId) {
        var _a;
        const element = this.slots[slotId];
        const selectedSlotClass = this.getSelectedSlotClass();
        element === null || element === void 0 ? void 0 : element.classList.remove(selectedSlotClass);
        const index = this.selectedSlots.findIndex(c => c === slotId);
        if (index !== -1) {
            this.selectedSlots.splice(index, 1);
        }
        (_a = this.onSlotSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedSlots.slice(), slotId);
    }
    /**
     * Select all slots
     */
    selectAllSlots() {
        if (this.slotSelectionMode == 'none') {
            return;
        }
        this.slotsIds.forEach(slotId => this.selectSlot(slotId));
    }
    /**
     * Unselect all slots
     */
    unselectAllSlots() {
        this.slotsIds.forEach(slotId => this.unselectSlot(slotId));
    }
    /**
     * @returns the selected slots
     */
    getSlotSelection() {
        return this.selectedSlots.slice();
    }
    /**
     * @returns if the slot is selectd
     */
    isSlotSelected(slotId) {
        return this.selectedSlots.includes(slotId);
    }
}
/**
 * A grid stock with fixed slots (some can be empty)
 */
class GridStock extends SlotStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `GridStockSettings` object
     */
    constructor(manager, element, settings) {
        var _a;
        super(manager, element, Object.assign(Object.assign({}, settings), { slotsIds: [], mapCardToSlot: card => this.getGridSlotId(settings.mapCardToCoordinates(card)) }));
        this.manager = manager;
        this.element = element;
        this.minX = null;
        this.minY = null;
        this.maxX = null;
        this.maxY = null;
        if (!settings.mapCardToCoordinates) {
            throw new Error('You need to define GridStock settings.mapCardToCoordinates to use GridStock');
        }
        element.classList.add('grid-stock');
        this.mapCardToCoordinates = settings.mapCardToCoordinates;
        if ((settings === null || settings === void 0 ? void 0 : settings.minX) !== undefined || (settings === null || settings === void 0 ? void 0 : settings.maxX) !== undefined || (settings === null || settings === void 0 ? void 0 : settings.minY) !== undefined || (settings === null || settings === void 0 ? void 0 : settings.maxY) !== undefined) {
            if (settings.minX === undefined || settings.maxX === undefined || settings.minY === undefined || settings.maxY === undefined) {
                throw new Error(`If you define a min or a max for GridStockSettings, you need to define all of them`);
            }
            if (settings.maxX < settings.minX) {
                throw new Error(`GridStockSettings: maxX must be superior or equal to minX`);
            }
            if (settings.maxY < settings.minY) {
                throw new Error(`GridStockSettings: maxX must be superior or equal to minX`);
            }
            this.minX = settings.minX;
            this.maxX = settings.maxX;
            this.minY = settings.minY;
            this.maxY = settings.maxY;
            for (let x = settings.minX; x <= settings.maxX; x++) {
                for (let y = settings.minY; y <= settings.maxY; y++) {
                    this.slotsIds.push(this.getGridSlotId({ x, y }));
                }
            }
        }
        this.slotClasses = (_a = settings.slotClasses) !== null && _a !== void 0 ? _a : [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
        this.updateGridTemplateAreas();
    }
    /**
     * Return the slotId based on the coordinates
     */
    getGridSlotId(coordinates) {
        return `${coordinates.x}_${coordinates.y}`;
    }
    createSlot(slotId) {
        super.createSlot(slotId);
        this.slots[slotId].style.setProperty('--area', `area_${slotId}`);
    }
    addCard(card, animation, settings) {
        var _a, _b;
        const coordinates = (_a = settings === null || settings === void 0 ? void 0 : settings.coordinates) !== null && _a !== void 0 ? _a : (_b = this.mapCardToCoordinates) === null || _b === void 0 ? void 0 : _b.call(this, card);
        this.makeSlotForCoordinates(coordinates);
        const slotSettings = Object.assign(Object.assign({}, settings), { slot: this.getGridSlotId(coordinates) });
        return super.addCard(card, animation, slotSettings);
    }
    /**
     * Expand the grid until a slot exists for the given coordinates.
     */
    makeSlotForCoordinates(coordinates) {
        if (this.minX === null) { // no slot yet
            this.minX = coordinates.x;
            this.maxX = coordinates.x;
            this.minY = coordinates.y;
            this.maxY = coordinates.y;
            const slotId = this.getGridSlotId(coordinates);
            if (!this.slotsIds.includes(slotId)) {
                this.addSlotsIds([slotId]);
            }
            return;
        }
        this.extendToX(coordinates.x);
        this.extendToY(coordinates.y);
    }
    /**
     * Expand the grid until slots exists for the given coordinates.
     */
    makeSlotsForCoordinates(coordinatesList) {
        coordinatesList.forEach(coordinates => this.makeSlotForCoordinates(coordinates));
    }
    getMinX() {
        return this.minX;
    }
    getMinY() {
        return this.minY;
    }
    getMaxX() {
        return this.maxX;
    }
    getMaxY() {
        return this.maxY;
    }
    /**
     * Expand the grid until slots exists for the given x.
     */
    extendToX(x) {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to extend the grid');
        }
        while (x < this.minX) {
            this.addColumnToTheLeft();
        }
        while (x > this.maxX) {
            this.addColumnToTheRight();
        }
    }
    /**
     * Expand the grid until slots exists for the given y.
     */
    extendToY(y) {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to extend the grid');
        }
        while (y < this.minY) {
            this.addRowToTheTop();
        }
        while (y > this.maxY) {
            this.addRowToTheBottom();
        }
    }
    /**
     * Must be called each time new slots are created.
     */
    updateGridTemplateAreas() {
        const linesAreas = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            const lineAreas = [];
            for (let x = this.minX; x <= this.maxX; x++) {
                lineAreas.push(`area_${x}_${y}`);
            }
            linesAreas.push(lineAreas.join(' '));
        }
        this.element.style.gridTemplateAreas = linesAreas.map(line => `"${line}"`).join(' ');
    }
    addSlotsIds(newSlotsIds) {
        super.addSlotsIds(newSlotsIds);
        this.updateGridTemplateAreas();
    }
    /**
     * Add slots to the left of the grid.
     */
    addColumnToTheLeft() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a column to the left');
        }
        this.minX = this.minX - 1;
        const newSlotsIds = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            newSlotsIds.push(`${this.minX}_${y}`);
        }
        this.addSlotsIds(newSlotsIds);
    }
    /**
     * Add slots to the right of the grid.
     */
    addColumnToTheRight() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a column to the right');
        }
        this.maxX = this.maxX + 1;
        const newSlotsIds = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            newSlotsIds.push(`${this.maxX}_${y}`);
        }
        this.addSlotsIds(newSlotsIds);
    }
    /**
     * Add slots to the top of the grid.
     */
    addRowToTheTop() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a row to the top');
        }
        this.minY = this.minY - 1;
        const newSlotsIds = [];
        for (let x = this.minX; x <= this.maxX; x++) {
            newSlotsIds.push(`${x}_${this.minY}`);
        }
        this.addSlotsIds(newSlotsIds);
    }
    /**
     * Add slots to the bottom of the grid.
     */
    addRowToTheBottom() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a row to the bottom');
        }
        this.maxY = this.maxY + 1;
        const newSlotsIds = [];
        for (let x = this.minX; x <= this.maxX; x++) {
            newSlotsIds.push(`${x}_${this.maxY}`);
        }
        this.addSlotsIds(newSlotsIds);
    }
    /**
     * Remove the slots on the leftmost column of the grid. Remove the cards in it if there are some.
     */
    removeLeftmostColumn() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove the leftmost column');
        }
        for (let y = this.minY; y <= this.maxY; y++) {
            this.removeSlot(`${this.minX}_${y}`);
        }
        this.minX = this.minX + 1;
        this.updateGridTemplateAreas();
    }
    /**
     * Remove the slots on the rightmost column of the grid. Remove the cards in it if there are some.
     */
    removeRightmostColumn() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove the rightmost column');
        }
        for (let y = this.minY; y <= this.maxY; y++) {
            this.removeSlot(`${this.maxX}_${y}`);
        }
        this.maxX = this.maxX - 1;
        this.updateGridTemplateAreas();
    }
    /**
     * Remove the slots on the top row of the grid. Remove the cards in it if there are some.
     */
    removeTopRow() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove a row to the top');
        }
        for (let x = this.minX; x <= this.maxX; x++) {
            this.removeSlot(`${x}_${this.minY}`);
        }
        this.minY = this.minY + 1;
        this.updateGridTemplateAreas();
    }
    /**
     * Remove the slots on the bottom row of the grid. Remove the cards in it if there are some.
     */
    removeBottomRow() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove a row to the bottom');
        }
        for (let x = this.minX; x <= this.maxX; x++) {
            this.removeSlot(`${x}_${this.maxY}`);
        }
        this.maxY = this.maxY - 1;
        this.updateGridTemplateAreas();
    }
    /**
     * Returns true if a grid slot already exists
     */
    gridSlotExists(coordinates) {
        return this.slotsIds.includes(this.getGridSlotId(coordinates));
    }
    setSelectableGridSlot(coordinates, selectable) {
        this.setSelectableSlot(this.getGridSlotId(coordinates), selectable);
    }
    setSelectableGridSlots(coordinates) {
        this.setSelectableSlots(coordinates === null || coordinates === void 0 ? void 0 : coordinates.map(coord => this.getGridSlotId(coord)));
    }
    setGridSlotSelectionMode(selectionMode, selectableCoordinates) {
        this.setSlotSelectionMode(selectionMode, selectableCoordinates === null || selectableCoordinates === void 0 ? void 0 : selectableCoordinates.map(coordinates => this.getGridSlotId(coordinates)));
    }
    /**
     * Remove all slots at the border (top/bottom lines and left/right columns) until there is no unnecessary space surrounding the cards.
     */
    removeEmptySurroundingSlots() {
        if (!this.slotsIds.length) {
            return;
        }
        if (!this.getCards().length) {
            this.setSlotsIds([]); // remove all
            return;
        }
        const cardsCoordinates = this.getCards().map(card => this.mapCardToCoordinates(card));
        const xs = cardsCoordinates.map(coordinates => coordinates.x);
        const ys = cardsCoordinates.map(coordinates => coordinates.y);
        const newMinX = Math.min(...xs);
        const newMaxX = Math.max(...xs);
        const newMinY = Math.min(...ys);
        const newMaxY = Math.max(...ys);
        while (newMinX > this.minX) {
            this.removeLeftmostColumn();
        }
        while (newMaxX < this.maxX) {
            this.removeRightmostColumn();
        }
        while (newMinY > this.minY) {
            this.removeTopRow();
        }
        while (newMaxY < this.maxY) {
            this.removeBottomRow();
        }
    }
}
/**
 * A stock with button to scroll left/right if content is bigger than available width
 */
class ScrollableStock extends CardStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(manager, elementWrapper, settings) {
        var _a, _b, _c, _d, _e;
        super(manager, elementWrapper, settings);
        this.manager = manager;
        elementWrapper.classList.add('scrollable-stock');
        elementWrapper.dataset.center = ((_a = settings.center) !== null && _a !== void 0 ? _a : true).toString();
        elementWrapper.style.setProperty('--button-gap', (_b = settings.buttonGap) !== null && _b !== void 0 ? _b : '0');
        elementWrapper.style.setProperty('--gap', (_c = settings.gap) !== null && _c !== void 0 ? _c : '8px');
        this.scrollStep = (_d = settings.scrollStep) !== null && _d !== void 0 ? _d : 100;
        elementWrapper.dataset.scrollbarVisible = ((_e = settings.scrollbarVisible) !== null && _e !== void 0 ? _e : true).toString();
        elementWrapper.appendChild(this.createButton('left', settings.leftButton));
        this.element = document.createElement('div');
        this.element.classList.add('scrollable-stock-inner');
        elementWrapper.appendChild(this.element);
        elementWrapper.appendChild(this.createButton('right', settings.rightButton));
    }
    createButton(side, settings) {
        var _a;
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add(side, ...((_a = settings.classes) !== null && _a !== void 0 ? _a : []));
        if (settings.html) {
            button.innerHTML = settings.html;
        }
        button.addEventListener('click', () => this.scroll(side));
        return button;
    }
    scroll(side) {
        this.element.scrollBy({
            left: this.scrollStep * (side === 'left' ? -1 : 1),
            behavior: 'smooth'
        });
    }
}
class HandStock extends CardStock {
    constructor(manager, element, settings) {
        var _a, _b, _c, _d;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        element.classList.add('hand-stock');
        element.style.setProperty('--card-overlap', (_a = settings.cardOverlap) !== null && _a !== void 0 ? _a : '60px');
        element.style.setProperty('--card-shift', (_b = settings.cardShift) !== null && _b !== void 0 ? _b : '15px');
        element.style.setProperty('--card-inclination', `${(_c = settings.inclination) !== null && _c !== void 0 ? _c : 12}deg`);
        this.inclination = (_d = settings.inclination) !== null && _d !== void 0 ? _d : 4;
    }
    addCard(card, animation, settings) {
        var _a, _b;
        const index = (_a = this.getNewCardIndex(card)) !== null && _a !== void 0 ? _a : this.cards.length;
        const addedCards = this.cards.slice();
        addedCards.splice(index, 0, card);
        const newCardMiddleIndex = this.getMiddleIndexes(addedCards)[index];
        const parallelAnimations = [
            { keyframes: [
                    { transform: `translateY(${Math.abs(newCardMiddleIndex) * ( /*Number(this.settings.cardShift) ??*/15)}px) rotate(${newCardMiddleIndex * ((_b = this.settings.inclination) !== null && _b !== void 0 ? _b : 12)}deg)`, offset: 1 }
                ] }
        ];
        let promise = super.addCard(card, Object.assign(Object.assign({}, animation), { parallelAnimations }), settings);
        this.updateAngles();
        return promise;
    }
    cardRemoved(card, settings) {
        super.cardRemoved(card, settings);
        this.updateAngles();
    }
    getMiddleIndexes(cards) {
        const middle = (cards.length - 1) / 2;
        return cards.map((card, index) => index - middle);
    }
    updateAngles(fakeIndex) {
        const middle = (this.cards.length - 1) / 2;
        this.cards.forEach((card, index) => {
            const middleIndex = index - middle;
            const cardElement = this.getCardElement(card);
            cardElement.style.setProperty('--hand-stock-middle-index', `${middleIndex}`);
            cardElement.style.setProperty('--hand-stock-middle-index-abs', `${Math.abs(middleIndex)}`);
        });
    }
}
/**
 * A stock with manually placed cards
 */
class ManualPositionStock extends CardStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager, element, settings, updateDisplay) {
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        this.updateDisplay = updateDisplay;
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
    addCard(card, animation, settings) {
        const promise = super.addCard(card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    }
    cardRemoved(card, settings) {
        super.cardRemoved(card, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
    }
}
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
class VoidStock extends CardStock {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager, element) {
        super(manager, element);
        this.manager = manager;
        this.element = element;
        element.classList.add('void-stock');
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card, animation, settings) {
        var _a;
        let promise = super.addCard(card, animation, settings);
        // center the element
        const cardElement = this.getCardElement(card);
        const originalLeft = cardElement.style.left;
        const originalTop = cardElement.style.top;
        cardElement.style.left = `${(this.element.clientWidth - cardElement.clientWidth) / 2}px`;
        cardElement.style.top = `${(this.element.clientHeight - cardElement.clientHeight) / 2}px`;
        if (!promise) {
            console.warn(`VoidStock.addCard didn't return a Promise`);
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(() => {
                return this.removeCard(card);
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    }
}
class AllVisibleDeck extends CardStock {
    constructor(manager, element, settings) {
        var _a, _b, _c, _d, _e;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        element.classList.add('all-visible-deck', (_a = settings.direction) !== null && _a !== void 0 ? _a : 'vertical');
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        }
        else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        element.style.setProperty('--vertical-shift', (_c = (_b = settings.verticalShift) !== null && _b !== void 0 ? _b : settings.shift) !== null && _c !== void 0 ? _c : '3px');
        element.style.setProperty('--horizontal-shift', (_e = (_d = settings.horizontalShift) !== null && _d !== void 0 ? _d : settings.shift) !== null && _e !== void 0 ? _e : '3px');
    }
    addCard(card, animation, settings) {
        let promise;
        const order = this.cards.length;
        promise = super.addCard(card, animation, settings);
        const cardId = this.manager.getId(card);
        const cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        return promise;
    }
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    setOpened(opened) {
        this.element.classList.toggle('opened', opened);
    }
    cardRemoved(card) {
        super.cardRemoved(card);
        this.cards.forEach((c, index) => {
            const cardId = this.manager.getId(c);
            const cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
    }
}
class DiscardDeck extends CardStock {
    constructor(manager, element, settings) {
        var _a, _b, _c;
        super(manager, element, settings);
        this.manager = manager;
        this.element = element;
        element.classList.add('discard-deck');
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        }
        else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        this.maxHorizontalShift = cardWidth * ((_a = settings === null || settings === void 0 ? void 0 : settings.maxHorizontalShift) !== null && _a !== void 0 ? _a : 5) / 100;
        this.maxVerticalShift = cardHeight * ((_b = settings === null || settings === void 0 ? void 0 : settings.maxVerticalShift) !== null && _b !== void 0 ? _b : 5) / 100;
        this.maxRotation = (_c = settings === null || settings === void 0 ? void 0 : settings.maxRotation) !== null && _c !== void 0 ? _c : 5;
        const margins = this.getMargins();
        element.style.setProperty('--discard-deck-horizontal-margin', `${margins.horizontalMargin}px`);
        element.style.setProperty('--discard-deck-vertical-margin', `${margins.verticalMargin}px`);
        /*if (settings.counter && (settings.counter.show ?? true)) {
            this.createCounter(settings.counter.position ?? 'bottom', settings.counter.extraClasses ?? 'round', settings.counter.counterId);

            if (settings.counter?.hideWhenEmpty) {
                this.element.querySelector('.bga-cards_card-counter').classList.add('hide-when-empty');
                this.element.dataset.empty = 'true';
            }
        }*/
    }
    getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * ((max + 1) - min) + min);
    }
    getMargins() {
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        const radians = (Math.PI / 180) * this.maxRotation; // Convert degrees to radians
        const maxWidth = Math.abs(cardWidth * Math.cos(radians)) + Math.abs(cardHeight * Math.sin(radians));
        const MaxHeight = Math.abs(cardWidth * Math.sin(radians)) + Math.abs(cardHeight * Math.cos(radians));
        const horizontalMargin = this.maxHorizontalShift + Math.ceil((maxWidth - cardWidth) / 2);
        const verticalMargin = this.maxVerticalShift + Math.ceil((MaxHeight - cardHeight) / 2);
        return { horizontalMargin, verticalMargin };
    }
    addCard(card, animation, settings) {
        let promise;
        promise = super.addCard(card, animation, settings);
        const cardId = this.manager.getId(card);
        const cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--discard-deck-left', `${this.getRandomArbitrary(-this.maxHorizontalShift, this.maxHorizontalShift)}px`);
        cardDiv.style.setProperty('--discard-deck-top', `${this.getRandomArbitrary(-this.maxVerticalShift, this.maxVerticalShift)}px`);
        cardDiv.style.setProperty('--discard-deck-rotate', `${this.getRandomArbitrary(-this.maxRotation, this.maxRotation)}deg`);
        return promise;
    }
}
class CardManager {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    constructor(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateMainTimeoutId = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    addStock(stock) {
        this.stocks.push(stock);
    }
    removeStock(stock) {
        const index = this.stocks.indexOf(stock);
        if (index !== -1) {
            this.stocks.splice(index, 1);
        }
    }
    /**
     * @param card the card informations
     * @return the id for a card
     */
    getId(card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : `card-${card.id}`;
    }
    createCardElement(card, initialSide = 'auto') {
        var _a, _b, _c, _d, _e, _f;
        const id = this.getId(card);
        const side = ['front', 'back'].includes(initialSide) ? initialSide : (this.isCardVisible(card) ? 'front' : 'back'); // to apply auto & ignore invalid values
        const rotation = this.getCardRotation(card);
        const lying = rotation % 2 === 1;
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        const element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.style.setProperty('--bga-cards_card-width', `${this.getCardWidth()}px`);
        element.style.setProperty('--bga-cards_card-height', `${this.getCardHeight()}px`);
        element.style.setProperty('--bga-cards_card-effective-width', `${lying ? this.getCardHeight() : this.getCardWidth()}px`);
        element.style.setProperty('--bga-cards_card-effective-height', `${lying ? this.getCardWidth() : this.getCardHeight()}px`);
        element.style.setProperty('--bga-cards_card-rotation', `${rotation * 90}deg`);
        element.style.setProperty('--bga-cards_card-border-radius', `${this.getCardBorderRadius()}`);
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
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    }
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    getCardElement(card) {
        return document.getElementById(this.getId(card));
    }
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    removeCard(card, settings) {
        var _a;
        const id = this.getId(card);
        const div = document.getElementById(id);
        if (!div) {
            return Promise.resolve(false);
        }
        div.id = `deleted${id}`;
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return Promise.resolve(true);
    }
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    getCardStock(card) {
        return this.stocks.find(stock => stock.contains(card));
    }
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    isCardVisible(card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    }
    /** TODOGBA
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    getCardRotation(card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getCardRotation) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : 0;
    }
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    setCardVisible(card, visible, settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const element = this.getCardElement(card);
        if (!element) {
            return;
        }
        const isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        const stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateMain) !== null && _a !== void 0 ? _a : false) {
            if (this.updateMainTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateMainTimeoutId[stringId]);
                delete this.updateMainTimeoutId[stringId];
            }
            const updateMainDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateMainDelay) !== null && _b !== void 0 ? _b : 0;
            if (isVisible && updateMainDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateMainTimeoutId[stringId] = setTimeout(() => { var _a, _b; return (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element); }, updateMainDelay);
            }
            else {
                (_d = (_c = this.settings).setupDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _e !== void 0 ? _e : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            const updateFrontDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _f !== void 0 ? _f : 500;
            if (!isVisible && updateFrontDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(() => { var _a, _b; return (_b = (_a = this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_h = (_g = this.settings).setupFrontDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _j !== void 0 ? _j : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            const updateBackDelay = (_k = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _k !== void 0 ? _k : 0;
            if (isVisible && updateBackDelay > 0 && this.game.bgaAnimationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(() => { var _a, _b; return (_b = (_a = this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_m = (_l = this.settings).setupBackDiv) === null || _m === void 0 ? void 0 : _m.call(_l, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_o = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _o !== void 0 ? _o : true) {
            // card data has changed
            const stock = this.getCardStock(card);
            const cards = stock.getCards();
            const cardIndex = cards.findIndex(c => this.getId(c) === this.getId(card));
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    }
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    flipCard(card, settings) {
        const element = this.getCardElement(card);
        const currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    }
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    updateCardInformations(card, settings) {
        const newSettings = Object.assign(Object.assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
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
    getCardWidth() {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    }
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    getCardHeight() {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    }
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    getCardBorderRadius() {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardBorderRadius;
    }
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    getSelectableCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    }
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    getUnselectableCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    }
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    getSelectedCardClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    }
    /**
     * @returns the class to apply to selectable slots. Default 'bga-cards_selectable-slot'.
     */
    getSelectableSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableSlotClass) === undefined ? 'bga-cards_selectable-slot' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableSlotClass;
    }
    /**
     * @returns the class to apply to selectable slots. Default 'bga-cards_disabled-slot'.
     */
    getUnselectableSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableSlotClass) === undefined ? 'bga-cards_disabled-slot' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableSlotClass;
    }
    /**
     * @returns the class to apply to selected slots. Default 'bga-cards_selected-slot'.
     */
    getSelectedSlotClass() {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedSlotClass) === undefined ? 'bga-cards_selected-slot' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedSlotClass;
    }
    getFakeCardGenerator() {
        var _a, _b;
        return (_b = (_a = this.settings) === null || _a === void 0 ? void 0 : _a.fakeCardGenerator) !== null && _b !== void 0 ? _b : (deckId => ({ id: this.getId({ id: `${deckId}-fake-top-card` }) }));
    }
}
