/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Player } from '@app/classes/player';
import { GameType, MIN_MAX_MULTI_PLAYERS, UserType } from '@app/constants/basic-constants';
import { Observer, PublicUser, Timer } from '@app/constants/basic-interface';
import { GoalsValidation } from '@app/services/goals-validation.service';
import { Game } from './game';
import { GameSettings, RoomVisibility } from './game-settings';
import { VirtualPlayer } from './virtual-player';
import { VirtualPlayerEasy } from './virtual-player-easy';

export class GameRoom {
    private players: Player[];
    private observers: Observer[];
    private name: string;
    private connectedPlayers: number;
    private timer: Timer;
    private isRankedGame: boolean;
    private game: Game;
    private gameType: GameType;
    private roomVisibility: RoomVisibility;
    private password?: string;
    private currentTurnNumber: number;

    constructor(name: string, wordValidationService: GoalsValidation, gameSettings: GameSettings) {
        this.name = name;
        this.players = [];
        this.observers = [];
        this.connectedPlayers = 0;
        this.isRankedGame = gameSettings.isRanked;
        this.timer = gameSettings.timer;
        this.game = new Game(wordValidationService, this.players, gameSettings.gameType, this.isRankedGame);
        this.gameType = gameSettings.gameType;
        this.roomVisibility = gameSettings.roomVisibility;
        this.password = gameSettings.password ? gameSettings.password : undefined;
        this.currentTurnNumber = 0;
    }

    addPlayer(player: Player) {
        if (this.players.length < 4) {
            this.players.push(player);
        }
    }

    addObserver(observer: Observer) {
        this.observers.push(observer);
    }

    convertSoloGame(playerID: string, virtualPlayer: VirtualPlayerEasy) {
        if (!this.getPlayer(playerID, false)) return;
        const index: number = this.getPlayer(playerID, false) === this.players[0] ? 0 : 1;
        virtualPlayer.copyPlayerState(this.players[index]);
        this.players[index] = virtualPlayer;
        this.isRankedGame = true;
        this.game.convertSoloGame();
    }

    replacePlayer(playerID: string, virtualPlayer: VirtualPlayerEasy) {
        if (!this.getPlayer(playerID, false)) return;
        let playerIndex = -1;
        for (let i = 0; i < 4; i++) {
            if (this.players[i].getUUID() === playerID) playerIndex = i;
        }
        virtualPlayer.copyPlayerState(this.players[playerIndex]);
        this.players[playerIndex] = virtualPlayer;
    }

    replaceVirtualForObserver(newPlayer: Player, virtualPlayerUsername: string) {
        let playerIndex = -1;
        for (let i = 0; i < 4; i++) {
            if (this.players[i].getName() === virtualPlayerUsername) playerIndex = i;
        }
        newPlayer.copyPlayerState(this.players[playerIndex]);
        this.players[playerIndex] = newPlayer;
    }

    removePlayer(playerID: string): boolean {
        const player = this.getPlayer(playerID, false);
        if (!player) {
            return false;
        }
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
        return true;
    }

    removeObserver(observerID: string): boolean {
        const observer = this.getObserver(observerID);
        if (!observer) {
            return false;
        }
        const index = this.observers.indexOf(observer);
        this.observers.splice(index, 1);
        return true;
    }

    removeVirtualPlayers() {
        if (this.players[1] instanceof VirtualPlayer) this.players.splice(1, 1);
        if (this.players[0] instanceof VirtualPlayer) this.players.splice(0, 1);
    }

    isPlayerInRoom(playerID: string): boolean {
        return this.getPlayer(playerID, false) !== null;
    }

    isObserverInRoom(observerID: string): boolean {
        return this.getObserver(observerID) !== null;
    }

    isPlayerTurn(playerID: string): boolean {
        let playerIndex = -1;
        for (let i = 0; i < 4; i++) {
            if (this.players[i].getUUID() === playerID) playerIndex = i;
        }
        return playerIndex === this.game.getCurrentTurn();
    }

