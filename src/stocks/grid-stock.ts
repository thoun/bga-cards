type GridStockCoordinates = { x: number, y: number };

interface GridStockSettings<T> extends SlotStockSettings<T> {

    /**
     * How to place the card on a slot automatically
     */
    mapCardToCoordinates?: (card: T) => GridStockCoordinates;

    /**
     * Define the minX for the grid. Useful if the grid is of a fixed size.
     */
    minX?: number;

    /**
     * Define the minY for the grid. Useful if the grid is of a fixed size.
     */
    minY?: number;

    /**
     * Define the maxX for the grid. Useful if the grid is of a fixed size.
     */
    maxX?: number;

    /**
     * Define the maxY for the grid. Useful if the grid is of a fixed size.
     */
    maxY?: number;
}

interface AddCardToGridSettings extends AddCardToSlotSettings {
    /**
     * The coordinates to place the card on.
     */
    coordinates: GridStockCoordinates;
}

/**
 * A grid stock with fixed slots (some can be empty)
 */
class GridStock<T> extends SlotStock<T> {
    protected minX: number | null = null;
    protected minY: number | null = null;
    protected maxX: number | null = null;
    protected maxY: number | null = null;

    protected mapCardToCoordinates: (card: T) => GridStockCoordinates;

    /**
     * @param manager the card manager  
     * @param element the stock element (should be an empty HTML Element)
     * @param settings a `GridStockSettings` object
     */
    constructor(protected manager: CardManager<T>, protected element: HTMLElement, settings: GridStockSettings<T>) {
        super(manager, element, { ...settings, slotsIds: [], mapCardToSlot: card => this.getGridSlotId(settings.mapCardToCoordinates(card)) });
        if (!settings.mapCardToCoordinates) {
            throw new Error('You need to define GridStock settings.mapCardToCoordinates to use GridStock');
        }
        element.classList.add('grid-stock');

        this.mapCardToCoordinates = settings.mapCardToCoordinates;

        if (settings?.minX !== undefined || settings?.maxX !== undefined || settings?.minY !== undefined || settings?.maxY !== undefined) {
            if (settings.minX === undefined || settings.maxX === undefined || settings.minY === undefined || settings.maxY === undefined) {
                throw new Error(`If you define a min or a max for GridStockSettings, you need to define all of them`);
            }
            if (settings.maxX < settings.minX) {
                throw new Error(`GridStockSettings: maxX must be superior or equal to minX`);
            }
            if (settings.maxY < settings.minY) {
                throw new Error(`GridStockSettings: maxX must be superior or equal to minX`);
            }

            this.minX = settings.minX;
            this.maxX = settings.maxX;
            this.minY = settings.minY;
            this.maxY = settings.maxY;

            for (let x = settings.minX; x <= settings.maxX; x++) {
                for (let y = settings.minY; y <= settings.maxY; y++) {
                    this.slotsIds.push(this.getGridSlotId({ x, y }));
                }
            }
        }

        this.slotClasses = settings.slotClasses ?? [];
        this.slotsIds.forEach(slotId => {
            this.createSlot(slotId);
        });
        this.updateGridTemplateAreas();
    }

    /**
     * Return the slotId based on the coordinates
     */
    protected getGridSlotId(coordinates: GridStockCoordinates) {
        return `${coordinates.x}_${coordinates.y}`;
    }

    protected createSlot(slotId: SlotId) {
        super.createSlot(slotId);
        this.slots[slotId].style.setProperty('--area', `area_${slotId}`);
    }

    public addCard(card: T, animation?: CardAnimationSettings, settings?: AddCardToGridSettings): Promise<boolean> {
        const coordinates: GridStockCoordinates = settings?.coordinates ?? this.mapCardToCoordinates?.(card);
        this.makeSlotForCoordinates(coordinates);
        const slotSettings = {
            ...settings,
            slot: this.getGridSlotId(coordinates),
        };
        return super.addCard(card, animation, slotSettings);
    }

    /**
     * Expand the grid until a slot exists for the given coordinates.
     */
    public makeSlotForCoordinates(coordinates: GridStockCoordinates) {
        if (this.minX === null) { // no slot yet
            this.minX = coordinates.x;
            this.maxX = coordinates.x;
            this.minY = coordinates.y;
            this.maxY = coordinates.y;
            const slotId = this.getGridSlotId(coordinates);
            if (!this.slotsIds.includes(slotId)) {
                this.addSlotsIds([slotId]);
            }
            return;
        }

        this.extendToX(coordinates.x);
        this.extendToY(coordinates.y);
    }

    /**
     * Expand the grid until slots exists for the given coordinates.
     */
    public makeSlotsForCoordinates(coordinatesList: GridStockCoordinates[]) {
        coordinatesList.forEach(coordinates => this.makeSlotForCoordinates(coordinates));
    }

    public getMinX(): number {
        return this.minX;
    }
    public getMinY(): number {
        return this.minY;
    }
    public getMaxX(): number {
        return this.maxX;
    }
    public getMaxY(): number {
        return this.maxY;
    }

    /**
     * Expand the grid until slots exists for the given x.
     */
    public extendToX(x: number): void {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to extend the grid');
        }

