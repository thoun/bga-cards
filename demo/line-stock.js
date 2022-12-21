let lineStock;
let lineStockOverlap;
let lineStockVerticalOverlap;

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'), {
        sort: sortFunction('type', 'type_arg')
    });
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => document.getElementById('line-stock-last-selection-change').innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`

    // add cards
    lineStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
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
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 },
        animationSettings
    );
}

function initLineStockOverlap() {
    lineStockOverlap = new LineStock(cardsManager, document.getElementById('line-stock-overlap'));

    // add cards
    lineStockOverlap.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function initLineStockVerticalOverlap() {
    lineStockVerticalOverlap = new LineStock(cardsManager, document.getElementById('line-stock-vertical-overlap'), {
        direction: 'column',
    });

    // add cards
    lineStockVerticalOverlap.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}