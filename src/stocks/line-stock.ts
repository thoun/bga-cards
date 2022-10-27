interface LineStockSettings {
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

class LineStock<T> extends CardStock<T> {
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings?: LineStockSettings) {
        super(manager, element);
        element.classList.add('line-stock');

        element.dataset.center = (settings?.center ?? true).toString();
        element.style.setProperty('--wrap', settings?.wrap ?? 'wrap');
        element.style.setProperty('--direction', settings?.direction ?? 'row');
        element.style.setProperty('--gap', settings?.gap ?? '8px');
    }
}