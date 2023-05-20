let scrollableStock;

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
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}
