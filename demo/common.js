let gameLoaded = false;
let animationManager;

window.onload = setTimeout(() => gameLoaded = true, 500);

let game = {
    instantaneousMode: false,
    
    addTooltipHtml: (divId, tooltip) => { document.getElementById(divId).title = tooltip },

    bgaAnimationsActive: function() {
        return document.visibilityState !== 'hidden' && !this.instantaneousMode && gameLoaded;
    },
};

function initCommon() {
    animationManager = new AnimationManager({
        animationsActive: () => game.bgaAnimationsActive(),
    });

    document.body.insertAdjacentHTML('afterbegin', `    
    <div class="nav">
        <a href="index.html">Index</a> | 
        <a href="linear-stocks.html">Linear stocks</a> | 
        <a href="slot-stocks.html">Slot stocks</a> | 
        <a href="hand-stocks.html">Hand stocks</a> |
        <a href="decks.html">Decks</a> |
        <a href="selection.html">Card selection</a>
    </div>
    <div>
        <input type="checkbox" id="instantaneousMode" onclick="game.instantaneousMode = !game.instantaneousMode">
        <label for="instantaneousMode">Instantaneous mode (to simulate fast replay)</label>
    </div>
    `);
}

let cardId = 1;
function getCardId() {
    return cardId++;
}

let manipulatedCard = { id: getCardId(), type: 3, type_arg: 2, location: 'table', location_arg: 0, x: 3, y: 3, r: 1 };

function rotateCard() {
    manipulatedCard.r += 1;
    //lineStock.addCard(manipulatedCard);
    cardsManager.updateCardInformations(manipulatedCard);
}

function flipCard() {
    manipulatedCard.flipped = !manipulatedCard.flipped;
    //lineStock.addCard(manipulatedCard);
    cardsManager.updateCardInformations(manipulatedCard);
}