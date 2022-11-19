let cardsManager;
let lineStock;
let slotStock;
let scrollableStock;
let handStock;
let manualPositionDiagonalStock;
let manualPositionCurveStock;
let hiddenDeck;
let visibleDeck;
let allVisibleDeck;

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

function initLineStock() {
    lineStock = new LineStock(cardsManager, document.getElementById('line-stock'));
    lineStock.setSelectionMode('multiple');
    lineStock.onSelectionChange = (selection, lastChange) => document.getElementById('line-stock-last-selection-change').innerHTML = `selection = ${JSON.stringify(selection)}, lastChange = ${JSON.stringify(lastChange)}`

    // add cards
    lineStock.addCards([
        { id: 3, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 4, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
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

function initSlotStock() {
    slotStock = new SlotStock(cardsManager, document.getElementById('slot-stock'), {
        slotsIds: ['A', 'B', 'C'],
        slotClasses: ['mygame-slot'],
        mapCardToSlot: (card) => card.location,
    });

    // add cards
    slotStock.addCards([
        { id: 1, type: 3, type_arg: 2, location: 'A', location_arg: 0 },
        { id: 2, type: 1, type_arg: 5, location: 'C', location_arg: 0 },
    ]);
}

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
        { id: 101, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 102, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 103, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 104, type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 105, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 106, type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function initHandStock() {
    handStock = new HandStock(cardsManager, document.getElementById('hand-stock'), {
    });

    // add cards
    handStock.addCards([
        { id: 201, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 202, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 203, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 204, type: 4, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 205, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 206, type: 4, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function manualPositionDiagonalUpdateDisplay(element, cards, lastCard, stock) {
    cards.forEach((card, index) => {
        const cardDiv = stock.getCardElement(card);
        cardDiv.style.left = `${ 100 * index + 10 * index }px`;
        cardDiv.style.top = `${ 10 * index }px`;
    });

    element.style.width = `${ 100 * cards.length + 10 * (cards.length - 1) }px`;
    element.style.height = `${ 150 + 10 * (cards.length - 1) }px`;
}

function initManualPositionDiagonalStock() {
    manualPositionDiagonalStock = new ManualPositionStock(cardsManager, document.getElementById('manual-position-diagonal-stock'), manualPositionDiagonalUpdateDisplay);

    // add cards
    manualPositionDiagonalStock.addCards([
        { id: 301, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 302, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 303, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
    ]);
}

const curvePoints = [{x:0,y:2},{x:2,y:3},{x:3,y:4},{x:4,y:2},{x:5,y:6}];
let curveXScale;
let curveYScale;
let canvasWidth;

function manualPositionCurveUpdateDisplay(element, cards, lastCard, stock) {
    cards.forEach((card, index) => {
        const cardDiv = stock.getCardElement(card);
        const left = canvasWidth / 2 + ((cardWidth + 10) * (index - (cards.length) / 2));
        const x = (left + cardWidth / 2) / curveXScale;

        const resolveBezier = (curvePoints, x) => x / 2; // TODO find a method that get y from x using curvePoints
        const y = resolveBezier(curvePoints, x);

        cardDiv.style.left = `${left}px`;
        cardDiv.style.top = `${y * curveYScale - cardHeight / 2}px`;
    });

    element.style.width = `${ 100 * cards.length + 10 * (cards.length - 1) }px`;
    element.style.height = `${ 150 + 10 * (cards.length - 1) }px`;
}

function initManualPositionCurveStock() {
    const maxX = 5;
    const maxY = 8;

    var points = curvePoints;
    var cv = document.getElementById("curveCanvas");
    canvasWidth = cv.clientWidth;
    var ctx = cv.getContext("2d");
    const xScale = cv.clientWidth / maxX;
    const yScale = canvasWidth / maxY;
    curveXScale = xScale;
    curveYScale = yScale;
    ctx.moveTo(points[0].x * xScale, points[0].y * yScale);
    
    for (var i = 0; i < points.length-1; i ++) {
      var x_mid = (points[i].x + points[i+1].x) / 2 * xScale;
      var y_mid = (points[i].y + points[i+1].y) / 2 * yScale;
      var cp_x1 = (x_mid + points[i].x * xScale) / 2;
      var cp_x2 = (x_mid + points[i+1].x * xScale) / 2;
      ctx.quadraticCurveTo(cp_x1,points[i].y * yScale ,x_mid, y_mid);
      ctx.quadraticCurveTo(cp_x2,points[i+1].y * yScale,points[i+1].x * xScale, points[i+1].y * yScale);
    }
    ctx.stroke();

    manualPositionCurveStock = new ManualPositionStock(cardsManager, document.getElementById('manual-position-curve-stock'), manualPositionCurveUpdateDisplay);

    // add cards
    manualPositionCurveStock.addCards([
        { id: 351, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 352, type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 353, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
    ]);
}

function initHiddenDeck() {
    hiddenDeck = new HiddenDeck(cardsManager, document.getElementById('hidden-deck'), {
        width: 100,
        height: 150,
        cardNumber: 5,
    });
}

function setHiddenDeckCardNumber(cardNumber) {
    hiddenDeck.setCardNumber(cardNumber);
}

function initVisibleDeck() {
    visibleDeck = new VisibleDeck(cardsManager, document.getElementById('visible-deck'), {
        width: 100,
        height: 150,
        cardNumber: 5,
    });
    visibleDeck.addCard(
        { id: 5, type: 2, type_arg: 3, location: 'table', location_arg: 0 },
    );
}

function setVisibleDeckCardNumber(cardNumber) {
    visibleDeck.setCardNumber(cardNumber);
}

function initAllVisibleDeck() {
    allVisibleDeck = new AllVisibleDeck(cardsManager, document.getElementById('all-visible-deck'), {
        width: '100px',
        height: '150px',
        shift: '8px',
    });
    allVisibleDeck.addCards([
        { id: 6, type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: 7, type: 3, type_arg: 5, location: 'table', location_arg: 0 },
        { id: 8, type: 3, type_arg: 6, location: 'table', location_arg: 0 },
    ]);
}

function setAllVisibleDeckOpen(opened) {
    allVisibleDeck.setOpened(opened);
}

function init() {
    initManager();
    initLineStock();
    initSlotStock();
    initScrollableStock();
    initHandStock();
    initManualPositionDiagonalStock();
    initManualPositionCurveStock();
    initHiddenDeck();
    initVisibleDeck();
    initAllVisibleDeck();
};