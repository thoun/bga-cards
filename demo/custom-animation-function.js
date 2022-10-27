
// example of a custom function.
 function stockSlideWithDoubleLoopAnimation(settings) {
    const promise = new Promise((success) => {

        const originBR = settings.fromElement.getBoundingClientRect();
        const destinationBR = settings.element.getBoundingClientRect();

        const deltaX = (destinationBR.left + destinationBR.right)/2 - (originBR.left + originBR.right)/2;
        const deltaY = (destinationBR.top + destinationBR.bottom)/2 - (originBR.top+ originBR.bottom)/2;

        settings.element.style.zIndex = '10';
        settings.element.style.transform = `translate(${-deltaX}px, ${-deltaY}px) rotate(${(settings.rotationDelta ?? 0) + 720}deg)`;

        const side = settings.element.dataset.side;
        if (settings.originalSide && settings.originalSide != side) {
            const cardSides = settings.element.getElementsByClassName('card-sides')[0];
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
