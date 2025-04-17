let slotStock;
let slotStockCard1;
let slotStockCard2;

function initSlotStock() {
    slotStock = new BgaCards.SlotStock(cardsManager, document.getElementById('slot-stock'), {
        slotsIds: ['A', 'B', 'C', 'D', 'E'],
        slotClasses: ['mygame-slot'],
        mapCardToSlot: (card) => card.location,
    });

    slotStock.onSlotSelectionChange = (selection, lastChange) => {
        logDiv = document.getElementById('slot-stock-last-selection-change');
        if (logDiv) {
            logDiv.innerHTML = `<br>selection = ${JSON.stringify(selection)},<br>lastChange = ${JSON.stringify(lastChange)}`;
        }
    };
    slotStock.onSlotClick = (slotId) => {
        logDiv = document.getElementById('slot-stock-last-click');
        if (logDiv) {
            logDiv.innerHTML = `<br>clicked slotId = ${JSON.stringify(slotId)}`;
        }
    };

    slotStockCard1 = { id: getCardId(), type: 3, type_arg: 2, location: 'B', location_arg: 0 };
    slotStockCard2 = { id: getCardId(), type: 1, type_arg: 5, location: 'D', location_arg: 0 };

    // add cards
    slotStock.addCards([
        slotStockCard1,
        slotStockCard2,
    ]);
}

function swapSlotStockCards() {
    if (slotStockCard1.location == 'B') {
        slotStockCard1.location = 'D';
        slotStockCard2.location = 'B';
    } else {
        slotStockCard1.location = 'B';
        slotStockCard2.location = 'D';
    }

    slotStock.swapCards([
        slotStockCard1,
        slotStockCard2,
    ]);
}

function slotSelectionTypeChange(type) {
    slotStock.setSlotSelectionMode(type);
}

function setSelectableSlots(all) {
    slotStock.setSelectableSlots(slotStock.getSlotsIds().filter((slotId, index) => all ? true : index % 2));
}
