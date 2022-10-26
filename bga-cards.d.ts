interface CardAnimation<T> {
    fromStock?: CardStock<T>;
    fromElement?: HTMLElement;
    originalSide?: 'front' | 'back';
    rotationDelta?: number;
    animation?: (settings: AnimationSettings) => Promise<boolean>;
}
interface AnimationSettings {
    element: HTMLElement;
    fromElement: HTMLElement;
    originalSide?: 'front' | 'back';
    rotationDelta?: number;
    animation?: (settings: AnimationSettings) => Promise<boolean>;
}
declare function stockSlideAnimation(settings: AnimationSettings): Promise<boolean>;
interface AddCardSettings {
    visible?: boolean;
    forceToElement?: HTMLElement;
}
declare type CardSelectionMode = 'none' | 'single' | 'multiple';
declare class CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected cards: T[];
    protected selectedCards: T[];
    protected selectionMode: CardSelectionMode;
    onSelectionChange?: (selection: T[], lastChange: T | null) => void;
    onCardClick?: (card: T) => void;
    constructor(manager: CardManager<T>, element: HTMLElement);
    getCards(): T[];
    isEmpty(): boolean;
    getSelection(): T[];
    contains(card: T): boolean;
    protected cardInStock(card: T): boolean;
    protected cardElementInStock(element: HTMLElement): boolean;
    getCardElement(card: T): HTMLElement;
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    protected moveFromOtherStock(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    protected moveFromElement(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    addCards(cards: T[], animation?: CardAnimation<T>, settings?: AddCardSettings, shift?: number | boolean): void;
    removeCard(card: T): void;
    cardRemoved(card: T): void;
    removeAll(): void;
    protected setSelectableCard(card: T, selectable: boolean): void;
    setSelectionMode(selectionMode: CardSelectionMode): void;
    selectCard(card: T, silent?: boolean): void;
    unselectCard(card: T, silent?: boolean): void;
    selectAll(silent?: boolean): void;
    unselectAll(silent?: boolean): void;
    protected bindClick(): void;
    protected cardClick(card: T): void;
    protected animationFromElement(settings: AnimationSettings): Promise<boolean>;
}
interface LineStockSettings {
    wrap?: 'wrap' | 'nowrap';
    direction?: 'row' | 'column';
    center?: boolean;
    gap?: string;
}
declare class LineStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    constructor(manager: CardManager<T>, element: HTMLElement, settings?: LineStockSettings);
}
interface SlotStockSettings<T> extends LineStockSettings {
    slotsIds: SlotId[];
    slotClasses?: string[];
    mapCardToSlot?: (card: T) => SlotId;
}
declare type SlotId = number | string;
interface AddCardToSlotSettings extends AddCardSettings {
    slot?: SlotId;
}
declare class SlotStock<T> extends LineStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected slotsIds: SlotId[];
    protected slots: HTMLDivElement[];
    protected slotClasses: string[];
    protected mapCardToSlot?: (card: T) => SlotId;
    constructor(manager: CardManager<T>, element: HTMLElement, settings: SlotStockSettings<T>);
    protected createSlot(slotId: SlotId): void;
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToSlotSettings): Promise<boolean>;
    setSlotsIds(slotsIds: SlotId[]): void;
    protected cardElementInStock(element: HTMLElement): boolean;
}
declare class HiddenDeck<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    constructor(manager: CardManager<T>, element: HTMLElement, empty?: boolean);
    setEmpty(empty: boolean): void;
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
}
declare class VisibleDeck<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    constructor(manager: CardManager<T>, element: HTMLElement);
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
}
declare class AllVisibleDeck<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    constructor(manager: CardManager<T>, element: HTMLElement, width: string, height: string, shift: string);
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    setOpened(opened: boolean): void;
    cardRemoved(card: T): void;
}
interface CardManagerSettings<T> {
    /**
     * @param card the card informations
     * @return the id for a card
     */
    getId?: (card: T) => string;
    /**
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * @param card the card informations
     * @param element  the card back Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupBackDiv?: (card: T, element: HTMLDivElement) => void;
}
declare class CardManager<T> {
    game: Game;
    private settings;
    private stocks;
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    constructor(game: Game, settings: CardManagerSettings<T>);
    addStock(stock: CardStock<T>): void;
    /**
     * @param card the card informations
     * @return the id for a card
     */
    getId(card: T): string;
    createCardElement(card: T, visible?: boolean): HTMLDivElement;
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    getCardElement(card: T): HTMLElement;
    removeCard(card: T): void;
    /**
     * @param card the card informations
     * @return the stock containing the card
     */
    getCardStock(card: T): CardStock<T>;
}
declare const define: any;
