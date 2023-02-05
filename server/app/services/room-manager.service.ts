/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameRoom } from '@app/classes/game-room';
import { GameSettings, RoomVisibility } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { GameType } from '@app/constants/basic-constants';
import { Observer, PublicUser, Timer, User } from '@app/constants/basic-interface';
import { Dictionary } from '@app/constants/database-interfaces';
import * as fs from 'fs';
// eslint-disable-next-line no-unused-vars
import { Service } from 'typedi';
import { GoalsValidation } from './goals-validation.service';
import { Leagues } from '@app/constants/leagues';

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

@Service()
// eslint-disable-next-line no-unused-vars
export class RoomManagerService {
    private activeRooms: { [key: string]: GameRoom } = {};
    private rankedWaitingLobby: [User, string][] = [];
    private defaultWordValidationService: GoalsValidation;
    constructor(dictionary: Dictionary | undefined) {
        if (!dictionary?.words) dictionary = JSON.parse(fs.readFileSync('./assets/dictionnary.json', 'utf8')) as Dictionary;
        if (!dictionary?.words) dictionary.words = [];
        this.defaultWordValidationService = new GoalsValidation(dictionary.words);
    }

    getRankedWaitingLobby(): [User, string][] {
        return this.rankedWaitingLobby;
    }

    queueRankedPlayer(user: User, socketID: string) {
        if (user !== null) {
            this.rankedWaitingLobby.push([user, socketID]);
        }
    }

    leaveRankedQueue(socketID: string) {
        if (socketID !== null) {
            for (const player of this.rankedWaitingLobby) {
                if (player[1] === socketID) {
                    this.rankedWaitingLobby.splice(this.rankedWaitingLobby.indexOf(player, 0), 1);
                }
            }
        }
    }

    matchRankedPlayer(): [User, string][] {
        const playerList: [User, string][] = [];
        if (this.rankedWaitingLobby.length > 3) {
            let rankIndex = 0;
            for (const player of this.rankedWaitingLobby) {
                if (playerList.length === 0) {
                    playerList.push(player);
                    rankIndex = Object.keys(Leagues).indexOf(player[0].rankedLeague);
                } else if (playerList.length > 0 && playerList.length < 4) {
                    if (
                        player[0].rankedLeague === Object.values(Leagues)[rankIndex - 1] ||
                        player[0].rankedLeague === Object.values(Leagues)[rankIndex] ||
                        player[0].rankedLeague === Object.values(Leagues)[rankIndex + 1]
                    ) {
                        playerList.push(player);
                    }
                }
            }
        }
        return playerList;
    }

    createSoloRoomName(): string {
        const soloRooms = [''];
        for (const room of Object.values(this.activeRooms)) {
            if (room.getIsSoloGame()) {
                soloRooms.push(room.getName());
            }
        }
        let i = 1;
        while (soloRooms.includes('solo'.concat(`${i}`))) {
            i++;
        }
        return 'solo'.concat(`${i}`);
    }

    createRoom(gameSettings: GameSettings, words: string[] | undefined) {
        let roomName = '';
        if (gameSettings.roomName) roomName = gameSettings.roomName;
        this.activeRooms[roomName] = new GameRoom(roomName, words ? new GoalsValidation(words) : this.defaultWordValidationService, gameSettings);
    }

    addPlayer(player: Player, roomName: string) {
        this.activeRooms[roomName]?.addPlayer(player);
    }

    addObserver(observer: Observer, roomName: string) {
        this.activeRooms[roomName]?.addObserver(observer);
    }

    removePlayer(playerID: string, roomName: string) {
        this.activeRooms[roomName].removePlayer(playerID);
        if (this.activeRooms[roomName].getPlayerCount() === 0) {
            delete this.activeRooms[roomName];
        }
    }

    removeObserver(observerID: string, roomName: string) {
        this.activeRooms[roomName].removeObserver(observerID);
    }

    verifyIfRoomExists(roomName: string): boolean {
        return roomName in this.activeRooms;
    }

    getWaitingRooms(): WaitingRoom[] {
        const waitingRooms: WaitingRoom[] = [];
        for (const room of Object.values(this.activeRooms)) {
            if (
                (!room.getGame.isGameOver() && room.getRoomVisibility() === RoomVisibility.PUBLIC) ||
                (!room.getGame.isGameOver() && room.getRoomVisibility() === RoomVisibility.PRIVATE && !room.getGame.isGameStarted())
            ) {
                waitingRooms.push({
                    roomName: room.getName(),
                    hostName: room.getPlayerFromIndex(0).getName(),
                    timer: room.getTimeChosen(),
                    gameType: room.getGameType(),
                    users: room.getPublicUsers(),
                    isGameStarted: room.getGame.isGameStarted(),
                    roomVisibility: room.getRoomVisibility(),
                    password: room.isPasswordProtected() ? room.getPassword() : undefined,
                });
            }
        }
        return waitingRooms;
    }

    getWaitingPlayers(waitingRoomName: string): PublicUser[] {
        let users: PublicUser[] = [];
        for (const room of Object.values(this.activeRooms)) {
            if (room.getName() === waitingRoomName) {
                users = room.getPublicPlayers();
            }
        }
        return users;
    }

    // getVirtualPlayerNumber(waitingRoomName: string): number {
    //     let virtualPlayerNumber = 0;
    //     const players = this.getWaitingPlayers(waitingRoomName);
    //     for (const player of Object.values(players)) {
    //         if (player.isHuman) {
    //             virtualPlayerNumber++;
    //         }
    //     }
    //     return virtualPlayerNumber;
    // }

    findRoomFromPlayer(playerID: string): GameRoom | null {
        for (const room of Object.values(this.activeRooms)) {
            if (room.isPlayerInRoom(playerID)) {
                return room;
            }
        }
        return null;
    }

    findRoomFromObserver(observerID: string): GameRoom | null {
        for (const room of Object.values(this.activeRooms)) {
            if (room.isObserverInRoom(observerID)) {
                return room;
            }
        }
        return null;
    }

    findRoomFromName(roomName: string): GameRoom | null {
        for (const room of Object.values(this.activeRooms)) {
            if (room.getName() === roomName) {
                return room;
            }
        }
        return null;
    }

    deleteRoom(roomToDelete: string): void {
        delete this.activeRooms[roomToDelete];
    }
}
