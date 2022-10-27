let cardsManager;
let lineStock;
let slotStock;
let hiddenDeck;
let visibleDeck;
let allVisibleDeck;

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

function initSlotStock() {
    slotStock = new SlotStock(cardsManager, document.getElementById('slot-stock'), {
        slotsIds: ['A', 'B', 'C'],
        slotClasses: ['mygame-slot'],
        mapCardToSlot: (card) => card.location,
    });

    // add cards
    slotStock.addCards([
        { id: 1, type: 3, type_arg: 2, location: 'A', location_arg: 0 },
        { id: 2, type: 3, type_arg: 5, location: 'C', location_arg: 0 },
    ]);
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

function initAllVisibleDeck() {
    allVisibleDeck = new AllVisibleDeck(cardsManager, document.getElementById('all-visible-deck'), {
        width: '100px',
        height: '150px',
        shift: '5px',
    });
    allVisibleDeck.addCards([
        { id: 6, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 7, type: 3, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 8, type: 3, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function setAllVisibleDeckOpen(opened) {
    allVisibleDeck.setOpened(opened);
}

function init() {
    initManager();
    initLineStock();
    initSlotStock();
    initHiddenDeck();
    initVisibleDeck();
    initAllVisibleDeck();
};