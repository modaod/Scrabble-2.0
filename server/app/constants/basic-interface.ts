import { Letter } from '@app/classes/letter';
import { Direction, UserType } from './basic-constants';
import { Goal } from './goal-constants';
import { Leagues } from '@app/constants/leagues';

export interface LetterPosition {
    letter: Letter;
    x: number;
    y: number;
}
export interface PlaceLetterCommandInfo {
    letterCoord: number;
    numberCoord: number;
    direction: Direction;
    letters: string;
}
export interface User {
    uid: string;
    username: string;
    email: string;
    avatarUrl: string;
    status: string;
    // TODO voir pour friends car ici recoit un objet et une autre interface serait préférable
    rankedLeague: Leagues;
    rankedPoints: number,
    friends: string[];
    outgoingFriendRequests: string[];
    incomingFriendsRequest: string[];

    difficulty?: string;
}
export interface PublicUser {
    username: string;
    avatar: string;
    userType: UserType;
}

export interface Observer {
    uid: string;
    username: string;
    avatar: string;
}

export interface GameState {
    board: string[][];
    hand: string[];
    currentTurn: number;
    isYourTurn: boolean;
    reserveLength: number;
    gameOver: boolean;
    publicPlayerInformation: PublicPlayerInformation[];
    boardWithInvalidWords?: string[][];
    yourGoals?: Goal[];
    oppenentGoals?: Goal[];
    isRanked: boolean;
}

export interface PublicPlayerInformation {
    handLength: number;
    score: number;
}

export interface ObserverGameState {
    board: string[][];
    currentTurn: number;
    reserveLength: number;
    gameOver: boolean;
    publicPlayerInformation: ObserverPublicPlayerInformation[];
    boardWithInvalidWords?: string[][];
}

export interface ObserverPublicPlayerInformation {
    hand: string[];
    score: number;
}

export interface Message {
    username: string;
    body: string;
    color?: string;
}
export class Timer {
    minute: number;
    second: number;
}

export interface GridPosition {
    row: string;
    column: number;
}
