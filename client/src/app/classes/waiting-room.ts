import { GameType, RoomVisibility } from './game-settings';
import { PublicUser } from './public-user';
import { Timer } from './timer';

export interface WaitingRoom {
    hostName: string;
    users: PublicUser[];
    roomName: string;
    timer: Timer;
    gameType: GameType;
    isGameStarted: boolean;
    roomVisibility: RoomVisibility;
    password?: string;
}
