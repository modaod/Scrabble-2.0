import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameSettings, RoomVisibility } from '@app/classes/game-settings';
import { PublicUser } from '@app/classes/public-user';
import { Timer } from '@app/classes/timer';
import { WaitingRoom } from '@app/classes/waiting-room';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';
import { Socket } from 'socket.io-client';
import { User } from '@app/classes/user';
// eslint-disable-next-line no-restricted-imports
import { AuthService } from '../authentification-service/auth.service';

export interface Settings {
    playerName: string;
    timer: Timer;
}

@Injectable({
    providedIn: 'root',
})
export class WaitingRoomManagerService {
    private socket: Socket;
    private messageSource: string;
    private alertMessage: string;
    private hostPlayer: boolean;
    private hostPlayerName: string;
    private guestPlayerConnected: boolean;
    private roomToJoin: string;
    private privateRoom: boolean;
    private waitingRoomObservable: Observable<WaitingRoom[]>;
    private waitingUsersObservable: Observable<PublicUser[]>;

    constructor(
        private socketManagerService: SocketManagerService,
        private gameModeService: GameModeService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.socket = this.socketManagerService.getSocket();
        this.waitingRoomObservable = new Observable((observer: Observer<WaitingRoom[]>) => {
            this.socket.on('hereAreTheActiveGames', (rooms) => observer.next(rooms));
        });
        this.askForWaitingPlayers();
        this.waitingUsersObservable = new Observable((observer: Observer<PublicUser[]>) => {
            this.socket.emit('sendWaitingPlayers', this.roomToJoin);
            this.socket.on('hereAreTheActiveUsers', (players) => observer.next(players));
        });
    }

    getMessageSource(): string {
        return this.messageSource;
    }

    getAlertMessage(): string {
        return this.alertMessage;
    }

    setMessageSource(message: string) {
        this.messageSource = message;
    }

    setAlertMessage(message: string) {
        this.alertMessage = message;
    }

    isHostPlayer(): boolean {
        return this.hostPlayer;
    }

    setHostPlayer(value: boolean) {
        this.hostPlayer = value;
    }

    setPrivateRoom(value: string) {
        this.privateRoom = value === RoomVisibility.PRIVATE;
    }

    isPrivateRoom(): boolean {
        return this.privateRoom;
    }

    setHostPlayerName(value: string) {
        this.hostPlayerName = value;
    }

    isGuestPlayer(): boolean {
        return this.guestPlayerConnected;
    }

    setGuestPlayer(value: boolean) {
        this.guestPlayerConnected = value;
    }

    getRoomToJoin(): string {
        return this.roomToJoin;
    }

    setRoomToJoin(room: string) {
        this.roomToJoin = room;
    }

    getJoinedPlayer(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('guestPlayerIsWaiting', (message: string, isWaiting: boolean) => this.guestPlayerIsWaiting(isWaiting, message, observer));
        });
    }

    getJoinResponse(): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            this.socket.on('guestAnswered', (answer: boolean, message: string) => this.guestAnswered(answer, message, observer));
        });
    }

    guestAnswered(answer: boolean, message: string, observer: Observer<boolean>) {
        this.alertMessage = message;
        observer.next(answer);
    }

    guestPlayerIsWaiting(isWaiting: boolean, message: string, observer: Observer<string>) {
        this.guestPlayerConnected = isWaiting;
        observer.next(message);
    }

    getHostPlayerName(): string {
        return this.hostPlayerName;
    }

    joinRoom(isPlayer: boolean) {
        this.socket.emit('joinRoom', this.authService.getUserID(), this.roomToJoin, isPlayer);
    }

    joinRoomObserverGameStarted() {
        this.socket.emit('joinRoom', this.authService.getUserID(), this.roomToJoin, false);
        this.socket.on('observerJoined', () => {
            sessionStorage.removeItem('playerID');
            sessionStorage.removeItem('chat');
            this.router.navigate(['/game']);
        });
    }

    addVirtualPlayer(): void {
        this.socket.emit('addVirtualPlayer', this.roomToJoin);
    }

    removeVirtualPlayer(name: string): void {
        this.socket.emit('removeVirtualPlayer', this.roomToJoin, name);
    }

    answerGuestPlayer(answer: boolean, message: string, username: string): void {
        this.socket.emit('answerGuestPlayer', this.roomToJoin, answer, message, username);
    }

    deleteRoom(): void {
        this.socket.emit('deleteRoom', this.roomToJoin);
    }

    updateWaitingRoom(message: string): void {
        this.socket.emit('guestPlayerLeft', this.roomToJoin, message);
    }

    getGuestPlayerLeft(): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            this.socket.on('guestLeft', (message: string) => observer.next(message));
        });
    }

    getWaitingRoomObservable(): Observable<WaitingRoom[]> {
        return this.waitingRoomObservable;
    }

    getWaitingPlayersObservable(): Observable<PublicUser[]> {
        return this.waitingUsersObservable;
    }

    askForWaitingRooms() {
        this.socket.emit('sendWaitingRooms');
    }

    askForWaitingPlayers() {
        this.socket.emit('sendWaitingPlayers', this.roomToJoin);
    }

    convertMultiToSolo() {
        this.gameModeService.setGameMode(true);
        this.socket.emit('sendCurrentSettings');
    }

    getCurrentSettings(): Observable<Settings> {
        return new Observable((observer: Observer<Settings>) => {
            this.socket.on('hereAreTheSettings', (playerName: string, timer: Timer) => observer.next({ playerName, timer }));
        });
    }

    getSoloRoomObservable() {
        return new Observable((observer: Observer<boolean>) => {
            this.socket.on('soloRoomIsReady', (accepted) => observer.next(accepted));
        });
    }

    rankedGameReady() {
        this.socket.on('rankedGameReady', (room: string) => this.socket.emit('readyRanked', room));
    }

    joinWaitingRoom(user: User) {
        this.socket.emit('joinRankedWaitingRoom', user);
    }

    leaveRankedQueue() {
        this.socket.emit('leaveRankedQueue');
    }

    createMultiRoom(gameSettings: GameSettings) {
        this.socket.emit('createMultiRoom', gameSettings, this.authService.getUserID());
    }
}
