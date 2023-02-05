import { GameType } from '@app/constants/basic-constants';
import { Timer } from '@app/constants/basic-interface';

export enum RoomVisibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    RANKED = 'ranked',
}

export interface GameSettings {
    isRanked: boolean;
    timer: Timer;
    dictionary: string;
    roomName: string;
    virtualPlayerName?: string;
    isEasyMode?: boolean;
    gameType: GameType;
    roomVisibility: RoomVisibility;
    password?: string;
}
