let lineStock;
let lineStockOverlap;
let lineStockVerticalOverlap;

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'), {
        sort: sortFunction('type', 'type_arg')
    });
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => {
        logDiv = document.getElementById('line-stock-last-selection-change');
        if (logDiv) {
            logDiv.innerHTML = `<br>selection = ${JSON.stringify(selection)},<br>lastChange = ${JSON.stringify(lastChange)}`;
        }
    };
    lineStock.onCardClick = (card) => {
        logDiv = document.getElementById('line-stock-last-click');
        if (logDiv) {
            logDiv.innerHTML = `<br>clicked card = ${JSON.stringify(card)}`;
        }
    };

    // add cards
    lineStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 2, type_arg: 12, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 9, location: 'table', location_arg: 0 },
    ]);
}

function selectionTypeChange(type) {
    lineStock.setSelectionMode(type);
}

function setSelectableCards(all) {
    lineStock.setSelectableCards(lineStock.getCards().filter((card, index) => all ? true : index % 2));
}

function addCardToLineStockWithAnimation(fromElement, customAnimation) {
    const animationSettings = {
        fromElement: fromElement,
        originalSide: 'back'
    };

    if (customAnimation) {
        animationSettings.animation = new BgaAnimation(stockSlideWithDoubleLoopAnimation, {});
    }

    lineStock.addCard(
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 },
        animationSettings
    );
}

function addCardToLineStockFromVoidStock() {
    const card = { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0 }
    voidStock.addCard({ id: card.id }, undefined, { remove: false, });
    lineStock.addCard(card);
}

function setSortFunction(type) {
    if (type === 'color') {
        lineStock.setSort(sortFunction('type', 'type_arg'))
    } else if (type === 'number') {
        lineStock.setSort(sortFunction('type_arg', 'type'))
    } else if (type === 'number-reversed') {
        lineStock.setSort(sortFunction('-type_arg', '-type'))
    } else {
        lineStock.setSort(undefined);
    }

    document.querySelectorAll('.sort-button').forEach(elem => elem.classList.remove('selected'));
    document.getElementById(`sort-${type}`).classList.add('selected');
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