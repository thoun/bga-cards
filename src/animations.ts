interface CardAnimationSettings extends SlideAnimationSettings {
    /**
     * The stock to take the card. It will automatically remove the card from the other stock.
     */
    fromStock?: CardStock<any>;

    /**
     * The element to move the card from.
     */
    fromElement?: HTMLElement;
}