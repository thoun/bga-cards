# Classes
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