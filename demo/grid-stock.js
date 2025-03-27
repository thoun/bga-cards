let fixedGridStock;
let gridStock;
let gridCards = [];

const CARD_TO_COORDINATE = (card) => ({ x: card.x, y: card.y });

function initFixedGridStock() {
    fixedGridStock = new GridStock(cardsManager, document.getElementById('fixed-grid-stock'), {
        slotClasses: ['mygame-slot'],
        mapCardToCoordinates: CARD_TO_COORDINATE,
        minX: 1,
        maxX: 4,
        minY: 1,
        maxY: 3,
    });

    const fixedGridCards = [
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0, x: 3, y: 3 },
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0, x: 2, y: 1 },
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0, x: 2, y: 2 },
        { id: getCardId(), type: 1 + Math.floor(Math.random() * 4), type_arg: 1 + Math.floor(Math.random() * 10), location: 'table', location_arg: 0, x: 3, y: 2 },
    ];

    // add cards
    fixedGridStock.addCards(fixedGridCards);
}

function initGridStock() {
    gridStock = new GridStock(cardsManager, document.getElementById('grid-stock'), {
        slotClasses: ['mygame-slot'],
        mapCardToCoordinates: CARD_TO_COORDINATE,
    });

    gridCards = [
        { id: getCardId(), type: 3, type_arg: 2, location: 'B', location_arg: 0, x: 1, y: 1 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'D', location_arg: 0, x: 2, y: 1 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'D', location_arg: 0, x: 2, y: 2 },
    ];

    // add cards
    gridStock.addCards(gridCards);
}

function makeGridSlotsAroundCardsSelectable() {
    const cardsCoordinates = gridCards.map(card => CARD_TO_COORDINATE(card));

    const aroundCoordinates = [];

    cardsCoordinates.forEach(coordinates => 
        [[-1, 0], [0, -1], [0, 1], [1, 0]].forEach(shift => {
            x = coordinates.x + shift[0];
            y = coordinates.y + shift[1];

            if (
                !cardsCoordinates.some(c => c.x === x && c.y === y) && // ignore if a card is at this coordinate
                !aroundCoordinates.some(c => c.x === x && c.y === y) // ignore if already in the list
            ) {
                aroundCoordinates.push({ x, y });
            }
        })
    );

    gridStock.makeSlotsForCoordinates(aroundCoordinates);
    gridStock.setGridSlotSelectionMode('single', aroundCoordinates);
}

function removeEmptySurroundingSlots() {
    gridStock.removeEmptySurroundingSlots();
}