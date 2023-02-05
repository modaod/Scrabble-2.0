import { Leagues } from '@app/constants/leagues';

export interface User {
    uid: string;
    username: string;
    email: string;
    avatarUrl: string;
    status: string;
    language: string;
    theme: string;
    // TODO voir pour friends car ici recoit un objet et une autre interface serait préférable
    friends: string[];
    outgoingFriendRequests: string[];
    incomingFriendRequests: string[];
    activity?: UserActivity[];
    gamesPlayed?: UserGame[];
    rankedLevel: Leagues;
    rankedPoints: number;
    difficulty?: string;
}

export interface UserActivity {
    date: string;
    type: string;
}
export interface UserGame {
    gameId: string;
    score: number;
    time: number;
    win: boolean;
    date: string;
    opponents: string;
}

export interface GameRecap {
    score: number;
    time: number;
    win: boolean;
    date: string;
    opponents: string;
}
