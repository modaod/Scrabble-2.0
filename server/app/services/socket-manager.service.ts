/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { GameRoom } from '@app/classes/game-room';
import { GameSettings, RoomVisibility } from '@app/classes/game-settings';
import { Player } from '@app/classes/player';
import { CommandDetails, VirtualPlayer } from '@app/classes/virtual-player';
import { VirtualPlayerEasy } from '@app/classes/virtual-player-easy';
import { ErrorType, FIRST_VIRTUAL_PLAYER_NAME, GameType, SECOND_VIRTUAL_PLAYER_NAME } from '@app/constants/basic-constants';
import { GridPosition, Message, Observer, User} from '@app/constants/basic-interface';
import {
    COLOR_OTHER_PLAYER,
    COLOR_SYSTEM,
    DEFAULT_COLOR,
    ILLEGAL_COMMAND_ERROR,
    INVALID_SYNTAX_ERROR,
    RECONNECT_TIME,
} from '@app/constants/communication-constants';
import { PlayerName, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import { CommandController, CommandResult } from '@app/controllers/command.controller';
import { RoomManagerService } from '@app/services/room-manager.service';
import * as http from 'http';
import * as io from 'socket.io';
import { DatabaseService } from './database.service';
import { RealtimeDatabaseService } from './realtime-database.service';
import { SocketDatabaseService } from './socket-database.service';

export class SocketManager {
    private rtdb: RealtimeDatabaseService;
    private sio: io.Server;
    private roomManager: RoomManagerService;
    private commandController: CommandController;
    private socketDatabaseService: SocketDatabaseService;
    private databaseService: DatabaseService;
    private timeoutRoom: { [key: string]: NodeJS.Timeout };

    constructor(server: http.Server, databaseService: DatabaseService) {
        this.rtdb = new RealtimeDatabaseService();
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.socketDatabaseService = new SocketDatabaseService(databaseService);
        this.databaseService = databaseService;
        this.timeoutRoom = {};
    }

    async roomManagerSetup() {
        this.roomManager = new RoomManagerService(await this.socketDatabaseService.getDictionary());
        this.commandController = new CommandController(this.roomManager);
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            this.socketDatabaseService.databaseSocketRequests(socket);

            socket.on('joinRankedWaitingRoom', (user: User) => {
                this.roomManager.queueRankedPlayer(user, socket.id);
                const playerList = this.roomManager.matchRankedPlayer();
                if (playerList.length === 4) {
                    // Start game and send emit back
                    const gameSetting: GameSettings = {
                        isRanked: true,
                        timer: { minute: 0, second: 30 },
                        dictionary: '',
                        roomName: '_' + playerList[0][1],
                        gameType: GameType.CLASSIC,
                        roomVisibility: RoomVisibility.RANKED,
                    };
                    this.roomManager.createRoom(gameSetting, undefined);
                    for (const player of playerList) {
                        this.sio.to(player[1]).emit('rankedGameReady', gameSetting.roomName);
                    }
                }
            });

            socket.on('leaveRankedQueue', () => {
                this.roomManager.leaveRankedQueue(socket.id);
            });

            socket.on('readyRanked', (room: string) => {
                socket.join(room);
                for (const player of this.roomManager.getRankedWaitingLobby()) {
                    if (player[1] === socket.id) {
                        this.roomManager.findRoomFromName(room)?.addPlayer(new Player(player[1], player[0].username, player[0].avatarUrl, true));
                        if (this.roomManager.findRoomFromName(room)?.getPlayerCount() === 4) {
                            this.sio.to(room).emit('guestAnswered', true, '');
                        }
                    }
                }
                this.roomManager.leaveRankedQueue(socket.id);
            });

            socket.on('new-message', (message: Message) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                const messageHead = message.username === '[SERVER]' ? message.username : currentRoom?.getPlayer(socket.id, false)?.getName();
                socket.emit('new-message', {
                    username: messageHead,
                    body: message.body,
                    color: message.username === '[SERVER]' ? COLOR_SYSTEM : DEFAULT_COLOR,
                });
                if (messageHead !== '[SERVER]')
                    socket
                        .to((currentRoom as GameRoom).getName())
                        .emit('new-message', { username: messageHead, body: message.body, color: COLOR_OTHER_PLAYER });
            });

            socket.on('command', (command: string, argument: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom || currentRoom.getGame.isGameOver()) return;
                const roomName = currentRoom?.getName() as string;
                const returnValue = this.commandController.executeCommand({ commandType: command, args: argument, playerID: socket.id });
                if (returnValue.errorType !== undefined) {
                    socket.emit('new-message', this.handleError(returnValue.errorType as ErrorType));
                    return;
                }
                socket.emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom.getPlayer(socket.id, false)?.getName()} ${returnValue.activePlayerMessage}`,
                    color: COLOR_SYSTEM,
                });
                if (returnValue.otherPlayerMessage === 'NotEndTurn') return;
                socket.to(roomName).emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom.getPlayer(socket.id, false)?.getName()} ${returnValue.otherPlayerMessage}`,
                    color: COLOR_SYSTEM,
                });
                this.sendEndGameMessage(returnValue, roomName);
                this.sendGameState(currentRoom, socket);
            });

            socket.on('joinRoom', async (uid: string, room: string, isPlayer: boolean) => {
                if (this.roomManager.getWaitingPlayers(room).length === 4 && isPlayer) {
                    const currentRoom = this.roomManager.findRoomFromName(room);
                    if (currentRoom) {
                        const virtualPlayerName = currentRoom?.getVirtualPlayerName();
                        this.roomManager.removePlayer(currentRoom?.getPlayerUUIDFromName(virtualPlayerName), room);
                        socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                        socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                    }
                }
                await this.rtdb.getUser(uid).then((res: User) => {
                    const user = res;
                    let currentRoom: GameRoom | null;
                    if (isPlayer) {
                        this.roomManager.addPlayer(new Player(socket.id, user.username, user.avatarUrl, true), room);
                        socket.join(room);
                        currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                    } else {
                        const observer: Observer = { uid: socket.id, username: user.username, avatar: user.avatarUrl };
                        this.roomManager.addObserver(observer, room);
                        socket.join(room);
                        currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                        socket.emit('observerJoined');
                    }
                    if (currentRoom) {
                        socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                        socket.to(room).emit('guestPlayerIsWaiting', user.username, true);
                        socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                    }
                });
            });

            socket.on('addVirtualPlayer', async (room: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    let newVirtualPlayerName = FIRST_VIRTUAL_PLAYER_NAME;
                    if (currentRoom.getVirtualPlayerName() === newVirtualPlayerName) newVirtualPlayerName = SECOND_VIRTUAL_PLAYER_NAME;
                    const virtualUser = new VirtualPlayerEasy(newVirtualPlayerName, currentRoom, false);
                    this.roomManager.addPlayer(virtualUser, room);
                    socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                    socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                }
            });

            socket.on('removeVirtualPlayer', async (room: string, name: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    this.roomManager.removePlayer(currentRoom?.getPlayerUUIDFromName(name), room);
                    socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                    socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                }
            });

            socket.on('createMultiRoom', async (gameSettings: GameSettings, uid: string) => {
                if (this.roomManager.verifyIfRoomExists(gameSettings.roomName)) {
                    socket.emit('error-room-name');
                    return;
                }
                this.roomManager.createRoom(gameSettings, (await this.socketDatabaseService.getDictionary(gameSettings.dictionary)).words);
                await this.rtdb.getUser(uid).then((res: User) => {
                    const user = res;
                    const newPlayer = new Player(socket.id, user.username, user.avatarUrl, true);
                    this.roomManager.addPlayer(newPlayer, gameSettings.roomName);
                    socket.join(gameSettings.roomName);
                    socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                });
            });

            socket.on('disconnect', async () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (!currentRoom) return;
                if (currentRoom.getGame.isGameOver()) {
                    this.roomManager.removePlayer(socket.id, currentRoom.getName());
                    return;
                }
                socket.leave(currentRoom.getName());
                this.sio.to(currentRoom.getName()).emit('new-message', {
                    username: '[SERVER]',
                    body: `${currentRoom?.getPlayer(socket.id, false)?.getName()} s'est déconnecté.`,
                    color: COLOR_SYSTEM,
                });
                const timeout = await setTimeout(async () => {
                    await this.disconnectPlayer(currentRoom, socket);
                }, RECONNECT_TIME);
                this.timeoutRoom[currentRoom.getName()] = timeout;
            });

            socket.on('abandon', async () => {
                let currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    if (currentRoom.getGame.isGameOver()) {
                        this.roomManager.removePlayer(socket.id, currentRoom.getName());
                        return;
                    }
                    this.sio.to(currentRoom.getName()).emit('new-message', {
                        username: '[SERVER]',
                        body: `${currentRoom.getPlayer(socket.id, false)?.getName()} a abandonné et quitté la partie.`,
                        color: COLOR_SYSTEM,
                    });
                    await this.disconnectPlayer(currentRoom, socket);

                    currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                    if (!currentRoom) return;
                } else {
                    currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                    if (currentRoom) {
                        this.roomManager.removeObserver(socket.id, currentRoom.getName());
                        socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                    }
                }
            });

            socket.on('observerIsGameStarted', () => {
                const currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                socket.emit('observerGameStarted', currentRoom?.getGame.isGameStarted())
            });

            socket.on('reconnect', (id: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(id);
                if (!currentRoom) return;
                currentRoom.getPlayer(id, false)?.setUUID(socket.id);
                if (!currentRoom.getIsSoloGame() && currentRoom.isPlayerTurn(socket.id)) currentRoom.updateCurrentTurnNumber();
                const roomName = currentRoom.getName();
                clearTimeout(this.timeoutRoom[roomName]);
                delete this.timeoutRoom[roomName];
                socket.join(roomName);
                this.sendGameState(currentRoom, socket);
            });

            socket.on('whoAmI', () => {
                const currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                const observer = currentRoom?.getObserver(socket.id);
                if (observer != null) {
                    socket.emit('youAreAnObserver');
                }
            });

            socket.on('sendWaitingRooms', () => {
                socket.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            });

            socket.on('sendWaitingPlayers', (room: string) => {
                const currentRoom = this.roomManager.findRoomFromName(room);
                if (currentRoom) {
                    socket.emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                }
            });

            socket.on('answerGuestPlayer', (room: string, accepted: boolean, message: string, username: string) => {
                if (accepted) {
                    socket.to(room).emit('guestAnswered', accepted, message);
                    return;
                }
                switch (message) {
                    case 'roomDeleted': {
                        const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                        if (currentRoom) this.roomManager.deleteRoom(room);
                        socket.to(room).emit('guestAnswered', accepted, "L'hôte a supprimé la salle.");
                        socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                        break;
                    }
                    case 'playerDeleted': {
                        const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                        if (currentRoom) {
                            socket.broadcast
                                .to(currentRoom.getPlayerUUIDFromName(username))
                                .emit('guestAnswered', accepted, "Vous avez été rejeté(e) de la partie par l'hôte de la salle.");
                            this.roomManager.removePlayer(currentRoom.getPlayerUUIDFromName(username), room);
                            socket.to(room).emit('guestPlayerIsWaiting', '', false);
                            socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                            socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                        }
                        break;
                    }
                    case 'observerDeleted': {
                        const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                        if (currentRoom) {
                            socket.broadcast
                                .to(currentRoom.getObserverUUIDFromName(username))
                                .emit('guestAnswered', accepted, "Vous avez été rejeté(e) de la partie par l'hôte de la salle.");
                            this.roomManager.removeObserver(currentRoom.getObserverUUIDFromName(username), room);
                            socket.to(room).emit('guestPlayerIsWaiting', '', false);
                            socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                            socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                        }
                        break;
                    }
                }
            });

            socket.on('deleteRoom', (room: string) => {
                this.roomManager.deleteRoom(room);
                socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            });

            socket.on('guestPlayerLeft', (room: string) => {
                let currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    this.roomManager.removePlayer(socket.id, room);
                    socket.to(room).emit('guestPlayerIsWaiting', '', false);
                    socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                } else {
                    currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                    if (currentRoom) {
                        this.roomManager.removeObserver(socket.id, room);
                        socket.to(room).emit('guestPlayerIsWaiting', '', false);
                        socket.to(room).emit('hereAreTheActiveUsers', currentRoom.getPublicUsers());
                    }
                }
            });

            socket.on('getJoinedPlayers', () => {
                let currentRoom: GameRoom | null;
                let yourName = '';
                currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    const players = currentRoom.getPlayers();
                    players.forEach((player: Player) => {
                        if (player.getUUID() === socket.id) {
                            yourName = player.getName();
                        }
                    });
                } else {
                    currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                    if (currentRoom) {
                        const observers = currentRoom.getObservers();
                        observers.forEach((observer: Observer) => {
                            if (observer.uid === socket.id) {
                                yourName = observer.username;
                            }
                        });
                    }
                }
                if (!currentRoom) return;
                const publicUsers = currentRoom.getPublicUsers();
                socket.emit('joinedPlayers', publicUsers);
                socket
                    .to(currentRoom.getName())
                    .emit('new-message', { username: '[SERVER]', body: `${yourName} vient de joindre la partie.`, color: COLOR_SYSTEM });
                if (currentRoom.getPlayerCount() === 4 && !currentRoom.getGame.isGameStarted()) {
                    currentRoom.getGame.startGame();
                    socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                    this.sendGameState(currentRoom, socket);
                }
            });

            socket.on('getObserverGameState', () => {
                const currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                if (currentRoom) {
                    const currentTurnNumber = currentRoom?.getCurrentTurnNumber();
                    socket.emit('observer-game-state', currentRoom?.getGame.createObserverGameState(currentTurnNumber));
                }
            });

            socket.on('getFirstGameState', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    const currentTurnNumber = currentRoom?.getCurrentTurnNumber();
                    socket.emit('game-state', currentRoom?.getGame.createGameState(currentRoom.getPlayerIndex(socket.id), currentTurnNumber));
                }
            });

            socket.on('gameStateReceived', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) this.virtualPlay(currentRoom, socket);
            });

            socket.on('sendTimer', () => {
                let currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    socket.emit('hereIsTheTimer', currentRoom.getTimeChosen());
                } else {
                    currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                    if (currentRoom) {
                        socket.to(socket.id).emit('hereIsTheTimer', currentRoom.getTimeChosen());
                    }
                }
            });

            socket.on('requestId', () => {
                socket.emit('sendID', socket.id);
            });

            socket.on('sendCurrentSettings', () => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) socket.emit('hereAreTheSettings', currentRoom.getPlayerFromIndex(0).getName(), currentRoom.getTimeChosen());
            });

            socket.on('replaceVirtualForObserver', (virtualPlayerUsername: string) => {
                const currentRoom = this.roomManager.findRoomFromObserver(socket.id);
                const observer = currentRoom?.getObserver(socket.id);
                if (currentRoom && observer) {
                    currentRoom.replaceVirtualForObserver(new Player(observer.uid, observer.username, observer.avatar, true), virtualPlayerUsername);
                    currentRoom.removeObserver(observer.uid);
                    socket.emit(
                        'game-state',
                        currentRoom?.getGame.createGameState(currentRoom.getPlayerIndex(socket.id), currentRoom?.getCurrentTurnNumber()),
                    );
                    socket.emit('joinedPlayers', currentRoom.getPublicUsers());
                    socket.to(currentRoom.getName()).emit('joinedPlayers', currentRoom.getPublicUsers());
                    socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
                }
            });

            socket.on('sendFirstLetterPlaced', (y: number, x: string) => {
                const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
                if (currentRoom) {
                    const letterPosition: GridPosition = { row: x, column: y };
                    socket.to(currentRoom.getName()).emit('hereIsTheFirstLetterPlaced', letterPosition);
                }
            });
        });
    }

    handleError(errorType: ErrorType) {
        switch (errorType) {
            case ErrorType.IllegalCommand:
                return ILLEGAL_COMMAND_ERROR;
            case ErrorType.InvalidSyntax:
                return INVALID_SYNTAX_ERROR;
        }
    }

    async disconnectPlayer(currentRoom: GameRoom, socket: io.Socket) {
        let humanPlayerCount = 0;
        let virtualPlayerCount = 0;
        const players = currentRoom.getPlayers();
        players.forEach((player: Player) => {
            if (player.getIsHuman()) humanPlayerCount++;
            else virtualPlayerCount++;
        });
        const observers = currentRoom.getObservers();
        if (humanPlayerCount <= 1 || virtualPlayerCount === 4 || currentRoom.getPlayerCount() === 1) {
            currentRoom.getGame.endGame();
            currentRoom.removeVirtualPlayers();
            this.roomManager.removePlayer(socket.id, currentRoom.getName());
            const currentTurnNumber = currentRoom?.getCurrentTurnNumber();
            for (const observer of observers) {
                socket.to(observer.uid).emit('observer-game-state', currentRoom?.getGame.createObserverGameState(currentTurnNumber));
            }
            socket.to(currentRoom.getName()).emit('joinedPlayers', currentRoom.getPublicUsers());
            socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            this.roomManager.deleteRoom(currentRoom.getName());
            return;
        }
        if (currentRoom.getIsSoloGame()) {
            currentRoom.getGame.endGame();
            this.sendGameState(currentRoom as GameRoom, socket, true);
            currentRoom.removeVirtualPlayers();
            this.roomManager.removePlayer(socket.id, currentRoom.getName());
            socket.to(currentRoom.getName()).emit('joinedPlayers', currentRoom.getPublicUsers());
            socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
            this.roomManager.deleteRoom(currentRoom.getName());
            return;
        }
        const names: PlayerName[] | undefined = this.databaseService.database
            ? await this.databaseService.getPlayerNameList(VirtualPlayerDifficulty.BEGINNER)
            : undefined;
        const playerName: string = names ? names[Math.floor(Math.random() * names.length)].name : 'Michel Gagnon';
        this.sio.in(currentRoom.getName()).emit('new-message', {
            username: '[SERVER]',
            body: `Le joueur virtuel ${playerName} a rejoint votre partie`,
            color: COLOR_SYSTEM,
        });
        this.sio.in(currentRoom.getName()).emit('playerNames', [currentRoom.getPlayer(socket.id, true)?.getName(), playerName]);
        if (currentRoom.getPlayer(socket.id, false)?.hasTurn()) currentRoom.getGame.swapActivePlayer();
        currentRoom.replacePlayer(socket.id, new VirtualPlayerEasy(playerName, currentRoom, false));
        const publicUsers = currentRoom.getPublicUsers();
        socket.to(currentRoom.getName()).emit('joinedPlayers', publicUsers);
        socket.broadcast.emit('hereAreTheActiveGames', this.roomManager.getWaitingRooms());
        this.sendGameState(currentRoom as GameRoom, socket, true);
    }

    virtualPlay(room: GameRoom, socket: io.Socket) {
        const players: Player[] = room.getPlayers();
        const currentTurn: number = room.getCurrentTurnNumber();
        const activePlayer = players[currentTurn];
        const currentRoom = this.roomManager.findRoomFromPlayer(socket.id);
        for (let i = 0; i < 4; i++) {
            if (i !== currentTurn && players[i] instanceof VirtualPlayer) {
                const otherVirtualPlayer = players[i] as VirtualPlayer;
                otherVirtualPlayer.endPlay();
            }
        }
        if (!(activePlayer instanceof VirtualPlayer) || room.getGame.isGameOver() || activePlayer.isPlaying) return;
        const commandDetails: CommandDetails = activePlayer.play();
        socket.emit('new-message', {
            username: '[SERVER]',
            body: `${activePlayer.getName()} ${commandDetails.result.otherPlayerMessage}`,
            color: COLOR_SYSTEM,
        });
        if (currentRoom) {
            socket.to(currentRoom.getName()).emit('new-message', {
                username: '[SERVER]',
                body: `${activePlayer.getName()} ${commandDetails.result.otherPlayerMessage}`,
                color: COLOR_SYSTEM,
            });
        }
        this.sendEndGameMessage(commandDetails.result, room.getName());
        this.sendGameState(room, socket, true);
        activePlayer.endPlay();
    }

    sendEndGameMessage(commandResult: CommandResult, roomName: string) {
        if (commandResult.endGameMessage !== undefined) {
            this.sio.in(roomName).emit('new-message', { username: '[SERVER]', body: commandResult.endGameMessage, color: COLOR_SYSTEM });
        }
    }

    // eslint-disable-next-line no-unused-vars
    private sendGameState(currentRoom: GameRoom, socket: io.Socket | undefined, disconnect: boolean = false, isVirtualPlay: boolean = false) {
        const currentTurnNumber = currentRoom?.getCurrentTurnNumber();
        // if (gameStateActive.gameOver) {
        //     this.socketDatabaseService.sendGameHistoryToDatabase(
        //         currentRoom.getGame.createGameHistory(
        //             gameStateActive.yourScore >= gameStateActive.opponentScore ? previousPlayerNumber : nextPlayerNumber,
        //         ),
        //     );
        //     const activeScore = {
        //         username: currentRoom.getPlayerFromIndex(previousPlayerNumber).getName(),
        //         score: gameStateActive.yourScore,
        //     };
        //     const otherScore = {
        //         username: currentRoom.getPlayerFromIndex(nextPlayerNumber).getName(),
        //         score: gameStateActive.opponentScore,
        //     };
        //     this.socketDatabaseService.sendScoreToDatabase(
        //         isYourTurn ? otherScore : activeScore,
        //         isYourTurn ? activeScore : otherScore,
        //         disconnect,
        //         currentRoom.getIsSoloGame(),
        //         currentRoom.getGame.getGameType(),
        //     );
        // }
        if (!socket) return;
        const players = currentRoom?.getPlayers();
        /* eslint-disable */
        let stateOfGame: any;
        for (let i = 0; i < 4; i++) {
            if (players[i].getIsHuman()) {
                if (players[i].getUUID() === socket.id) {
                    socket.emit('game-state', currentRoom?.getGame.createGameState(i, currentTurnNumber));
                } else {
                    stateOfGame = currentRoom?.getGame.createGameState(i, currentTurnNumber);
                    socket.to(players[i].getUUID()).emit('game-state', stateOfGame);
                }
            }
        }
        const observers = currentRoom?.getObservers();
        if (observers.length) {
            for (const observer of observers) {
                socket.to(observer.uid).emit('observer-game-state', currentRoom?.getGame.createObserverGameState(currentTurnNumber));
            }
        }
        if (stateOfGame.gameOver) {
            this.roomManager.deleteRoom(currentRoom.getName());
        }
    }
}
