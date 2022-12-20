let manualPositionDiagonalStock;
let manualPositionCurveStock;
let manualPositionFitStock;

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
    manualPositionDiagonalStock = new ManualPositionStock(cardsManager, document.getElementById('manual-position-diagonal-stock'), undefined, manualPositionDiagonalUpdateDisplay);

    // add cards
    manualPositionDiagonalStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
    ]);
}

const curvePoints = [{x:0,y:2},{x:2,y:3},{x:3,y:4},{x:4,y:2},{x:5,y:6}];
let curveXScale;
let curveYScale;
let canvasWidth;

function reallyPoorBezierResolver(curvePoints, x) {
    // TODO find a method that get y from x using curvePoints using Bezier

    for (let i=0; i<curvePoints.length - 2; i++) {
        if (x >= curvePoints[i].x && x <= curvePoints[i+1].x) {
            const relativeDistance = (x - curvePoints[i].x) / (curvePoints[i+1].x - curvePoints[i].x);
            return curvePoints[i].y + (curvePoints[i+1].y - curvePoints[i].y) * relativeDistance;
        }
    }

    throw new Error('invalid x');
}

function manualPositionCurveUpdateDisplay(element, cards, lastCard, stock) {
    cards.forEach((card, index) => {
        const cardDiv = stock.getCardElement(card);
        const left = canvasWidth / 2 + ((cardWidth + 10) * (index - (cards.length) / 2));
        const x = (left + cardWidth / 2) / curveXScale;

        const y = reallyPoorBezierResolver(curvePoints, x);

        cardDiv.style.left = `${left}px`;
        cardDiv.style.top = `${y * curveYScale - cardHeight / 2}px`;
    });
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

    manualPositionCurveStock = new ManualPositionStock(cardsManager, document.getElementById('manual-position-curve-stock'), undefined, manualPositionCurveUpdateDisplay);

    // add cards
    manualPositionCurveStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
    ]);
}

function manualPositionFitUpdateDisplay(element, cards, lastCard, stock) {
    const halfClientWidth = element.clientWidth / 2;
    const MARGIN = 8;
    const CARD_WIDTH = 100;
    let cardDistance = CARD_WIDTH + MARGIN;
    const containerWidth = element.clientWidth;
    const uncompressedWidth = (cards.length * CARD_WIDTH) + ((cards.length - 1) * MARGIN);
    if (uncompressedWidth > containerWidth) {
        cardDistance = Math.floor(CARD_WIDTH * containerWidth / (cards.length * CARD_WIDTH));
    }

    cards.forEach((card, index) => {
        const cardDiv = stock.getCardElement(card);
        const cardLeft = halfClientWidth + cardDistance * (index - (cards.length - 1) / 2);

        cardDiv.style.left = `${ cardLeft - CARD_WIDTH / 2 }px`;
    });
}

function initManualPositionFitStock() {
    manualPositionFitStock = new ManualPositionStock(cardsManager, document.getElementById('manual-position-fit-stock'), undefined, manualPositionFitUpdateDisplay);

    // add cards
    manualPositionFitStock.addCards([
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        { id: getCardId(), type: 1, type_arg: 5, location: 'table', location_arg: 0 },
    ]);
}

function addCardToManualFitStock(fromElement) {
    manualPositionFitStock.addCard(
        { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0 },
        {
            fromElement: fromElement,
            originalSide: 'back'
        }
    );
}

function removeCardToManualFitStock() {
    if (!manualPositionFitStock.isEmpty()) {
        manualPositionFitStock.removeCard(manualPositionFitStock.getCards()[0]);
    }
}
