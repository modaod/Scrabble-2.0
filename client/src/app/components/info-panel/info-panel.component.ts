/* eslint-disable no-console */
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Goal } from '@app/classes/goal';
import { PublicUser } from '@app/classes/public-user';
import { AuthService } from '@app/services/authentification-service/auth.service';
import {
    GameState,
    GameStateService,
    ObserverGameState,
    ObserverPublicPlayerInformation,
    PublicPlayerInformation
} from '@app/services/game-state-service/game-state.service';
import { Subscription } from 'rxjs';
import { Player, playersInfo } from './players-info';
import { Round, roundInfo } from './round-info';
import {LanguageService} from "@app/services/language-service/language.service";
import { get, getDatabase, ref, set } from 'firebase/database';
import { User } from '@app/classes/user';

const DISCONNECT_SCORE = -1000;
const LOWEST_POSSIBLE_SCORE = -70;
const MIN_MAX_MULTI_PLAYERS = 4;

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent implements AfterViewInit, OnDestroy {
    selfUsername: string = '';
    playersInfo: Player[] = playersInfo;
    roundInfo: Round[] = roundInfo;
    onGoingPublicObjectives: Goal[] = [];
    subscriptions: Subscription[] = [];
    areGoals: boolean = false;
    isPlayer: boolean = false;

    constructor(private readonly gameStateService: GameStateService, private authService: AuthService, public languageService: LanguageService) {}

    ngAfterViewInit(): void {
        this.subscriptions.push(this.gameStateService.getJoinedPlayersListener().subscribe((joinedUsers) => this.updateJoinedUsers(joinedUsers)));
        this.subscriptions.push(
            this.gameStateService.getGameStateObservable().subscribe((gameState) => {
                this.gameUpdate(gameState);
                this.isPlayer = true;
            }),
        );
        this.subscriptions.push(this.gameStateService.getObserverGameStateObservable().subscribe((gameState) => this.observerGameUpdate(gameState)));
        this.gameStateService.getJoinedPlayers();
        this.gameStateService.getObserverGameState();
        this.selfUsername = this.authService.getUsername();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    replaceVirtualForObserver(virtualPlayerUsername: string): void {
        this.gameStateService.replaceVirtualPlayer(virtualPlayerUsername);
    }

    private updateJoinedUsers(users: PublicUser[]) {
        const joinedPlayers = users.filter((user) => {
            return user.userType === 'human' || user.userType === 'virtual';
        });
        for (let i = 0; i < MIN_MAX_MULTI_PLAYERS; i++) {
            this.playersInfo[i].username = joinedPlayers[i].username;
            this.playersInfo[i].avatar = joinedPlayers[i].avatar;
            this.playersInfo[i].isHuman = joinedPlayers[i].userType === 'human';
        }
    }

    private endGame(scores: number[], isRanked: boolean) {
        let myScore = 0;
        let opponentsList = '';
        for (let i = 0; i < MIN_MAX_MULTI_PLAYERS; i++) {
            this.playersInfo[i].active = false;
            this.playersInfo[i].currentScore = scores[i] > LOWEST_POSSIBLE_SCORE ? scores[i] : scores[i] - DISCONNECT_SCORE;

            if (this.playersInfo[i].username === this.selfUsername) {
                myScore = this.playersInfo[i].currentScore;
            } else {
                opponentsList += ' ' + this.playersInfo[i].username;
            }
        }
        const maxScore = Math.max(...scores.map((score) => score));
        const isWinner = myScore === maxScore;
        for (let i = 0; i < MIN_MAX_MULTI_PLAYERS; i++) {
            if (this.playersInfo[i].currentScore === maxScore) {
                this.playersInfo[i].winner = true;
            }
        }

        const timeLength = new Date().getTime() - this.gameStateService.startTime;
        const date = new Date();
        get(ref(getDatabase(), `users/${this.authService.auth.currentUser?.uid}`)).then((snapshot) => {
            const user: User = snapshot.val();
            const dbUrl = `users/${this.authService.auth.currentUser?.uid}/gamesPlayed/${user.gamesPlayed?.length || 0}`;
            const dateToSend =
                date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + ' ' + date.getHours() + ':' + date.getMinutes();
            console.log(dbUrl);
            set(ref(getDatabase(), dbUrl), {
                date: dateToSend,
                score: myScore,
                time: timeLength,
                win: isWinner,
                opponents: opponentsList,
            });
        });

        this.gameStateService.playerInfos = this.playersInfo;
        this.gameStateService.isRankedGame = isRanked;
    }

    private gameUpdate(gameState: GameState) {
        this.roundInfo[0].lettersRemaining = gameState.reserveLength;
        if (gameState.gameOver) {
            const scores: number[] = [];
            gameState.publicPlayerInformation.forEach((playerInfo: PublicPlayerInformation) => {
                scores.push(playerInfo.score);
            });
            this.endGame(scores, gameState.isRanked);
            return;
        }
        if (gameState.yourGoals && gameState.oppenentGoals) {
            this.areGoals = true;
            this.playersInfo[0].objectives = gameState.yourGoals;
            this.playersInfo[1].objectives = gameState.oppenentGoals;
            this.onGoingPublicObjectives = [this.playersInfo[0].objectives[0], this.playersInfo[0].objectives[1]];
        }
        for (let i = 0; i < MIN_MAX_MULTI_PLAYERS; i++) {
            this.playersInfo[i].winner = false;
            this.playersInfo[i].currentScore = gameState.publicPlayerInformation[i].score;
            this.playersInfo[i].active = false;
            this.playersInfo[i].letterCount = gameState.publicPlayerInformation[i].handLength.toString();
            if (i === gameState.currentTurn) {
                this.playersInfo[i].active = true;
                const playerElement = document.getElementById(this.playersInfo[i].username);
                if (playerElement) {
                    playerElement.style.backgroundColor = '#e6e6f1';
                }
            } else {
                const playerElement = document.getElementById(this.playersInfo[i].username);
                if (playerElement) {
                    playerElement.style.backgroundColor = '#fffbfb';
                }
            }
        }
        if (!gameState.isYourTurn && !this.playersInfo[gameState.currentTurn].isHuman) this.gameStateService.notifyGameStateReceived();
    }

    private observerGameUpdate(gameState: ObserverGameState) {
        this.roundInfo[0].lettersRemaining = gameState.reserveLength;
        if (gameState.gameOver) {
            const scores: number[] = [];
            gameState.publicPlayerInformation.forEach((playerInfo: ObserverPublicPlayerInformation) => {
                scores.push(playerInfo.score);
            });
            this.endGame(scores, false);
            return;
        }
        for (let i = 0; i < MIN_MAX_MULTI_PLAYERS; i++) {
            this.playersInfo[i].winner = false;
            this.playersInfo[i].currentScore = gameState.publicPlayerInformation[i].score;
            this.playersInfo[i].active = false;
            this.playersInfo[i].letterCount = gameState.publicPlayerInformation[i].hand.toString();
            if (i === gameState.currentTurn) {
                this.playersInfo[i].active = true;
                const playerElement = document.getElementById(this.playersInfo[i].username);
                if (playerElement) {
                    playerElement.style.backgroundColor = '#e6e6f1';
                }
            } else {
                const playerElement = document.getElementById(this.playersInfo[i].username);
                if (playerElement) {
                    playerElement.style.backgroundColor = '#fffbfb';
                }
            }
        }
    }
}
