let tokensManager;

function initTokenManager() {
    tokensManager = new CardManager(game, {
        type: 'mygame-token',
        getId: (card) => card.id,
        setupFrontDiv: (card, div) => {
            div.dataset.number = card.number;
            if (card.number) {
                game.addTooltipHtml(div.id, `tooltip de ${card.number}`);
            }
        },
        isCardVisible: card => Boolean(card.number),
        cardWidth: 90,
        cardHeight: 90,
    });
}

let tokenId = 1;
function getTokenId() {
    return tokenId++;
}