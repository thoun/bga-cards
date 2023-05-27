let game = {
    addTooltipHtml: (divId, tooltip) => { document.getElementById(divId).title = tooltip },
};

function initCommon() {
    document.body.insertAdjacentHTML('afterbegin', `    
    <div class="nav">
        <a href="index.html">Index</a> | 
        <a href="stocks.html">Stocks</a> | 
        <a href="decks.html">Decks</a> |
        <a href="selection.html">Card selection</a>
    </div>
    <div>
        <input type="checkbox" id="instantaneousMode" onclick="game.instantaneousMode = !game.instantaneousMode">
        <label for="instantaneousMode">Instantaneous mode (to simulate fast replay)</label>
    </div>
    `)
}