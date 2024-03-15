interface BgaAnimationSettings {
    /**
     * The element to animate.
     */
    element?: HTMLElement;
    /**
     * The game class. Used to know if the game is in instantaneous mode (replay) becausewe don't want animations in this case.
     */
    game?: Game;
    /**
     * The animation duration, in ms (default: 500).
     */
    duration?: number;
    /**
     * The animation CSS timing function, 'linear', 'ease-in-out' (default: linear).
     */
    transitionTimingFunction?: string;
    /**
     * The cumulated scale of the element to animate (default: 1).
     */
    scale?: number;
    /**
     * The class to add to the animated element.
     */
    animationClass?: string;
    /**
     * A function called when animation starts (for example to add a zoom effect on a card during a reveal animation).
     */
    animationStart?: (animation: IBgaAnimation<BgaAnimationSettings>) => any;
    /**
     * A function called when animation ends.
     */
    animationEnd?: (animation: IBgaAnimation<BgaAnimationSettings>) => any;
}
interface BgaElementAnimationSettings extends BgaAnimationSettings {
    /**
     * The element to animate.
     */
    element: HTMLElement;
    /**
     * The zIndex to apply during animation (default: 10).
     */
    zIndex?: number;
    /**
     * The transform property to set after the animation.
     */
    finalTransform?: string;
    /**
     * If the card is rotated at the start of animation.
     */
    rotationDelta?: number;
}
interface BgaAnimationWithOriginSettings extends BgaElementAnimationSettings {
    /**
     * A delta coordinates (object with x and y properties).
     */
    fromDelta?: {
        x: number;
        y: number;
    };
    /**
     * An initial Rect position. Can be the moved object BoundingClientRect itself, before being attached.
     */
    fromRect?: DOMRect;
    /**
     * The element to move the card from.
     */
    fromElement?: HTMLElement;
}
interface IBgaAnimation<T extends BgaAnimationSettings> {
    settings: T;
    played: boolean | null;
    result: any | null;
    playWhenNoAnimation: boolean;
}
/**
 * Animation function signature. Will return a promise after animation is ended. The promise returns the result of the animation, if any
 */
