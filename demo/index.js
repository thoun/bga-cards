let lineStock;
let hiddenDeck;

let tokenHiddenStock;
let tokenRevealedStock;
let token;

// cards

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'), {
        sort: sortFunction('type', 'type_arg')
    });
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => {
        logDiv = document.getElementById('line-stock-last-selection-change');
        if (logDiv) {
            logDiv.innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`;
        }
    }

    // add cards
    lineStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 9, location: 'table', location_arg: 0 },
    ]);
}

function initHiddenDeck() {
    hiddenDeck = new Deck(cardsManager, document.getElementById('hidden-deck'), {
        cardNumber: 49,
        counter: {
            position: 'center',
            extraClasses: 'text-shadow',
        }
    });
}

function pickCard() {
    let cardNumber = hiddenDeck.getCardNumber();

    if (cardNumber >= 1) {
        const topCard = { id: getCardId() };
        topCard.type = 1 + Math.floor(Math.random() * 4);
        topCard.type_arg = 1 + Math.floor(Math.random() * 12);
        lineStock.addCard(topCard, { fromStock: hiddenDeck });
    }
}

function reformDeck() {
    hiddenDeck.addCards(lineStock.getCards().map(card => ({ id: card.id, })));
}

function dealCards(oneByOne) {
    let cardNumber = hiddenDeck.getCardNumber();

    if (cardNumber >= 4) {
        const cards = [];
        for (let i=0; i<4; i++) {
            cards.push({ id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 12), location: 'table', location_arg: 0 });
        }

        lineStock.addCards(cards, { fromStock: hiddenDeck }, undefined, oneByOne ? true : 100);
    }
}

function shuffle() {
    hiddenDeck.shuffle().then(() => console.log('shuffle ended'));
}

// tokens

function initTokens() {
    token = { id: getTokenId() };

    const slotSettings = {
        slotsIds: [1],
        slotClasses: ['token-slot'],
        mapCardToSlot: () => 1,
 }

    tokenHiddenStock = new SlotStock(tokensManager, document.getElementById('token-hidden-stock'), slotSettings);
    tokenRevealedStock = new SlotStock(tokensManager, document.getElementById('token-revealed-stock'), slotSettings);
    tokenHiddenStock.addCard(token);
}

function revealToken() {
    if (tokensManager.getCardStock({ id: token.id }) == tokenHiddenStock) {
        token.number = 1 + Math.floor(Math.random() * 4);
        tokenRevealedStock.addCard(token);
    }
}

function hideToken() {
    if (tokensManager.getCardStock({ id: token.id }) == tokenRevealedStock) {
        token.number = undefined;
        tokenHiddenStock.addCard(token);
    }
}
