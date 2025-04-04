# Code example
## Example of integration

```js
loadBgaGameLib('bga-cards', '0.x');

/* ... */

    setup: function(gamedatas) {
        /* ... */

        // create the card manager
        this.cardsManager = new CardManager(this, {
            getId: (card) => `card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('mygame-card');
                div.style.width = '100px';
                div.style.height = '150px';
                div.style.position = 'relative';
            },
            setupFrontDiv: (card, div) => {
                div.style.background = 'blue';
                div.classList.add('mygame-card-front');
                div.id = `card-${card.id}-front`;
                this.addTooltipHtml(div.id, `tooltip of ${card.type}`);
            },
            setupBackDiv: (card, div) => {
                div.style.background = 'url(' + g_gamethemeurl + 'img/card-back.jpg)';
            },
        });

        // create the stock
        this.stock = new LineStock(this.cardsManager, document.getElementById('card-stock'));
        this.stock.addCards(gamedatas.cards);
    }
```

## Example of custom Stock
A composite stock that holds 3 AllVisibleDeck stocks
```js
class WickednessDecks extends CardStock {
    decks: AllVisibleDeck = [];
    
    constructor(manager) {
        super(manager, null);

        [3, 6, 10].forEach(level => {
            dojo.place(`<div id="wickedness-tiles-pile-${level}" class="wickedness-tiles-pile wickedness-tile-stock"></div>`, 'wickedness-board');
            this.decks[level] = new AllVisibleDeck(manager, document.getElementById(`wickedness-tiles-pile-${level}`), '132px', '81px', '3px');
            this.decks[level].onSelectionChange = (selection, lastChange) => this.selectionChange(selection, lastChange);
        });
    }   

    addCard(card, animation?: CardAnimation) {
        const level = this.getCardLevel(card.type);
        return this.decks[level].addCard(card, animation);
    }

    getCardLevel(cardTypeId) {
        const id = cardTypeId % 100;
        if (id > 8) {
            return 10;
        } else if (id > 4) {
            return 6;
        } else {
            return 3;
        }
    }
    
    setOpened(level, opened) {
        this.decks[level].setOpened(opened);
    }
    
    setSelectableLevel(level) {
        [3, 6, 10].forEach(l => {
            this.decks[l].setSelectionMode(l == level ? 'single' : 'none');
        });
    }

    selectionChange(selection, lastChange) {
        this.onSelectionChange?.(selection, lastChange);
    }

    removeCard(card) {
        [3, 6, 10].forEach(l => {
            this.decks[l].removeCard(card);
        });
    }
    
    getStock(card) {
        return this.decks[this.getCardLevel(card.type)];
    }
}
```
