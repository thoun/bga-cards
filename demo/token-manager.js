let tokensManager;

function initTokenManager() {
    tokensManager = new CardManager(game, {
        getId: (card) => `token-${card.id}`,
        setupDiv: (card, div) => {
            div.classList.add('mygame-token');
        },
        setupFrontDiv: (card, div) => {
            div.classList.add('mygame-token-front');
            div.dataset.number = card.number;
            if (card.number) {
                game.addTooltipHtml(div.id, `tooltip de ${card.number}`);
            }
        },
        setupBackDiv: (card, div) => {
            div.classList.add('mygame-token-back');
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