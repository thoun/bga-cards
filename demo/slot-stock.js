let slotStock;
let slotStockCard1;
let slotStockCard2;

function initSlotStock() {
    slotStock = new SlotStock(cardsManager, document.getElementById('slot-stock'), {
        slotsIds: ['A', 'B', 'C'],
        slotClasses: ['mygame-slot'],
        mapCardToSlot: (card) => card.location,
    });

    slotStockCard1 = { id: getCardId(), type: 3, type_arg: 2, location: 'A', location_arg: 0 };
    slotStockCard2 = { id: getCardId(), type: 1, type_arg: 5, location: 'C', location_arg: 0 };

    // add cards
    slotStock.addCards([
        slotStockCard1,
        slotStockCard2,
    ]);
}

function swapSlotStockCards() {
    if (slotStockCard1.location == 'A') {
        slotStockCard1.location = 'C';
        slotStockCard2.location = 'A';
    } else {
        slotStockCard1.location = 'A';
        slotStockCard2.location = 'C';
    }

    slotStock.swapCards([
        slotStockCard1,
        slotStockCard2,
    ]);
}
