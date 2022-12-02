let hiddenDeck;
let visibleDeck;
let allVisibleDeck;

function initHiddenDeck() {
    hiddenDeck = new HiddenDeck(cardsManager, document.getElementById('hidden-deck'), {
        width: 100,
        height: 150,
        cardNumber: 5,
    });
}

function setHiddenDeckCardNumber(cardNumber) {
    hiddenDeck.setCardNumber(cardNumber);
}

function initVisibleDeck() {
    visibleDeck = new VisibleDeck(cardsManager, document.getElementById('visible-deck'), {
        width: 100,
        height: 150,
        cardNumber: 5,
    });
    visibleDeck.addCard(
        { id: getCardId(), type: 2, type_arg: 3, location: 'table', location_arg: 0 },
    );
}

function setVisibleDeckCardNumber(cardNumber) {
    visibleDeck.setCardNumber(cardNumber);
}

function initAllVisibleDeck() {
    allVisibleDeck = new AllVisibleDeck(cardsManager, document.getElementById('all-visible-deck'), {
        width: '100px',
        height: '150px',
        shift: '8px',
    });
    allVisibleDeck.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function setAllVisibleDeckOpen(opened) {
    allVisibleDeck.setOpened(opened);
}
