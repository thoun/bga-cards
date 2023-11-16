let hiddenDeck;
let visibleDeck;
let allVisibleDeck;

function initHiddenDeck() {
    hiddenDeck = new Deck(cardsManager, document.getElementById('hidden-deck'), {
        cardNumber: 5,
        counter: {
            position: 'center',
            extraClasses: 'text-shadow',
        },
        // fakeCardGenerator: deckId => ({ id: `${deckId}-visible-fake-card`, type: 2, type_arg: 3, location: 'table', location_arg: 0 }),
    });
}

function removeAllFromDeck() {
    hiddenDeck.removeAll();
}

function setHiddenDeckCardNumber(cardNumber) {
    hiddenDeck.setCardNumber(cardNumber);
}

function addCardToHiddenDeck(visible) {
    if (lineStock.isEmpty()) {
        throw new Error('no card in LineStock');
    }

    let card = lineStock.getCards()[0];
    if (!visible) {
        card = { id: card.id };
    } 
    hiddenDeck.addCard(card);
}

function addCardFromHiddenDeck() {
    const topCard = hiddenDeck.getTopCard();
    if (!topCard) {
        return;
    }
    lineStock.addCard(
        topCard.type && String(topCard.id).indexOf('fake-card') === -1 ? topCard : { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 }, 
        { fromStock: hiddenDeck },
    )
}

function shuffleDeck() {
    hiddenDeck.shuffle();
}

function initVisibleDeck() {
    visibleDeck = new Deck(cardsManager, document.getElementById('visible-deck'), {
        cardNumber: 5,
        topCard: { id: getCardId(), type: 2, type_arg: 3, location: 'table', location_arg: 0 },
        counter: {
            hideWhenEmpty: true,
        },
    });
}

function setVisibleDeckCardNumber(cardNumber) {
    visibleDeck.setCardNumber(cardNumber);
}

function initAllVisibleDeck() {
    allVisibleDeck = new AllVisibleDeck(cardsManager, document.getElementById('all-visible-deck'), {
        shift: '8px',
        //verticalShift: '0px',
        //horizontalShift: '10px',
        //direction: 'horizontal',
        counter: {
            hideWhenEmpty: true,
        },
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