type BgaAnimationFunction = (animationManager: AnimationManager, animation: IBgaAnimation<BgaAnimationSettings>) => Promise<any>;
declare class BgaAnimation<T extends BgaAnimationSettings> implements IBgaAnimation<BgaAnimationSettings> {
    animationFunction: BgaAnimationFunction;
    settings: T;
    played: boolean | null;
    result: any | null;
    playWhenNoAnimation: boolean;
    constructor(animationFunction: BgaAnimationFunction, settings: T);
}
interface BgaAttachWithAnimationSettings extends BgaElementAnimationSettings {
    animation: BgaAnimation<BgaAnimationWithOriginSettings>;
    /**
     * The target to attach the element to.
     */
    attachElement: HTMLElement;
    /**
     * A function called after attaching the element.
     */
    afterAttach?: (element: HTMLElement, attachElement: HTMLElement) => void;
}
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
declare function attachWithAnimation(animationManager: AnimationManager, animation: IBgaAnimation<BgaAttachWithAnimationSettings>): Promise<any>;
declare class BgaAttachWithAnimation<BgaAnimationWithAttachAndOriginSettings> extends BgaAnimation<any> {
    constructor(settings: BgaAnimationWithAttachAndOriginSettings);
}
interface BgaCumulatedAnimationsSettings extends BgaAnimationSettings {
    animations: IBgaAnimation<BgaAnimationSettings>[];
}
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
declare function cumulatedAnimations(animationManager: AnimationManager, animation: IBgaAnimation<BgaCumulatedAnimationsSettings>): Promise<any>;
declare class BgaCumulatedAnimation<BgaCumulatedAnimationsSettings> extends BgaAnimation<any> {
    constructor(settings: BgaCumulatedAnimationsSettings);
}
/**
 * Slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
declare function slideAnimation(animationManager: AnimationManager, animation: IBgaAnimation<BgaElementAnimationSettings>): Promise<void>;
declare class BgaSlideAnimation<BgaAnimationWithAttachAndOriginSettings> extends BgaAnimation<any> {
    constructor(settings: BgaAnimationWithAttachAndOriginSettings);
}
/**
 * Slide of the element from destination to origin.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
declare function slideToAnimation(animationManager: AnimationManager, animation: IBgaAnimation<BgaElementAnimationSettings>): Promise<void>;
declare class BgaSlideToAnimation<BgaAnimationWithAttachAndOriginSettings> extends BgaAnimation<any> {
    constructor(settings: BgaAnimationWithAttachAndOriginSettings);
}
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
declare function pauseAnimation(animationManager: AnimationManager, animation: IBgaAnimation<BgaAnimationSettings>): Promise<void>;
declare class BgaPauseAnimation<BgaAnimation> extends BgaAnimation<any> {
    constructor(settings: BgaAnimation);
}
declare function shouldAnimate(settings?: BgaAnimationSettings): boolean;
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
declare function getDeltaCoordinates(element: HTMLElement, settings: BgaAnimationWithOriginSettings): {
    x: number;
    y: number;
};
declare function logAnimation(animationManager: AnimationManager, animation: IBgaAnimation<BgaCumulatedAnimationsSettings>): Promise<any>;
interface IZoomManager {
    /**
     * Returns the zoom level
     */
    zoom: number;
}
interface AnimationManagerSettings {
    /**
     * The default animation duration, in ms (default: 500).
     */
    duration?: number;
    /**
     * The zoom manager, providing the current scale.
     */
    zoomManager?: IZoomManager;
}
declare class AnimationManager {
    game: Game;
    private settings?;
    /**
     * The zoom manager, providing the current scale.
     */
    private zoomManager?;
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    constructor(game: Game, settings?: AnimationManagerSettings);
    getZoomManager(): IZoomManager;
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    setZoomManager(zoomManager: IZoomManager): void;
    getSettings(): AnimationManagerSettings | null | undefined;
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    animationsActive(): boolean;
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    play(animation: BgaAnimation<BgaAnimationSettings>): Promise<BgaAnimation<BgaAnimationSettings>>;
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    playParallel(animations: BgaAnimation<BgaAnimationSettings>[]): Promise<BgaAnimation<BgaAnimationSettings>[]>;
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    playSequence(animations: BgaAnimation<BgaAnimationSettings>[]): Promise<BgaAnimation<BgaAnimationSettings>[]>;
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    playWithDelay(animations: BgaAnimation<BgaAnimationSettings>[], delay: number): Promise<BgaAnimation<BgaAnimationSettings>[]>;
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    attachWithAnimation(animation: BgaAnimation<BgaAnimationSettings>, attachElement: HTMLElement): Promise<BgaAnimation<any>>;
}
interface CardAnimation<T> {
    /**
     * The stock to take the card. It will automatically remove the card from the other stock.
     */
    fromStock?: CardStock<T>;
    /**
     * The element to move the card from.
     */
    fromElement?: HTMLElement;
    /**
     * The side before animation.
     */
    originalSide?: 'front' | 'back';
    /**
     * If the card is rotated at the start of animation.
     */
    rotationDelta?: number;
    /**
     * An animation function, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: BgaAnimation<BgaElementAnimationSettings>;
}
interface CardAnimationSettings {
    /**
     * The side before animation.
     */
    originalSide?: 'front' | 'back';
    /**
     * If the card is rotated at the start of animation.
     */
    rotationDelta?: number;
    /**
     * An animation function, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: BgaAnimation<BgaElementAnimationSettings>;
}
type SortFunction = (a: any, b: any) => number;
declare function sortFunction(...sortedFields: string[]): SortFunction;
interface CardStockSettings {
    /**
     * Indicate the card sorting (unset means no sorting, new cards will be added at the end).
     * For example, use `sort: sortFunction('type', '-type_arg')` to sort by type then type_arg (in reversed order if prefixed with `-`).
     * Be sure you typed the values correctly! Else '11' will be before '2'.
     */
    sort?: SortFunction;
    /**
     * The class to apply to selectable cards. Use class from manager is unset.
     */
    selectableCardClass?: string | null;
    /**
     * The class to apply to selectable cards. Use class from manager is unset.
     */
    unselectableCardClass?: string | null;
    /**
     * The class to apply to selected cards. Use class from manager is unset.
     */
    selectedCardClass?: string | null;
}
interface AddCardSettings {
    /**
     * If the card will be on its visible side on the stock
     */
    visible?: boolean;
    forceToElement?: HTMLElement;
    /**
     * Force card position. Default to end of list. Do not use if sort is defined, as it will override it.
     */
    index?: number;
    /**
     * If the card need to be updated. Default true, will flip the card if needed.
     */
    updateInformations?: boolean;
    /**
     * Set if the card is selectable. Default is true, but will be ignored if the stock is not selectable.
     */
    selectable?: boolean;
}
interface RemoveCardSettings {
}
type CardSelectionMode = 'none' | 'single' | 'multiple';
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
declare class CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    private settings?;
    protected cards: T[];
    protected selectedCards: T[];
    protected selectionMode: CardSelectionMode;
    protected sort?: SortFunction;
    /**
     * Called when selection change. Returns the selection.
     *
     * selection: the selected cards of the stock
     * lastChange: the last change on selection card (can be selected or unselected)
     */
    onSelectionChange?: (selection: T[], lastChange: T | null) => void;
    /**
     * Called when selection change. Returns the clicked card.
     *
     * card: the clicked card (can be selected or unselected)
     */
    onCardClick?: (card: T) => void;
    /**
     * Creates the stock and register it on the manager.
     *
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager: CardManager<T>, element: HTMLElement, settings?: CardStockSettings);
    /**
     * Removes the stock and unregister it on the manager.
     */
    remove(): void;
    /**
     * @returns the cards on the stock
     */
    getCards(): T[];
    /**
     * @returns if the stock is empty
     */
    isEmpty(): boolean;
    /**
     * @returns the selected cards
     */
    getSelection(): T[];
    /**
     * @returns the selected cards
     */
    isSelected(card: T): boolean;
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    contains(card: T): boolean;
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    getCardElement(card: T): HTMLElement;
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    protected canAddCard(card: T, settings?: AddCardSettings): boolean;
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    protected getNewCardIndex(card: T): number | undefined;
    protected addCardElementToParent(cardElement: HTMLElement, settings?: AddCardSettings): void;
    protected moveFromOtherStock(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    protected moveFromElement(card: T, cardElement: HTMLElement, animation: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    addCards(cards: T[], animation?: CardAnimation<T>, settings?: AddCardSettings, shift?: number | boolean): Promise<boolean>;
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean>;
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    cardRemoved(card: T, settings?: RemoveCardSettings): void;
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    removeCards(cards: T[], settings?: RemoveCardSettings): Promise<boolean>;
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    removeAll(settings?: RemoveCardSettings): Promise<boolean>;
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    setSelectionMode(selectionMode: CardSelectionMode, selectableCards?: T[]): void;
    protected setSelectableCard(card: T, selectable: boolean): void;
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    setSelectableCards(selectableCards?: T[]): void;
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    selectCard(card: T, silent?: boolean): void;
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    unselectCard(card: T, silent?: boolean): void;
    /**
     * Select all cards
     */
    selectAll(silent?: boolean): void;
    /**
     * Unselect all cards
     */
    unselectAll(silent?: boolean): void;
    protected bindClick(): void;
    protected cardClick(card: T): void;
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    protected animationFromElement(element: HTMLElement, fromRect: DOMRect, settings: CardAnimationSettings): Promise<boolean>;
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    setCardVisible(card: T, visible: boolean, settings?: FlipCardSettings): void;
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    flipCard(card: T, settings?: FlipCardSettings): void;
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    getSelectableCardClass(): string | null;
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    getUnselectableCardClass(): string | null;
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    getSelectedCardClass(): string | null;
    removeSelectionClasses(card: T): void;
    removeSelectionClassesFromElement(cardElement: HTMLElement): void;
    /**
     * Changes the sort function of the stock.
     *
     * @param sort the new sort function. If defined, the stock will be sorted with this new function.
     */
    setSort(sort?: SortFunction): void;
}
type SideOrAngle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';
type SideOrAngleOrCenter = SideOrAngle | 'center';
interface DeckCounter {
    /**
     * Show a card counter on the deck. Default true.
     */
    show?: boolean;
    /**
     * Counter position. Default 'bottom'.
     */
    position?: SideOrAngleOrCenter;
    /**
     * Classes to add to counter (separated with spaces). Pre-built are `round` and `text-shadow`. Default `round`.
     */
    extraClasses?: string;
    /**
     * Show the counter when empty. Default true.
     */
    hideWhenEmpty?: boolean;
    /**
     * Set a counter id if you want to set a tooltip on it, for example. Default unset.
     */
    counterId?: string;
}
interface DeckSettings<T> {
    /**
     * Indicate the current top card.
     */
    topCard?: T;
    /**
     * Indicate the current number of cards in the deck (default 0).
     */
    cardNumber?: number;
    /**
     * Indicate if the card count is automatically updated when a card is added or removed.
     */
    autoUpdateCardNumber?: boolean;
    /**
     * Indicate if the cards under the new top card must be removed (to forbid players to check the content of the deck with Inspect). Default true.
     */
    autoRemovePreviousCards?: boolean;
    /**
     * Indicate the thresholds to add 1px to the thickness of the pile. Default [0, 2, 5, 10, 20, 30].
     */
    thicknesses?: number[];
    /**
     * Shadow direction. Default 'bottom-right'.
     */
    shadowDirection?: SideOrAngle;
    /**
     * Show a card counter on the deck. Not visible if unset.
     */
    counter?: DeckCounter;
    /**
     * A generator of fake cards, to generate decks top card automatically.
     * Default is manager `fakeCardGenerator` method.
     *
     * @param deckId the deck id
     * @return the fake card to be generated (usually, only informations to show back side)
     */
    fakeCardGenerator?: (deckId: string) => T;
}
interface AddCardToDeckSettings extends AddCardSettings {
    /**
     * Indicate if the card count is automatically updated when a card is added or removed. Default true.
     */
    autoUpdateCardNumber?: boolean;
    /**
     * Indicate if the cards under the new top card must be removed (to forbid players to check the content of the deck with Inspect). Default true.
     */
    autoRemovePreviousCards?: boolean;
}
interface RemoveCardFromDeckSettings extends RemoveCardSettings {
    /**
     * Indicate if the card count is automatically updated when a card is added or removed.
     */
    autoUpdateCardNumber?: boolean;
}
interface ShuffleAnimationSettings<T> {
    /**
     * Number of cards used for the animation (will use cardNumber is inferior to this number).
     * Default: 10.
     */
    animatedCardsMax?: number;
    /**
     * Card generator for the animated card. Should only show the back of the cards.
     * Default if fakeCardGenerator from Deck (or Manager if unset in Deck).
     */
    fakeCardSetter?: (card: T, index: number) => void;
    /**
     * The top card after the shuffle animation.
     * Default is a card generated with fakeCardGenerator from Deck (or Manager if unset in Deck).
     */
    newTopCard?: T;
    /**
     * Time to wait after shuffle, in case it is chained with other animations, to let the time to understand it's 2 different animations.
     * Default is 500ms.
     */
    pauseDelayAfterAnimation?: number;
}
declare class SlideAndBackAnimation<T> extends BgaCumulatedAnimation<BgaCumulatedAnimationsSettings> {
    constructor(manager: CardManager<T>, element: HTMLElement, tempElement: boolean);
}
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
declare class Deck<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected cardNumber: number;
    protected autoUpdateCardNumber: boolean;
    protected autoRemovePreviousCards: boolean;
    protected fakeCardGenerator?: (deckId: string) => T;
    protected thicknesses: number[];
    constructor(manager: CardManager<T>, element: HTMLElement, settings: DeckSettings<T>);
    protected createCounter(counterPosition: SideOrAngleOrCenter, extraClasses: string, counterId?: string): void;
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    getCardNumber(): number;
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     * @param topCard the deck top card. If unset, will generated a fake card (default). Set it to null to not generate a new topCard.
     */
    setCardNumber(cardNumber: number, topCard?: T | null | undefined): Promise<boolean>;
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean>;
    cardRemoved(card: T, settings?: RemoveCardFromDeckSettings): void;
    removeAll(settings?: RemoveCardFromDeckSettings): Promise<boolean>;
    getTopCard(): T | null;
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    shuffle(settings?: ShuffleAnimationSettings<T>): Promise<boolean>;
    protected getFakeCard(): T;
}
interface LineStockSettings extends CardStockSettings {
    /**
     * Indicate if the line should wrap when needed (default wrap)
     */
    wrap?: 'wrap' | 'nowrap';
    /**
     * Indicate the line direction (default row)
     */
    direction?: 'row' | 'column';
    /**
     * indicate if the line should be centered (default yes)
     */
    center?: boolean;
    /**
    * CSS to set the gap between cards. '8px' if unset.
    */
    gap?: string;
}
/**
 * A basic stock for a list of cards, based on flex.
 */
