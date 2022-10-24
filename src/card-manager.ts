interface CardManagerSettings<T> {
    getId?: (card: T) => string;
    setupDiv?: (card: T, element: HTMLDivElement) => void;
    setupFrontDiv?: (card: T, element: HTMLDivElement) => void;
    setupBackDiv?: (card: T, element: HTMLDivElement) => void;
}

class CardManager<T> {
    private stocks: CardStock<T>[] = [];

    constructor(public game: Game, private settings: CardManagerSettings<T>) {
    }

    public addStock(stock: CardStock<T>) {
        this.stocks.push(stock);
    }

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

    public getCardStock(card: T): CardStock<T> {
        return this.stocks.find(stock => stock.contains(card));
    }
}