let lineStock;
let slotStock;
let scrollableStock;
let handStock;

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'));
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => document.getElementById('line-stock-last-selection-change').innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`

    // add cards
    lineStock.addCards([
        { id: 3, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 4, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
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
        { id: 2, type: 1, type_arg: 5, location: 'C', location_arg: 0 },
    ]);
}

function initScrollableStock() {
    scrollableStock = new ScrollableStock(cardsManager, document.getElementById('scrollable-stock'), {
        leftButton: {
            html: '&lt;'
        },
        rightButton: {
            html: '&gt;'
        },
    });

    // add cards
    scrollableStock.addCards([
        { id: 101, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 102, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 103, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 104, type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 105, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 106, type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function initHandStock() {
    handStock = new HandStock(cardsManager, document.getElementById('hand-stock'), {
    });

    // add cards
    handStock.addCards([
        { id: 201, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 202, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 203, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 204, type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 205, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 206, type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}
