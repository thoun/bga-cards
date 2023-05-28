
// example of a custom function.
 function stockSlideWithDoubleLoopAnimation(animationManager, animation) {
    const promise = new Promise((success) => {
        const settings = animation.settings;
        const element = settings.element;

        const originBR = settings.fromRect;
        const destinationBR = element.getBoundingClientRect();

        const deltaX = (destinationBR.left + destinationBR.right)/2 - (originBR.left + originBR.right)/2;
        const deltaY = (destinationBR.top + destinationBR.bottom)/2 - (originBR.top+ originBR.bottom)/2;

        element.style.zIndex = '10';
        element.style.transform = `translate(${-deltaX}px, ${-deltaY}px) rotate(${(settings.rotationDelta ?? 0) + 720}deg)`;

        setTimeout(() => {
            element.offsetHeight;
            element.style.transition = `transform 0.5s linear`;
            element.offsetHeight;
            element.style.transform = null;
        }, 10);
        setTimeout(() => {
            element.style.zIndex = null;
            element.style.transition = null;
            success();
        }, 600);
    });
    return promise;
}
