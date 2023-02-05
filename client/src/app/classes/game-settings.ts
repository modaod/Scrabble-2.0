import { Timer } from './timer';

export enum RoomVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    RANKED = 'ranked',
}

export enum GameType {
    CLASSIC = 'Classic',
    LOG2990 = 'Log2990',
}

export interface GameSettings {
    roomName: string;
    virtualPlayerName?: string;
    isSoloMode: boolean;
    isEasyMode?: boolean;
    timer: Timer;
    dictionary: string;
    gameType: GameType;
    roomVisibility: RoomVisibility;
    password?: string;
}
