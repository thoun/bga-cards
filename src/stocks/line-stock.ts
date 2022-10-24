interface LineStockSettings {
    wrap?: 'wrap' | 'nowrap';
    direction?: 'row' | 'column';
    center?: boolean;
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