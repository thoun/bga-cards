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


class AllVisibleDeck<T> extends CardStock<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: AllVisibleDeckSettings) {
        super(manager, element, settings);
        element.classList.add('all-visible-deck', settings.direction ?? 'vertical');

        const cardWidth = this.manager.getCardWidth();
        const cardHeight = this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            this.element.style.setProperty('--width', `${cardWidth}px`);
            this.element.style.setProperty('--height', `${cardHeight}px`);
        } else {
            throw new Error(`You need to set cardWidth and cardHeight in the card manager to use Deck.`);
        }
        element.style.setProperty('--vertical-shift', settings.verticalShift ?? settings.shift ?? '3px');
        element.style.setProperty('--horizontal-shift', settings.horizontalShift ?? settings.shift ?? '3px');

        if (settings.counter && (settings.counter.show ?? true)) {
            this.createCounter(settings.counter.position ?? 'bottom', settings.counter.extraClasses ?? 'round', settings.counter.counterId);

            if (settings.counter?.hideWhenEmpty) {
                this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                this.element.dataset.empty = 'true';
            }
        }
    }        

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardSettings): Promise<boolean> {
        let promise: Promise<boolean>;

        const order = this.cards.length;
        promise = super.addCard(card, animation, settings);
        
        const cardId = this.manager.getId(card);
        const cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', ''+order);
        
        this.cardNumberUpdated();

        return promise;
    }

    /**
     * Set opened state. If true, all cards will be entirely visible.
     * 
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    public setOpened(opened: boolean) {
        this.element.classList.toggle('opened', opened);
    }

    public cardRemoved(card: T) {
        super.cardRemoved(card);
        this.cards.forEach((c, index) => {
            const cardId = this.manager.getId(c);
            const cardDiv = document.getElementById(cardId)
            cardDiv.style.setProperty('--order', ''+index);
        });

        this.cardNumberUpdated();
    }

    protected createCounter(counterPosition: SideOrAngleOrCenter, extraClasses: string, counterId?: string) {
        const left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        const top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', `${left}%`);
        this.element.style.setProperty('--bga-cards-deck-top', `${top}%`);

        this.element.insertAdjacentHTML('beforeend', `
            <div ${counterId ? `id="${counterId}"` : ''} class="bga-cards_deck-counter ${extraClasses}">0</div>
        `);
    }

    /**
     * Updates the cards number, if the counter is visible.
     */
    protected cardNumberUpdated() {
        const cardNumber = this.cards.length;
        this.element.style.setProperty('--tile-count', ''+cardNumber);
        this.element.dataset.empty = (cardNumber == 0).toString();

        const counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = `${cardNumber}`;
        }
    }
}