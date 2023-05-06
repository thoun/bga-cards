class HiddenDeck<T> extends Deck<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: DeckSettings) {
        super(manager, element, settings);
        element.classList.add('hidden-deck');

        this.element.appendChild(this.manager.createCardElement({ id: `${element.id}-hidden-deck-back` } as any, false));
    }

    public addCard(card: T, animation?: CardAnimation<T>, settings?: AddCardToDeckSettings): Promise<boolean> {
        const newSettings: AddCardToDeckSettings = {
            ...settings,
            visible: settings?.visible ?? false
        }
        return super.addCard(card, animation, newSettings);
    }
}