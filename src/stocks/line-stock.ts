interface LineStockSettings extends CardStockSettings {
    /**
     * Indicate if the line should wrap when needed (default wrap)
     */
    wrap?: 'wrap' | 'nowrap';

    /**
     * Indicate the line direction (default row)
     */
    direction?: 'row' | 'column';

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
 * A basic stock for a list of cards, based on flex.
 */
class LineStock<T> extends CardStock<T> {
    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `LineStockSettings` object
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings?: LineStockSettings) {
        super(manager, element, settings);
        element.classList.add('line-stock');

        element.dataset.center = (settings?.center ?? true).toString();
        element.style.setProperty('--wrap', settings?.wrap ?? 'wrap');
        element.style.setProperty('--direction', settings?.direction ?? 'row');
        element.style.setProperty('--gap', settings?.gap ?? '8px');
    }
}