# Interfaces
## CardManagerSettings
### getId?: (card: T) => string;
(optional)

card: the card informations  
return: the id for a card  

### setupDiv?: (card: T, element: HTMLDivElement) => void;
(optional)

card: the card informations  
element: the card main Div element.
You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.

### setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
(optional)

card: the card informations  
element: the card front Div element.
You can add a class, change dataset, set background for the front side, add text, tooltip, ...

### setupBackDiv?: (card: T, element: HTMLDivElement) => void;
(optional)

card: the card informations  
element: the card back Div element.
You can add a class, change dataset, set background for the back side

## LineStockSettings
### wrap?: 'wrap' | 'nowrap';
### direction?: 'row' | 'column';
### center?: boolean;
### gap?: string;

## SlotStockSettings
extends LineStockSettings
### slotsIds: SlotId[];
The ids for the slots (can be number or string)
### slotClasses?: string[];
The classes to apply to each slot (optional)
### mapCardToSlot?: (card: T) => SlotId;
How to place the card on a slot automatically (optional)

## AddCardToSlotSettings
extends AddCardSettings
### slot?: SlotId;
The slot to place the card on.

## AddCardSettings
### visible?: boolean;
(optional)

if the card will be visible

##  CardAnimation {
### fromStock?: CardStock<T>;
(optional)

The stock to take the card. It will automatically remove the card from the other stock.

### fromElement?: HTMLElement;
(optional)

The element to move the card from.

### originalSide?: 'front' | 'back';
(optional)

The side before animation.

### rotationDelta?: number;
(optional)

If the card is rotated at the start of animation.

### animation?: (settings: AnimationSettings) => Promise<boolean>
(optional)

An animation function, based on the `AnimationSettings` settings, that return a Promise at the end of animation (returns true if animation ended, false otherwise)


## AnimationSettings
### element: HTMLElement
The element to animate. The element is added to the destination stock before the animation starts.  

### fromElement: HTMLElement
The HTMLElement to animate from.

### originalSide?: 'front' | 'back';
(optional)

The side before animation.

### rotationDelta?: number;
(optional)

If the card is rotated at the start of animation.

# Classes
## CardManager
### constructor(public game: Game, private settings: CardManagerSettings<T>)
game: the BGA game class, usually it will be `this`  
settings: a `CardManagerSettings` object

### getId(card: T): string
card: the card informations  
return: the id for a card  

### getCardElement(card: T): HTMLElement
return: the HTML element of an existing card

### getCardStock(card: T): CardStock<T>
return: the stock containing the card

## CardStock
The abstract stock. It shouldn't be used directly, use stocks that extends it.

### onSelectionChange?: (selection: T[], lastChange: T | null) => void;
(optional)

selection: the selected cards of the stock  
lastChange: the last change on selection card (can be selected or unselected)

### onCardClick?: (card: T) => void;
(optional)

card: the clicked card (can be selected or unselected)

### constructor(protected manager: CardManager<T>, protected element: HTMLElement)
manager: the card manager  
element: the stock element (should be empty)

### getCards(): T[]
return: the cards on the stock

### isEmpty(): boolean
return: if the stock is empty

### getSelection(): T[]
return: the selected cards

### contains(card: T): boolean
card: a card  
return: if the card is present in the stock

### getCardElement(card: T): HTMLElement
card: a card in the stock 
return: the HTML element generated for the card

### addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>
card: the card to add  
animation: a `CardAnimation` object  
settings: a `AddCardSettings` object  
return: the promise when the animation is done (true if it was animated, false if it wasn't)

### public addCards(cards: T[], animation?: CardAnimation<T>, settings?: AddCardSettings, shift: number | boolean = false) {
cards: the cards to add  
animation: a `CardAnimation` object  
settings: a `AddCardSettings` object  
shift: if number, the number of seconds between each card. if true, chain animations

### removeCard(card: T)
card: the card to remove

### removeAll()

### setSelectionMode(selectionMode: CardSelectionMode)
selectionMode: 'none' | 'single' | 'multiple'

### selectCard(card: T)
card: the card to select

### unselectCard(card: T)
card: the card to unselect

### selectAll
### unselectAll

## LineStock
A basic stock for a list of cards, based on flex.

### constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings?: LineStockSettings)
manager: the card manager  
element: the stock element (should be empty)  
settings (optional): a `LineStockSettings`

## SlotStock
A stock with fixed slots (some can be empty)

### constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: SlotStockSettings<T>)
manager: the card manager  
element: the stock element (should be empty)  
settings : a `SlotStockSettings`

### addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToSlotSettings): Promise<boolean>
Same a card-stock, but extended settings to set the slot for the card.
If unset, will use the `mapCardToSlot` function to determine the slot.

### setSlotsIds(slotsIds: SlotId[])
Change the slots ids. Will empty the stock before re-creating the slots.

## HiddenDeck

## VisibleDeck

## AllVisibleDeck
### setOpened(opened: boolean)
opened: indicate if deck must be always opened. If false, will open on hover/touch