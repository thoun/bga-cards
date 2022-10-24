# Interfaces
## CardManagerSettings
### getId?: (card: T) => string;
card: the card informations  
return: the id for a card  

### setupDiv?: (card: T, element: HTMLDivElement) => void;
card: the card informations  
element: the card main Div element.
You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.

### setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
card: the card informations  
element: the card front Div element.
You can add a class, change dataset, set background for the front side, add text, tooltip, ...

### setupBackDiv?: (card: T, element: HTMLDivElement) => void;
card: the card informations  
element: the card back Div element.
You can add a class, change dataset, set background for the back side

# Classes
## CardManager
### constructor(public game: Game, private settings: CardManagerSettings<T>)
### addStock(stock: CardStock<T>) {
### getId(card: T) {
### createCardElement(card: T, visible: boolean = true): HTMLDivElement {
### getCardElement(card: T): HTMLElement {
### removeCard(card: T) {
### getCardStock(card: T): CardStock<T> {

# CardStock

# LineStock

# SlotStock

# HiddenDeck

# VisibleDeck

# AllVisibleDeck