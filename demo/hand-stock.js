let handStock;
let floatingHandStock;

function initHandStock() {
    handStock = new BgaCards.HandStock(cardsManager, document.getElementById('hand-stock'), {
    });

    // add cards
    handStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function initFloatingHandStock() {
    floatingHandStock = new BgaCards.HandStock(cardsManager, document.getElementById('floating-hand-stock'), {
    });

    // add cards
    floatingHandStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function addCardToHandStock(fromElement) {
    handStock.addCard(
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        {
            fromElement: fromElement,
            originalSide: 'back'
        }
    );
}

function removeCardToHandStock() {
    if (!handStock.isEmpty()) {
        handStock.removeCard(handStock.getCards()[0]);
    }
}

function updateHandStockSettings() {
    ['hand-stock', 'floating-hand-stock'].map(stockId => document.getElementById(stockId)).forEach(element => 
        ['overlap', 'shift', 'inclination', 'floatingHeight'].forEach(setting => {
            const value = document.getElementById(`hand-stock-setting-${setting}`).value;
            element.style.setProperty(`--card-${setting}`, `${value}${setting === 'inclination' ? 'deg' : 'px'}`);
        })
    );
}
