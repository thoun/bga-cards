interface ScrollableStockButtonSettings {
    /**
     * The HTML applied in the button
     */
    html?: string;

    /**
     * The classes added the button
     */
    classes?: string[];
}

interface ScrollableStockSettings extends CardStockSettings {
    /**
     * Setting for the left button
     */
    leftButton: ScrollableStockButtonSettings;

    /**
     * Setting for the right button
     */
    rightButton: ScrollableStockButtonSettings;

    /**
     * indicate the scroll (in px) when clicking the buttons
     */
    scrollStep?: number;

    /**
     * indicate if the scrollbar is visible (default true)
     */
    scrollbarVisible?: boolean;
    
    /**
    * CSS to set the gap between the buttons and the card container. '0' if unset.
    */
    buttonGap?: string;

    /**
     * indicate if the line should be centered (default yes)
     */
    center?: boolean;
    
    /**
    * CSS to set the gap between cards. '8px' if unset.
    */
    gap?: string;
}


/**
 * A stock with button to scroll left/right if content is bigger than available width
 */
class ScrollableStock<T> extends CardStock<T> {
    protected scrollStep: number;
    protected element: HTMLElement;

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `SlotStockSettings` object
     */
    constructor(protected manager: CardManager<T>, elementWrapper: HTMLElement, settings: ScrollableStockSettings) {
        super(manager, elementWrapper, settings);
        elementWrapper.classList.add('scrollable-stock');
        elementWrapper.dataset.center = (settings.center ?? true).toString();
        elementWrapper.style.setProperty('--button-gap', settings.buttonGap ?? '0');
        elementWrapper.style.setProperty('--gap', settings.gap ?? '8px');

        this.scrollStep = settings.scrollStep ?? 100;
        elementWrapper.dataset.scrollbarVisible = (settings.scrollbarVisible ?? true).toString();

        elementWrapper.appendChild(this.createButton('left', settings.leftButton));

        this.element = document.createElement('div');
        this.element.classList.add('scrollable-stock-inner');
        elementWrapper.appendChild(this.element);

        elementWrapper.appendChild(this.createButton('right', settings.rightButton));
    }

    protected createButton(side: 'left' | 'right', settings: ScrollableStockButtonSettings) {
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add(side, ...(settings.classes ?? []));

        if (settings.html) {
            button.innerHTML = settings.html;
        }

        button.addEventListener('click', () => this.scroll(side));
        return button;
    }

    protected scroll(side: 'left' | 'right') {
        this.element.scrollBy({
            left: this.scrollStep * (side === 'left' ? -1 : 1),
            behavior: 'smooth'
        });
    }
}