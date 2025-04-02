interface DiscardDeckSettings extends CardStockSettings {
    /**
     * Max horizontal shift from the center (in % of the card width). Default 5.
     */
    maxHorizontalShift?: number;
    /**
     * Max vertical shift from the center (in % of the card height). Default 5.
     */
    maxVerticalShift?: number;
    /**
     * Max rotation (in deg). Default 5.
     */
    maxRotation?: number;
}

class DiscardDeck<T> extends CardStock<T> {
    // these are in px, as opposed to % in settings
    protected maxHorizontalShift: number;
    protected maxVerticalShift: number;
    protected maxRotation: number;

    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings?: DiscardDeckSettings) {
        super(manager, element, settings);
        element.classList.add('discard-deck');

        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        } else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }

        this.maxHorizontalShift = cardWidth * (settings?.maxHorizontalShift ?? 5) / 100;
        this.maxVerticalShift = cardHeight * (settings?.maxVerticalShift ?? 5) / 100;
        this.maxRotation = settings?.maxRotation ?? 5;

        const margins = this.getMargins();

        element.style.setProperty('--discard-deck-horizontal-margin', `${margins.horizontalMargin}px`);
        element.style.setProperty('--discard-deck-vertical-margin', `${margins.verticalMargin}px`);

        /*if (settings.counter && (settings.counter.show ?? true)) {
            this.createCounter(settings.counter.position ?? 'bottom', settings.counter.extraClasses ?? 'round', settings.counter.counterId);

            if (settings.counter?.hideWhenEmpty) {
                this.element.querySelector('.bga-cards_card-counter').classList.add('hide-when-empty');
                this.element.dataset.empty = 'true';
            }
        }*/
    } 

    protected getRandomArbitrary(min: number, max: number): number {
        return Math.floor(Math.random() * ((max + 1) - min) + min);
    }      
    
    protected getMargins() {
        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();

        const radians = (Math.PI / 180) * this.maxRotation; // Convert degrees to radians
        
        const maxWidth = Math.abs(cardWidth * Math.cos(radians)) + Math.abs(cardHeight * Math.sin(radians));
        const MaxHeight = Math.abs(cardWidth * Math.sin(radians)) + Math.abs(cardHeight * Math.cos(radians));
        
        const horizontalMargin = this.maxHorizontalShift + Math.ceil((maxWidth - cardWidth) / 2);
        const verticalMargin = this.maxVerticalShift + Math.ceil((MaxHeight - cardHeight) / 2);

        return { horizontalMargin, verticalMargin };
    }

    public addCard(card: T, animation?: CardAnimationSettings, settings?: AddCardSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        promise = super.addCard(card, animation, settings);
        
        const cardId = this.manager.getId(card);
        const cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--discard-deck-left', `${this.getRandomArbitrary(-this.maxHorizontalShift, this.maxHorizontalShift)}px`);
        cardDiv.style.setProperty('--discard-deck-top', `${this.getRandomArbitrary(-this.maxVerticalShift, this.maxVerticalShift)}px`);
        cardDiv.style.setProperty('--discard-deck-rotate', `${this.getRandomArbitrary(-this.maxRotation, this.maxRotation)}deg`);

        return promise;
    }
}