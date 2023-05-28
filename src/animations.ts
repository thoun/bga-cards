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
