import { Injectable } from '@angular/core';
import { Goal } from '@app/classes/goal';
import { PublicUser } from '@app/classes/public-user';
import { GridPosition } from '@app/classes/vec2';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import {Player} from "@app/components/info-panel/players-info";

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

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    playerInfos: Player[] = [];
    isRankedGame: boolean = false;
    startTime: number
    private socket: Socket;
    private gameStateObservable: Observable<GameState>;
    private observerGameStateObservable: Observable<ObserverGameState>;
    private firstLetterPlacedObservable: Observable<GridPosition>;

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
        this.gameStateObservable = new Observable((observer: Observer<GameState>) => {
            this.socket.on('game-state', (state: GameState) => {
                observer.next(state);
            });
        });
        this.observerGameStateObservable = new Observable((observer: Observer<ObserverGameState>) => {
            this.socket.on('observer-game-state', (state: ObserverGameState) => observer.next(state));
        });
        this.firstLetterPlacedObservable = new Observable((observer: Observer<GridPosition>) => {
            this.socket.on('hereIsTheFirstLetterPlaced', (state: GridPosition) => observer.next(state));
        });
    }

    getJoinedPlayers() {
        this.socket.emit('getJoinedPlayers');
        this.startTime = new Date().getTime()
    }

    getObserverGameState() {
        this.socket.emit('getObserverGameState');
    }

    getJoinedPlayersListener(): Observable<PublicUser[]> {
        return new Observable((observer: Observer<PublicUser[]>) => {
            this.socket.on('joinedPlayers', (joinedPlayers: PublicUser[]) => observer.next(joinedPlayers));
        });
    }

    getPlayerID(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('sendID', (id: string) => observer.next(id));
        });
    }

    getGameStateObservable(): Observable<GameState> {
        return this.gameStateObservable;
    }

    getObserverGameStateObservable(): Observable<ObserverGameState> {
        return this.observerGameStateObservable;
    }

    getFirstLetterPlacedObservable(): Observable<GridPosition> {
        return this.firstLetterPlacedObservable;
    }

    sendAbandonRequest() {
        this.socket.emit('abandon');
    }

    notifyGameStateReceived() {
        this.socket.emit('gameStateReceived');
    }

    reconnect(id: string) {
        this.socket.emit('reconnect', id);
    }

    requestId() {
        this.socket.emit('requestId');
    }

    replaceVirtualPlayer(virtualPlayerUsername: string) {
        this.socket.emit('replaceVirtualForObserver', virtualPlayerUsername);
    }

    firstLetterPlaced(column: number, row: string) {
        this.socket.emit('sendFirstLetterPlaced', column, row);
    }
}
