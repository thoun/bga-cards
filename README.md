# Concept
## CardManager, Stocks and Card
The CardManager will handle the creation of all cards used in all stocks linked to it.

For example, if you have cards in 3 stocks on your game, you will create 1 manager and 3 stocks.

If you have different decks of cards (cards of different kind, that may have ids in common as they are handled in different DB tables), you will need one manager for each.

When the card is mentionned in the parameters, it can be any type of object. For example `{ id: 3, type: 3, type_arg: 2 }`. It should be possible to identify the card and generate it's unique id by the object.

## Card layout
The card contains a div (card-sides) that contains 2 divs : a front side and a back side.

# Integration
## On standard BGA project
Copy bga-cards.css and bga-cards.js files to the `modules` directory.  
Then you can include the module on your game :

CSS file: 
```css
@import url(modules/bga-cards.css);
```
JS file:
```js
define([
   "dojo","dojo/_base/declare",
   "dojo/debounce",
   "ebg/core/gamegui",
   /*...,*/
   g_gamethemeurl + "modules/bga-cards.js",
],
function (dojo, declare, debounce, gamegui, /*...,*/ bgaCards) {
```

# Code example

Example of integration
```js
define([
   "dojo","dojo/_base/declare",
   "dojo/debounce",
   "ebg/core/gamegui",
   /*...,*/
   g_gamethemeurl + "modules/bga-cards.js",
],
function (dojo, declare, debounce, gamegui, /*...,*/ bgaCards) {
   return declare("bgagame.mygame", gamegui, {
      constructor: function() {

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
                this.addTooltipHtml(div.id, `tooltip de ${card.type}`);
            },
            setupBackDiv: (card, div) => {
                div.style.background = 'url(' + g_gamethemeurl + 'img/card-back.jpg');
            },
        });

        // create the stock
        this.stock = new LineStock(this.cardsManager, document.getElementById('card-stock'));

        // add a card
        const card = { id: 3, type: 3, type_arg: 2, location: 'table', location_arg: 0 };
        this.stock.addCard(card);
```

# Documentation
[Full documentation here](./DOC.md)