declare class LineStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    constructor(manager: CardManager<T>, element: HTMLElement, settings?: LineStockSettings);
}
interface SlotStockSettings<T> extends LineStockSettings {
    /**
     * The ids for the slots (can be number or string)
     */
    slotsIds: SlotId[];
    /**
     * The classes to apply to each slot
     */
    slotClasses?: string[];
    /**
     * How to place the card on a slot automatically
     */
    mapCardToSlot?: (card: T) => SlotId;
}
type SlotId = number | string;
interface AddCardToSlotSettings extends AddCardSettings {
    /**
     * The slot to place the card on.
     */
    slot?: SlotId;
}
/**
 * A stock with fixed slots (some can be empty)
 */
declare class SlotStock<T> extends LineStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected slotsIds: SlotId[];
    protected slots: HTMLDivElement[];
    protected slotClasses: string[];
    protected mapCardToSlot?: (card: T) => SlotId;
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(manager: CardManager<T>, element: HTMLElement, settings: SlotStockSettings<T>);
    protected createSlot(slotId: SlotId): void;
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToSlotSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToSlotSettings): Promise<boolean>;
    /**
     * Change the slots ids. Will empty the stock before re-creating the slots.
     *
     * @param slotsIds the new slotsIds. Will replace the old ones.
     */
    setSlotsIds(slotsIds: SlotId[]): void;
    /**
     * Add new slots ids. Will not change nor empty the existing ones.
     *
     * @param slotsIds the new slotsIds. Will be merged with the old ones.
     */
    addSlotsIds(newSlotsIds: SlotId[]): void;
    protected canAddCard(card: T, settings?: AddCardToSlotSettings): boolean;
    /**
     * Swap cards inside the slot stock.
     *
     * @param cards the cards to swap
     * @param settings for `updateInformations` and `selectable`
     */
    swapCards(cards: T[], settings?: AddCardSettings): Promise<boolean[]>;
}
interface ScrollableStockButtonSettings {
    /**
     * The HTML applied in the button
     */
    html?: string;
    /**
     * The classes added the button
     */
    classes?: string[];
}
interface ScrollableStockSettings extends CardStockSettings {
    /**
     * Setting for the left button
     */
    leftButton: ScrollableStockButtonSettings;
    /**
     * Setting for the right button
     */
    rightButton: ScrollableStockButtonSettings;
    /**
     * indicate the scroll (in px) when clicking the buttons
     */
    scrollStep?: number;
    /**
     * indicate if the scrollbar is visible (default true)
     */
    scrollbarVisible?: boolean;
    /**
    * CSS to set the gap between the buttons and the card container. '0' if unset.
    */
    buttonGap?: string;
    /**
     * indicate if the line should be centered (default yes)
     */
    center?: boolean;
    /**
    * CSS to set the gap between cards. '8px' if unset.
    */
    gap?: string;
}
/**
 * A stock with button to scroll left/right if content is bigger than available width
 */
