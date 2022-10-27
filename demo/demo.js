
// example of a custom function.
 function stockSlideWithDoubleLoopAnimation(settings) {
    const promise = new Promise((success) => {

        const originBR = settings.fromElement.getBoundingClientRect();
        const destinationBR = settings.element.getBoundingClientRect();

        const deltaX = (destinationBR.left + destinationBR.right)/2 - (originBR.left + originBR.right)/2;
        const deltaY = (destinationBR.top + destinationBR.bottom)/2 - (originBR.top+ originBR.bottom)/2;

        settings.element.style.zIndex = '10';
        settings.element.style.transform = `translate(${-deltaX}px, ${-deltaY}px) rotate(${(settings.rotationDelta ?? 0) + 720}deg)`;

        const side = settings.element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const cardSides = settings.element.getElementsByClassName('card-sides')[0];
            cardSides.style.transition = 'none';
            settings.element.dataset.side = settings.originalSide;
            setTimeout(() => {
                cardSides.style.transition = null;
                settings.element.dataset.side = side;
            });
        }

        setTimeout(() => {
            settings.element.offsetHeight;
            settings.element.style.transition = `transform 0.5s linear`;
            settings.element.offsetHeight;
            settings.element.style.transform = null;
        }, 10);
        setTimeout(() => {
            settings.element.style.zIndex = null;
            settings.element.style.transition = null;
            success(true);
        }, 600);
    });
    return promise;
}

let cardsManager;
let lineStock;

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
            div.style.background = 'white';
            div.innerHTML = `
                <div class="type">card type = ${card.type}</div>
                <div>card type_arg = ${card.type_arg}</div>
            `;
            div.id = `card-${card.id}-front`;
            game.addTooltipHtml(div.id, `tooltip de ${card.type}`);
        },
        setupBackDiv: (card, div) => {
            div.classList.add('mygame-card-back');
        },
    });
}

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'));
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => document.getElementById('line-stock-last-selection-change').innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`

    // add cards
    lineStock.addCards([
        { id: 3, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 4, type: 3, type_arg: 5, location: 'table', location_arg: 0 },
    ]);
}

function addCardToLineStockWithAnimation(fromElement, customAnimation) {
    const animationSettings = {
        fromElement: fromElement,
        originalSide: 'back'
    };

    if (customAnimation) {
        animationSettings.animation = stockSlideWithDoubleLoopAnimation;
    }

    lineStock.addCard(
        { id: new Date().getTime(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        animationSettings
    );
}

function init() {
    initManager();
    initLineStock();
};