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


class HandStock<T> extends CardStock<T> {
    protected inclination: number;

    constructor(protected manager: CardManager<T>, protected element: HTMLElement, protected settings: HandStockSettings) {
        super(manager, element, settings);
        element.classList.add('hand-stock');
        element.style.setProperty('--card-overlap', settings.cardOverlap ?? '60px');
        element.style.setProperty('--card-shift', settings.cardShift ?? '15px');
        element.style.setProperty('--card-inclination', `${settings.inclination ?? 12}deg`);

        this.inclination = settings.inclination ?? 4;
    }        

    public addCard(card: T, animation?: CardAnimationSettings, settings?: AddCardSettings): Promise<boolean> {
        const index = this.getNewCardIndex(card) ?? this.cards.length;

        const addedCards = this.cards.slice();
        addedCards.splice(index, 0, card);
        const newCardMiddleIndex = this.getMiddleIndexes(addedCards)[index];
        const parallelAnimations: ParallelAnimation[] = [
            { keyframes: [
                { transform: `translateY(${Math.abs(newCardMiddleIndex) * (/*Number(this.settings.cardShift) ??*/ 15)}px) rotate(${newCardMiddleIndex * (this.settings.inclination ?? 12)}deg)`, offset: 1}
            ] }
        ];

        let promise: Promise<boolean> = super.addCard(card, { ...animation, parallelAnimations}, settings);

        this.updateAngles();

        return promise;
    }

    public cardRemoved(card: T, settings?: RemoveCardSettings) {
        super.cardRemoved(card, settings);

        this.updateAngles();
    }

    protected getMiddleIndexes(cards: T[]): number[] {
        const middle = (cards.length - 1) / 2;
        return cards.map((card, index) => index - middle);
    }

    protected updateAngles(fakeIndex?: number) {
        const middle = (this.cards.length - 1) / 2;
        this.cards.forEach((card, index) => {
            const middleIndex = index - middle;
            const cardElement = this.getCardElement(card);
            cardElement.style.setProperty('--hand-stock-middle-index', `${middleIndex}`);
            cardElement.style.setProperty('--hand-stock-middle-index-abs', `${Math.abs(middleIndex)}`);
        });
    }
}