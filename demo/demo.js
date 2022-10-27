let cardsManager;
let lineStock;
let hiddenDeck;
let visibleDeck;

let game = {
    addTooltipHtml: (divId, tooltip) => { document.getElementById(divId).title = tooltip },
};

function initManager() {
    cardsManager = new CardManager(game, {
        getId: (card) => `card-${card.id}`,
        setupDiv: (card, div) => {
            div.classList.add('mygame-card');
        },
        setupFrontDiv: (card, div) => {
            div.classList.add('mygame-card-front');
            div.style.background = 'white';
            div.innerHTML = `
                <div class="type">card type = ${card.type}</div>
                <div>card type_arg = ${card.type_arg}</div>
            `;
            div.id = `card-${card.id}-front`;
            game.addTooltipHtml(div.id, `tooltip de ${card.type}`);
        },
        setupBackDiv: (card, div) => {
            div.classList.add('mygame-card-back');
        },
    });
}

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'));
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => document.getElementById('line-stock-last-selection-change').innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`

    // add cards
    lineStock.addCards([
        { id: 3, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 4, type: 3, type_arg: 5, location: 'table', location_arg: 0 },
    ]);
}

function addCardToLineStockWithAnimation(fromElement, customAnimation) {
    const animationSettings = {
        fromElement: fromElement,
        originalSide: 'back'
    };

    if (customAnimation) {
        animationSettings.animation = stockSlideWithDoubleLoopAnimation;
    }

    lineStock.addCard(
        { id: new Date().getTime(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        animationSettings
    );
}

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
        { id: 5, type: 2, type_arg: 3, location: 'table', location_arg: 0 },
    );
}

function setVisibleDeckCardNumber(cardNumber) {
    visibleDeck.setCardNumber(cardNumber);
}

function init() {
    initManager();
    initLineStock();
    initHiddenDeck();
    initVisibleDeck();
};