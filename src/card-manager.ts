interface CardManagerSettings<T> {
    /**
     * @param card the card informations
     * @return the id for a card
     */
    getId?: (card: T) => string;

    /**
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * @param card the card informations
     * @param element the card main Div element. You can add a class (to set width/height), change dataset, ... based on the card informations. There should be no visual informations on it, as it will be set on front/back Divs.
     * @return the id for a card
     */
    setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
    /**
     * @param card the card informations
     * @param element  the card back Div element. You can add a class, change dataset, set background for the back side
     * @return the id for a card
     */
    setupBackDiv?: (card: T, element: HTMLDivElement) => void;
}

class CardManager<T> {
    private stocks: CardStock<T>[] = [];

    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    constructor(public game: Game, private settings: CardManagerSettings<T>) {
    }

    public addStock(stock: CardStock<T>) {
        this.stocks.push(stock);
    }

    /**
     * @param card the card informations
     * @return the id for a card
     */
    public getId(card: T) {
        return this.settings.getId?.(card) ?? `card-${(card as any).id}`;
    }

    public createCardElement(card: T, visible: boolean = true): HTMLDivElement {
        const id = this.getId(card);
        const side = visible ? 'front' : 'back';

        // TODO check if exists
        const element = document.createElement("div");
        element.id = id;
        element.dataset.side = ''+side;
        element.innerHTML = `
            <div class="card-sides">
                <div class="card-side front">
                </div>
                <div class="card-side back">
                </div>
            </div>
        `;
        element.classList.add('card');
        document.body.appendChild(element);
        this.settings.setupDiv?.(card, element);
        this.settings.setupFrontDiv?.(card, element.getElementsByClassName('front')[0] as HTMLDivElement);
        this.settings.setupBackDiv?.(card, element.getElementsByClassName('back')[0] as HTMLDivElement);
        document.body.removeChild(element);
        return element;
    }

    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    public getCardElement(card: T): HTMLElement {
        return document.getElementById(this.getId(card));
    }

    public removeCard(card: T) {
        const id = this.getId(card);
        const div = document.getElementById(id);
        if (!div) {
            return;
        }

        div.id = `deleted${id}`;
        // TODO this.removeVisibleInformations(div);
        div.remove();
    }

    /**
     * @param card the card informations
     * @return the stock containing the card
     */
    public getCardStock(card: T): CardStock<T> {
        return this.stocks.find(stock => stock.contains(card));
    }
}