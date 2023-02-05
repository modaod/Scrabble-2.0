import { GameType } from '@app/constants/basic-constants';
import { CollectionType, Dictionary, GameHistory, PlayerName, Score, VirtualPlayerDifficulty } from '@app/constants/database-interfaces';
import * as io from 'socket.io';
// eslint-disable-next-line no-unused-vars
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
// eslint-disable-next-line no-unused-vars
export class SocketDatabaseService {
    private databaseService: DatabaseService;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
    }

    databaseSocketRequests(socket: io.Socket) {
        socket.on('requestTopScores', (numberOfResults: number, gameType: GameType) => {
            this.sendTopScores(numberOfResults, gameType, socket);
        });
        socket.on('getDictionaryList', async () => {
            console.log('GET DICTIONARY');
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
        });
        socket.on('deleteDictionary', async (name: string) => {
            await this.databaseService.deleteDictionary(name);
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
        });
        socket.on('editDictionary', async (name: string, newDict: Dictionary) => {
            if (await this.databaseService.editDictionary(name, newDict))
                socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            else socket.emit('adminError', 'Impossible de modifier le dictionnaire. Un dictionnaire avec ce nom existe déjà');
        });
        socket.on('getVirtualPlayerNames', async (difficulty?: VirtualPlayerDifficulty) => {
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList(difficulty));
        });
        socket.on('editVirtualPlayerNames', async (name: string, newName: PlayerName) => {
            if (await this.databaseService.editPlayerName(name, newName))
                socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            else socket.emit('adminError', 'Impossible de modifier le joueur virtuel. Un joueur virtuel avec ce nom existe déjà');
        });
        socket.on('addVirtualPlayerNames', async (name: PlayerName) => {
            if (await this.databaseService.addPlayerName(name)) socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            else socket.emit('adminError', "Impossible d'ajouter le joueur virtuel. Un joueur virtuel avec ce nom existe déjà");
        });
        socket.on('deleteVirtualPlayerNames', async (name: string) => {
            await this.databaseService.deletePlayerName(name);
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
        });
        socket.on('getGameHistoryList', async () => {
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });
        socket.on('resetDatabase', async () => {
            await this.databaseService.resetDB();
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });

        socket.on('resetCollection', async (type: CollectionType) => {
            await this.databaseService.resetCollection(type);
            await this.databaseService.initialiseDB();
            socket.emit('virtualPlayerNames', await this.databaseService.getPlayerNameList());
            socket.emit('dictionaryList', await this.databaseService.getDictionaryList());
            socket.emit('historyList', await this.databaseService.getGameHistoryList());
        });
    }

    sendScoreToDatabase(yourScore: Score, opponentScore: Score, disconnect: boolean, isSolo: boolean, gameType: GameType) {
        if (!disconnect) this.databaseService.addScore(yourScore, gameType);
        if (!isSolo) this.databaseService.addScore(opponentScore, gameType);
    }

    sendGameHistoryToDatabase(gameHistory: GameHistory) {
        this.databaseService.addGameHistory(gameHistory);
    }

    async sendTopScores(numberOfResults: number, gameType: GameType, socket: io.Socket) {
        let topScores = {};
        topScores = await this.databaseService.getTopScores(numberOfResults, gameType).catch();
        socket.emit('topScores', topScores);
    }

    async getDictionary(name?: string): Promise<Dictionary> {
        let dict;
        if (name) dict = await this.databaseService.getDictionary(name);
        if (dict) return dict;
        return (await this.databaseService.getDictionary()) as Dictionary;
    }
}