declare class ScrollableStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected scrollStep: number;
    protected element: HTMLElement;
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(manager: CardManager<T>, elementWrapper: HTMLElement, settings: ScrollableStockSettings);
    protected createButton(side: 'left' | 'right', settings: ScrollableStockButtonSettings): HTMLButtonElement;
    protected scroll(side: 'left' | 'right'): void;
}
interface HandStockSettings extends CardStockSettings {
    /**
     * card overlap, in CSS with unit. Default 60px
     */
    cardOverlap?: string;
    /**
     * card shift, in CSS with unit. Default 15px
     */
    cardShift?: string;
    /**
     * the inclination between each card. Default 12
     */
    inclination?: number;
}
declare class HandStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected inclination: number;
    constructor(manager: CardManager<T>, element: HTMLElement, settings: HandStockSettings);
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    cardRemoved(card: T, settings?: RemoveCardSettings): void;
    protected updateAngles(): void;
}
/**
 * A stock with manually placed cards
 */
declare class ManualPositionStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    protected updateDisplay: (element: HTMLElement, cards: T[], lastCard: T, stock: ManualPositionStock<T>) => any;
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager: CardManager<T>, element: HTMLElement, settings: CardStockSettings, updateDisplay: (element: HTMLElement, cards: T[], lastCard: T, stock: ManualPositionStock<T>) => any);
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    cardRemoved(card: T, settings?: RemoveCardSettings): void;
}
interface AddCardToVoidStockSettings extends AddCardSettings {
    /**
     * Removes the card after adding.
     * Set to false if you want to add the card to the void to stock to animate it to another stock just after.
     * Default true
     */
    remove?: boolean;
}
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
declare class VoidStock<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    constructor(manager: CardManager<T>, element: HTMLElement);
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToVoidStockSettings): Promise<boolean>;
}
interface AllVisibleDeckSettings extends CardStockSettings {
    /**
     * The shift between each card (default 3). Will be ignored if verticalShift and horizontalShift are set.
     */
    shift?: string;
    /**
     * The vertical shift between each card (default 3). Overrides shift.
     */
    verticalShift?: string;
    /**
     * The horizontal shift between each card (default 3). Overrides shift.
     */
    horizontalShift?: string;
    /**
     * The direction when it expands (default 'vertical')
     */
    direction?: 'vertical' | 'horizontal';
    /**
     * Show a card counter on the deck. Not visible if unset.
     */
    counter?: DeckCounter;
}
declare class AllVisibleDeck<T> extends CardStock<T> {
    protected manager: CardManager<T>;
    protected element: HTMLElement;
    constructor(manager: CardManager<T>, element: HTMLElement, settings: AllVisibleDeckSettings);
    addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean>;
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    setOpened(opened: boolean): void;
    cardRemoved(card: T): void;
    protected createCounter(counterPosition: SideOrAngleOrCenter, extraClasses: string, counterId?: string): void;
    /**
     * Updates the cards number, if the counter is visible.
     */
    protected cardNumberUpdated(): void;
}
interface CardManagerSettings<T> {
    /**
     * Define the id that will be set to each card div. It must generate a unique id for each different card, so it's often linked to card id.
     * If you use different cards types that couldhave the same ids, you must define this method to make it different for each type (for example : `getId: (card) => 'other-card-type-' + card.id`).
     *
     * Default: the id will be set to `card-${card.id}`.
     *
     * @param card the card informations
     * @return the id for a card
     */
    getId?: (card: T) => string;
    /**
     * Allow to populate the main div of the card. You can set classes or dataset, if it's informations shared by both sides.
     *
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * Allow to populate the front div of the card. You can set classes or dataset to show the correct card face.
     * You can also add some translated text on the card at this moment.
     *
     * @param card the card informations
     * @param element the card front Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * Allow to populate the back div of the card. You can set classes or dataset to show the correct card face.
     * You can also add some translated text on the card at this moment.
     *
     * @param card the card informations
     * @param element  the card back Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupBackDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * A function to determine if the card should show front side or back side, based on the informations of the card object.
     * If you only manage visible cards, set it to `() => true`.
     * Default is `card.type` is truthy.
     *
     * @param card the card informations
     * @return true if front side should be visible
     */
    isCardVisible?: (card: T) => boolean;
    /**
     * A generator of fake cards, to generate decks top card automatically.
     * Default is generating an empty card, with only id set.
     *
     * @param deckId the deck id
     * @return the fake card to be generated (usually, only informations to show back side)
     */
    fakeCardGenerator?: (deckId: string) => T;
    /**
     * The animation manager used in the game. If not provided, a new one will be instanciated for this card manager. Useful if you use AnimationManager outside of card manager, to avoid double instanciation.
     */
    animationManager?: AnimationManager;
    /**
     * Indicate the width of a card (in px). Used for Deck stocks.
     */
    cardWidth?: number;
    /**
     * Indicate the height of a card (in px). Used for Deck stocks.
     */
    cardHeight?: number;
    /**
     * The class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    selectableCardClass?: string | null;
    /**
     * The class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    unselectableCardClass?: string | null;
    /**
     * The class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    selectedCardClass?: string | null;
}
interface FlipCardSettings {
    /**
     * Updates the data of the flipped card, so the stock containing it will return the new data when using getCards().
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method.
     * Default true
     */
    updateData?: boolean;
    /**
     * Updates the main div display, by calling `setupDiv`.
     * Default true
     */
    updateMain?: boolean;
    /**
     * Updates the front display, by calling `setupFrontDiv`.
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method.
     * Default true
     */
    updateFront?: boolean;
    /**
     * Updates the back display, by calling `setupBackDiv`.
     * The new data is the card passed as the first argument of the `setCardVisible` / `flipCard` method.
     * Default false
     */
    updateBack?: boolean;
    /**
     * Delay before updateMain (in ms).
     * Allow the card main div setting to be visible during the flip animation.
     * Default 0.
     */
    updateMainDelay?: number;
    /**
     * Delay before updateFront (in ms).
     * Allow the card front to be visible during the flip animation.
     * Default 500
     */
    updateFrontDelay?: number;
    /**
     * Delay before updateBackDelay (in ms).
     * Allow the card back to be visible during the flip animation.
     * Default 0
     */
    updateBackDelay?: number;
}
declare class CardManager<T> {
    game: Game;
    private settings;
    animationManager: AnimationManager;
    private stocks;
    private updateMainTimeoutId;
    private updateFrontTimeoutId;
    private updateBackTimeoutId;
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    constructor(game: Game, settings: CardManagerSettings<T>);
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    animationsActive(): boolean;
    addStock(stock: CardStock<T>): void;
    removeStock(stock: CardStock<T>): void;
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
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    removeCard(card: T, settings?: RemoveCardSettings): Promise<boolean>;
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    getCardStock(card: T): CardStock<T>;
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    isCardVisible(card: T): boolean;
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    setCardVisible(card: T, visible?: boolean, settings?: FlipCardSettings): void;
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    flipCard(card: T, settings?: FlipCardSettings): void;
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    updateCardInformations(card: T, settings?: Omit<FlipCardSettings, 'updateData'>): void;
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    getCardWidth(): number | undefined;
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    getCardHeight(): number | undefined;
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    getSelectableCardClass(): string | null;
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    getUnselectableCardClass(): string | null;
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    getSelectedCardClass(): string | null;
    getFakeCardGenerator(): (deckId: string) => T;
}
declare const define: any;
