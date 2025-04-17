let cardsManager;

const cardWidth = 100;
const cardHeight = 150;

function initManager() {
    cardsManager = new BgaCards.Manager({
        animationManager: animationManager,
        type: 'mygame-card',
        getId: (card) => card.id,
        setupDiv: (card, div) => {
            // div.classList.add('mygame-card'); // useless as type generates a class name like this
        },
        setupFrontDiv: (card, div) => {
            //div.classList.add('mygame-card-front'); // useless as type generates a class name like this
            div.style.backgroundPositionX = `${(card.type_arg - 1) * 100 / 14}%`;
            div.style.backgroundPositionY = `${(card.type - 1) * 100 / 3}%`;
            /*div.style.background = 'white';
            if (!div.lastElementChild) {
                div.innerHTML = `
                    <div class="type" data-type="${card.type}">Type ${card.type}</div>
                    <div>SubType ${card.type_arg}</div>
                `;
            }*/
            if (card.type) {
                game.addTooltipHtml(div.id, `tooltip of ${card.type} > ${card.type_arg}`);
            }
        },
        setupBackDiv: (card, div) => {
            //div.classList.add('mygame-card-back'); // useless as type generates a class name like this
        },
        isCardVisible: card => Boolean(card.type) && !card.flipped,
        getCardRotation: card => card.r,
        cardWidth: 100,
        cardHeight: 150,
        cardBorderRadius: '5px',
    });
}