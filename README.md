# Links
[Documentation](https://thoun.github.io/bga-cards/docs/index.html)

[Demo](https://thoun.github.io/bga-cards/demo/index.html)

# Concept
## CardManager, Stocks and Card
The CardManager will handle the creation of all cards used in all stocks linked to it.

For example, if you have cards in 3 stocks on your game, you will create 1 manager and 3 stocks.

If you have different decks of cards (cards of different kind, that may have ids in common as they are handled in different DB tables), you will need one manager for each.

When the card is mentionned in the parameters, it can be any type of object. For example `{ id: 3, type: 3, type_arg: 2 }`. It should be possible to identify the card and generate it's unique id by the object, when used in manager/stock parameter, but it isn't necessary to be the exact same object that was used to add the card.

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

See [examples](./EXAMPLES.md) to see how to create a stock.