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
     * An animation function, based on the `AnimationSettings` settings, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: (settings: AnimationSettings) => Promise<boolean>;
}

interface AnimationSettings {
    /**
     * The element to animate. The element is added to the destination stock before the animation starts. 
     */
    element: HTMLElement;

    /**
     * The HTMLElement to animate from.
     */
    fromElement: HTMLElement;

    /**
     * The side before animation.
     */
     originalSide?: 'front' | 'back';

    /**
     * If the card is rotated at the start of animation.
     */
    rotationDelta?: number;

    /**
     * An animation function, based on the `AnimationSettings` settings, that return a Promise at the end of animation (the promise returns true if animation ended, false otherwise)
     */
    animation?: (settings: AnimationSettings) => Promise<boolean>;
}
