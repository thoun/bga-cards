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

function stockSlideAnimation(settings: AnimationSettings): Promise<boolean> {
    const promise = new Promise<boolean>((success) => {

        const originBR = settings.fromElement.getBoundingClientRect();
        const destinationBR = settings.element.getBoundingClientRect();

        const deltaX = (destinationBR.left + destinationBR.right)/2 - (originBR.left + originBR.right)/2;
        const deltaY = (destinationBR.top + destinationBR.bottom)/2 - (originBR.top+ originBR.bottom)/2;

        settings.element.style.zIndex = '10';
        settings.element.style.transform = `translate(${-deltaX}px, ${-deltaY}px) rotate(${settings.rotationDelta ?? 0}deg)`;

        const side = settings.element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const cardSides = settings.element.getElementsByClassName('card-sides')[0] as HTMLDivElement;
            cardSides.style.transition = 'none';
            settings.element.dataset.side = settings.originalSide;
            setTimeout(() => {
                cardSides.style.transition = null;
                settings.element.dataset.side = side;
            });
        }

        setTimeout(() => {
            settings.element.offsetHeight;
            settings.element.style.transition = `transform 0.5s linear`;
            settings.element.offsetHeight;
            settings.element.style.transform = null;
        }, 10);
        setTimeout(() => {
            settings.element.style.zIndex = null;
            settings.element.style.transition = null;
            success(true);
        }, 600);
    });
    return promise;
}

/* example
function stockSlideWithDoubleLoopAnimation(settings: AnimationSettings): Promise<boolean> {
    const promise = new Promise<boolean>((success) => {

        const originBR = settings.fromElement.getBoundingClientRect();
        const destinationBR = settings.element.getBoundingClientRect();

        const deltaX = (destinationBR.left + destinationBR.right)/2 - (originBR.left + originBR.right)/2;
        const deltaY = (destinationBR.top + destinationBR.bottom)/2 - (originBR.top+ originBR.bottom)/2;

        settings.element.style.zIndex = '10';
        settings.element.style.transform = `translate(${-deltaX}px, ${-deltaY}px) rotate(${(settings.rotationDelta ?? 0) + 720}deg)`;

        const side = settings.element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const cardSides = settings.element.getElementsByClassName('card-sides')[0] as HTMLDivElement;
            cardSides.style.transition = 'none';
            settings.element.dataset.side = settings.originalSide;
            setTimeout(() => {
                cardSides.style.transition = null;
                settings.element.dataset.side = side;
            });
        }

        setTimeout(() => {
            settings.element.offsetHeight;
            settings.element.style.transition = `transform 0.5s linear`;
            settings.element.offsetHeight;
            settings.element.style.transform = null;
        }, 10);
        setTimeout(() => {
            settings.element.style.zIndex = null;
            settings.element.style.transition = null;
            success(true);
        }, 600);
    });
    return promise;
}
*/