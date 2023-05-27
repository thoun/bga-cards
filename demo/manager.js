let cardsManager;

const cardWidth = 100;
const cardHeight = 150;

function initManager() {
    cardsManager = new CardManager(game, {
        getId: (card) => `card-${card.id}`,
        setupDiv: (card, div) => {
            div.classList.add('mygame-card');
        },
        setupFrontDiv: (card, div) => {
            div.classList.add('mygame-card-front');
            div.style.backgroundPositionX = `${(card.type_arg - 1) * 100 / 14}%`;
            div.style.backgroundPositionY = `${(card.type - 1) * 100 / 3}%`;
            /*div.style.background = 'white';
            div.innerHTML = `
                <div class="type" data-type="${card.type}">Type ${card.type}</div>
                <div>SubType ${card.type_arg}</div>
            `;*/
            if (card.type) {
                game.addTooltipHtml(div.id, `tooltip de ${card.type} > ${card.type_arg}`);
            }
        },
        setupBackDiv: (card, div) => {
            div.classList.add('mygame-card-back');
        },
        isCardVisible: card => Boolean(card.type),
        cardWidth: 100,
        cardHeight: 150,
    });
}

let cardId = 1;
function getCardId() {
    return cardId++;
}