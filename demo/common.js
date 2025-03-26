let game = {
    instantaneousMode: false,
    
    addTooltipHtml: (divId, tooltip) => { document.getElementById(divId).title = tooltip },

    bgaAnimationsActive: function() {
        return document.visibilityState !== 'hidden' && !this.instantaneousMode;
    },
    wait: function(delay) {
        if (delay > 0 && this.bgaAnimationsActive()) {
            return new Promise(resolve => setTimeout(resolve, delay));
        } else {
            return Promise.resolve();
        }
    },
};

function initCommon() {
    document.body.insertAdjacentHTML('afterbegin', `    
    <div class="nav">
        <a href="index.html">Index</a> | 
        <a href="linear-stocks.html">Linear stocks</a> | 
        <a href="slot-stocks.html">Slot stocks</a> | 
        <a href="decks.html">Decks</a> |
        <a href="selection.html">Card selection</a>
    </div>
    <div>
        <input type="checkbox" id="instantaneousMode" onclick="game.instantaneousMode = !game.instantaneousMode">
        <label for="instantaneousMode">Instantaneous mode (to simulate fast replay)</label>
    </div>
    `)
}