    updateCurrentTurnNumber() {
        if (this.currentTurnNumber < 3) {
            this.currentTurnNumber++;
        } else {
            this.currentTurnNumber = 0;
        }
        this.game.setCurrentTurn(this.currentTurnNumber);
    }

    getCurrentTurnNumber(): number {
        return this.game.getCurrentTurn();
    }

    getPlayerCount(): number {
        return this.players.length;
    }

    getHumanPlayerCount(): number {
        let humanPlayerCount = 0;
        this.players.forEach((player: Player) => {
            if (player.getIsHuman()) {
                humanPlayerCount++;
            }
        });
        return humanPlayerCount;
    }

    getName(): string {
        return this.name;
    }

    getIsSoloGame(): boolean {
        return this.isRankedGame;
    }

    getPlayer(playerID: string, otherPlayer: boolean): Player | null {
        for (const player of this.players) {
            if ((player.getUUID() === playerID) !== otherPlayer) {
                return player;
            }
        }
        return null;
    }

    getObserver(observerID: string): Observer | null {
        for (const observer of this.observers) {
            if (observer.uid === observerID) {
                return observer;
            }
        }
        return null;
    }

    getPlayers(): Player[] {
        return this.players;
    }

    getObservers(): Observer[] {
        return this.observers;
    }

    getPublicPlayers(): PublicUser[] {
        const result: PublicUser[] = [];
        this.players.forEach((player: Player) => {
            let type: UserType;
            if (player.getIsHuman()) type = UserType.HUMAN;
            else type = UserType.VIRTUAL;
            const publicUser: PublicUser = { username: player.getName(), avatar: player.getAvatar(), userType: type };
            result.push(publicUser);
        });
        return result;
    }

    getPublicUsers(): PublicUser[] {
        const result: PublicUser[] = [];
        this.players.forEach((player: Player) => {
            let type: UserType;
            if (player.getIsHuman()) type = UserType.HUMAN;
            else type = UserType.VIRTUAL;
            const publicUser: PublicUser = { username: player.getName(), avatar: player.getAvatar(), userType: type };
            result.push(publicUser);
        });
        this.observers.forEach((observer: Observer) => {
            const publicUser: PublicUser = { username: observer.username, avatar: observer.avatar, userType: UserType.OBSERVER };
            result.push(publicUser);
        });
        return result;
    }

    getVirtualPlayerName(): string {
        let playerName = '';
        this.players.forEach((player: Player) => {
            if (!player.getIsHuman()) {
                playerName = player.getName();
            }
        });
        return playerName;
    }

    getPlayerFromIndex(playerIndex: number): Player {
        return this.players[playerIndex];
    }

    getPlayerUUIDFromName(username: string): string {
        let playerUUID = '';
        this.players.forEach((player: Player) => {
            if (player.getName() === username) {
                playerUUID = player.getUUID();
            }
        });
        return playerUUID;
    }

    getObserverUUIDFromName(username: string): string {
        let observerUUID = '';
        this.observers.forEach((observer: Observer) => {
            if (observer.username === username) {
                observerUUID = observer.uid;
            }
        });
        return observerUUID;
    }

    getPlayerIndex(uid: string): number {
        for (let i = 0; i < 4; i++) {
            if (this.players[i].getUUID() === uid) return i;
        }
        return -1;
    }

    incrementConnectedPlayers(): boolean {
        this.connectedPlayers++;
        return this.connectedPlayers === MIN_MAX_MULTI_PLAYERS;
    }

    getTimeChosen(): Timer {
        return this.timer;
    }

    getGameType(): GameType {
        return this.gameType;
    }

    getRoomVisibility(): RoomVisibility {
        return this.roomVisibility;
    }

    isPasswordProtected(): boolean {
        return this.password ? true : false;
    }

    getPassword(): string {
        if (this.password) return this.password;
        return '';
    }

    get getGame(): Game {
        return this.game;
    }
}
