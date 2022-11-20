let cardsManager;

const cardWidth = 100;
const cardHeight = 150;

let game = {
    addTooltipHtml: (divId, tooltip) => { document.getElementById(divId).title = tooltip },
};

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
            div.id = `card-${card.id}-front`;
            game.addTooltipHtml(div.id, `tooltip de ${card.type} > ${card.type_arg}`);
        },
        setupBackDiv: (card, div) => {
            div.classList.add('mygame-card-back');
        },
    });
}