        while (x < this.minX) {
            this.addColumnToTheLeft();
        }
        while (x > this.maxX) {
            this.addColumnToTheRight();
        }
    }

    /**
     * Expand the grid until slots exists for the given y.
     */
    public extendToY(y: number): void {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to extend the grid');
        }

        while (y < this.minY) {
            this.addRowToTheTop();
        }
        while (y > this.maxY) {
            this.addRowToTheBottom();
        }
    }

    /**
     * Must be called each time new slots are created.
     */
    protected updateGridTemplateAreas() {
        const linesAreas = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            const lineAreas = [];
            for (let x = this.minX; x <= this.maxX; x++) {
                lineAreas.push(`area_${x}_${y}`);
            }
            linesAreas.push(lineAreas.join(' '));
        }

        this.element.style.gridTemplateAreas = linesAreas.map(line => `"${line}"`).join(' ');
    }

    public addSlotsIds(newSlotsIds: string[]) {
        super.addSlotsIds(newSlotsIds);
        this.updateGridTemplateAreas();
    }

    /**
     * Add slots to the left of the grid.
     */
    public addColumnToTheLeft() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a column to the left');
        }
        this.minX = this.minX - 1;

        const newSlotsIds = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            newSlotsIds.push(`${this.minX}_${y}`);
        }
        this.addSlotsIds(newSlotsIds);
    }

    /**
     * Add slots to the right of the grid.
     */
    public addColumnToTheRight() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a column to the right');
        }
        this.maxX = this.maxX + 1;

        const newSlotsIds = [];
        for (let y = this.minY; y <= this.maxY; y++) {
            newSlotsIds.push(`${this.maxX}_${y}`);
        }
        this.addSlotsIds(newSlotsIds);
    }

    /**
     * Add slots to the top of the grid.
     */
    public addRowToTheTop() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a row to the top');
        }
        this.minY = this.minY - 1;

        const newSlotsIds = [];
        for (let x = this.minX; x <= this.maxX; x++) {
            newSlotsIds.push(`${x}_${this.minY}`);
        }
        this.addSlotsIds(newSlotsIds);
    }

    /**
     * Add slots to the bottom of the grid.
     */
    public addRowToTheBottom() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to add a row to the bottom');
        }
        this.maxY = this.maxY + 1;

        const newSlotsIds = [];
        for (let x = this.minX; x <= this.maxX; x++) {
            newSlotsIds.push(`${x}_${this.maxY}`);
        }
        this.addSlotsIds(newSlotsIds);
    }

    /**
     * Remove the slots on the leftmost column of the grid. Remove the cards in it if there are some.
     */
    public removeLeftmostColumn() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove the leftmost column');
        }
        for (let y = this.minY; y <= this.maxY; y++) {
            this.removeSlot(`${this.minX}_${y}`);
        }

        this.minX = this.minX + 1;
        this.updateGridTemplateAreas();
    }

    /**
     * Remove the slots on the rightmost column of the grid. Remove the cards in it if there are some.
     */
    public removeRightmostColumn() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove the rightmost column');
        }
        for (let y = this.minY; y <= this.maxY; y++) {
            this.removeSlot(`${this.maxX}_${y}`);
        }

        this.maxX = this.maxX - 1;
        this.updateGridTemplateAreas();
    }

    /**
     * Remove the slots on the top row of the grid. Remove the cards in it if there are some.
     */
    public removeTopRow() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove a row to the top');
        }
        for (let x = this.minX; x <= this.maxX; x++) {
            this.removeSlot(`${x}_${this.minY}`);
        }

        this.minY = this.minY + 1;
        this.updateGridTemplateAreas();
    }

    /**
     * Remove the slots on the bottom row of the grid. Remove the cards in it if there are some.
     */
    public removeBottomRow() {
        if (!this.slotsIds.length) {
            throw new Error('There is no slot on the grid, impossible to remove a row to the bottom');
        }
        for (let x = this.minX; x <= this.maxX; x++) {
            this.removeSlot(`${x}_${this.maxY}`);
        }

        this.maxY = this.maxY - 1;
        this.updateGridTemplateAreas();
    }

    /**
     * Returns true if a grid slot already exists
     */
    public gridSlotExists(coordinates: GridStockCoordinates): boolean {
        return this.slotsIds.includes(this.getGridSlotId(coordinates));
    }

    protected setSelectableGridSlot(coordinates: GridStockCoordinates, selectable: boolean) {
        this.setSelectableSlot(this.getGridSlotId(coordinates), selectable);
    }

    public setSelectableGridSlots(coordinates?: GridStockCoordinates[]) {
        this.setSelectableSlots(coordinates?.map(coord => this.getGridSlotId(coord)));
    }

    public setGridSlotSelectionMode(selectionMode: CardSelectionMode, selectableCoordinates?: GridStockCoordinates[]) {
        this.setSlotSelectionMode(selectionMode, selectableCoordinates?.map(coordinates => this.getGridSlotId(coordinates)));
    }

    /**
     * Remove all slots at the border (top/bottom lines and left/right columns) until there is no unnecessary space surrounding the cards.
     */
    public removeEmptySurroundingSlots(): void {
        if (!this.slotsIds.length) {
            return;
        }

        if (!this.getCards().length) {
            this.setSlotsIds([]); // remove all
            return;
        }

        const cardsCoordinates: GridStockCoordinates[] = this.getCards().map(card => this.mapCardToCoordinates(card));
        const xs: number[] = cardsCoordinates.map(coordinates => coordinates.x);
        const ys: number[] = cardsCoordinates.map(coordinates => coordinates.y);
        const newMinX = Math.min(...xs);
        const newMaxX = Math.max(...xs);
        const newMinY = Math.min(...ys);
        const newMaxY = Math.max(...ys);

        while (newMinX > this.minX) {
            this.removeLeftmostColumn();
        }
        while (newMaxX < this.maxX) {
            this.removeRightmostColumn();
        }
        while (newMinY > this.minY) {
            this.removeTopRow();
        }
        while (newMaxY < this.maxY) {
            this.removeBottomRow();
        }
    }
}