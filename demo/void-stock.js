let voidStock;

function initVoidStock() {
    voidStock = new VoidStock(cardsManager, document.getElementById('void-stock'));
}

function addCardToVoidStock(fromElement) {
    if (lineStock.isEmpty()) {
        throw new Error('no card in LineStock');
    }

    const card = lineStock.getCards()[0];
    voidStock.addCard(card);
}
