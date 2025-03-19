/**
 * Framework interfaces
 */

interface Game {
    instantaneousMode: boolean;
    getBoundingClientRectIgnoreZoom(element: Element): DOMRect;
    /**
     * Function to know if animations should be played.
     * Animations should not be played in instantaneousMode, or if the tab is not displayed in the browser.
     * 
     * @returns {boolean} if animations should be played
     */
    bgaAnimationsActive(): boolean;
    /**
     * Return a Promise that resolves at the end of a given number of ms.
     * If animations are not active, resolve instantaneously.
     * 
     * @param {number} delay the time to wait, in milliseconds
     * @returns a promise when the timer ends
     */
    wait(delay: number): Promise<any>;
    
    setup: (gamedatas: any) => void;
    onEnteringState: (stateName: string, args: any) => void;
    onLeavingState: (stateName: string ) => void;
    onUpdateActionButtons: (stateName: string, args: any) => void;
    setupNotifications: () => void;
    //format_string_recursive: (log: string, args: any) => void;
}

interface Notif<T> {
    args: T;
    log: string;
    move_id: number;
    table_id: string;
    time: number;
    type: string;
    uid: string;
}

type Gamestate = any; // TODO

interface Player {
    beginner: boolean;
    color: string;
    color_back: any | null;
    eliminated: number;
    id: string;
    is_ai: string;
    name: string;
    score: string;
    zombie: number;
}