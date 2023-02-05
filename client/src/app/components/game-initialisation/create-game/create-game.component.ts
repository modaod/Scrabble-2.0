import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionary } from '@app/classes/dictionary';
import { GameSettings, RoomVisibility } from '@app/classes/game-settings';
import { MAX_VALUE_TIMER_MINUTE, MINIMAL_DOUBLE_DIGIT, ONE_MINUTE_VALUE, Timer, TIMER_MODIFICATION_VALUE } from '@app/classes/timer';
import { User } from '@app/classes/user';
import { VirtualPlayerDifficulty } from '@app/classes/virtual-player-difficulty';
import { VirtualPlayerInfo } from '@app/classes/virtual-player-info';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { NameValidatorService } from '@app/services/name-validator-service/name-validator.service';
import { Settings, WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { getAuth } from 'firebase/auth';
import { child, Database, get, getDatabase, onValue, ref } from 'firebase/database';
import { Subscription } from 'rxjs';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit, OnDestroy {
    @ViewChild('decrementButton') decrementButton: ElementRef;
    @ViewChild('incrementButton') incrementButton: ElementRef;
    @ViewChild('time') time: ElementRef;
    timer: Timer;
    nameValidatorService: NameValidatorService;
    message: string;
    isRankedMode: boolean;
    isMultiMode: boolean;
    buttonDisabled: boolean;
    virtualPlayerNameList: VirtualPlayerInfo[];
    filteredVirtualPlayerNameList: VirtualPlayerInfo[];
    selectedDifficulty: VirtualPlayerDifficulty;
    randomName: string;
    roomName: string;
    dictionaryList: Dictionary[];
    roomVisibility: RoomVisibility = RoomVisibility.PUBLIC;
    passwordCheckbox: boolean;
    subscriptionSettings: Subscription;
    subscriptionDictionary: Subscription;
    subscriptionNamesList: Subscription;
    subscriptionRoom: Subscription;
    theme: string;

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private gameModeService: GameModeService,
        private router: Router,
        private dictionaryService: DictionaryService,
        private authService: AuthService,
        private firebaseService: FirebaseService,
        public languageService: LanguageService,
    ) {
        this.timer = { minute: 1, second: 0 };
        this.dictionaryList = [];
        this.isRankedMode = this.gameModeService.isRankedMode;
        this.buttonDisabled = true;

        const auth = getAuth(this.firebaseService.app);
        const db: Database = getDatabase();
        onValue(ref(db, `users/${auth.currentUser?.uid}` + '/theme'), (snapshot) => {
            if (snapshot.exists()) {
                this.theme = String(snapshot.val());
            } else {
                // eslint-disable-next-line no-console
                console.log('No data available');
            }
        });
    }

    ngOnDestroy(): void {
        this.subscriptionSettings.unsubscribe();
        this.subscriptionDictionary.unsubscribe();
        if (this.subscriptionNamesList) this.subscriptionNamesList.unsubscribe();
        if (this.subscriptionRoom) this.subscriptionRoom.unsubscribe();
    }

    ngOnInit() {
        this.subscriptionSettings = this.waitingRoomManagerService.getCurrentSettings().subscribe((settings) => this.updateSettings(settings));
        this.subscriptionDictionary = this.dictionaryService.getDictionaryList().subscribe((dicts) => this.updateDictionaries(dicts));
        this.subscriptionNamesList = this.gameModeService.getPlayerNameListObservable().subscribe((names) => this.updateVirtualPlayerNameList(names));
        this.subscriptionRoom = this.waitingRoomManagerService.getSoloRoomObservable().subscribe(async () => this.router.navigate(['/game']));
        this.gameModeService.getPlayerNameList();
    }

    updateSettings(settings: Settings): void {
        this.time.nativeElement.innerHTML = settings.timer.minute.toString() + ':' + settings.timer.second.toString();
        (document.getElementById('player-name') as HTMLInputElement).value = settings.playerName;
    }

    updateDictionaries(dictionaryList: Dictionary[]): void {
        this.dictionaryList = [...dictionaryList];
        this.buttonDisabled = false;
    }

    updateVirtualPlayerNameList(virtualPlayerNameList: VirtualPlayerInfo[]): void {
        if (this.isRankedMode) {
            this.virtualPlayerNameList = virtualPlayerNameList;
            this.updateRandomName();
        }
    }

    updateRandomName(): void {
        this.selectedDifficulty = (document.getElementById('game-difficulty') as HTMLInputElement)?.value as VirtualPlayerDifficulty;
        this.filteredVirtualPlayerNameList = this.virtualPlayerNameList.filter((virtualPlayerName) => {
            return virtualPlayerName.difficulty === this.selectedDifficulty;
        });
        this.randomName = this.filteredVirtualPlayerNameList[Math.floor(Math.random() * this.filteredVirtualPlayerNameList.length)].name;
    }

    checkMultiInput(): boolean {
        const roomName = (document.getElementById('room-name') as HTMLInputElement).value;
        return roomName.trim() !== '';
    }

    joinRankedQueue(): void {
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        get(child(ref(this.firebaseService.db), `users/${this.authService.getUserID()}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const self = snapshot.val() as User;
                this.waitingRoomManagerService.joinWaitingRoom(self);
            }
        });
        sessionStorage.removeItem('playerID');
        sessionStorage.removeItem('chat');
        this.router.navigate(['/ranked-waiting-room']);
    }

    createMultiRoom(): void {
        if (this.buttonDisabled) return;
        this.buttonDisabled = true;
        const roomNameValue = (document.getElementById('room-name') as HTMLInputElement).value;
        const dictionaryIndex = (document.getElementById('dictionaries') as HTMLSelectElement)?.selectedIndex;
        this.waitingRoomManagerService.setRoomToJoin(roomNameValue);
        this.waitingRoomManagerService.setHostPlayer(true);
        this.waitingRoomManagerService.setMessageSource("Veuillez attendre qu'un joueur rejoigne votre salle.");
        let gameSettings: GameSettings;
        if (this.roomVisibility === 'public' && this.passwordCheckbox) {
            const passwordValue = (document.getElementById('password-input') as HTMLInputElement).value;
            gameSettings = {
                roomName: roomNameValue,
                isSoloMode: false,
                timer: this.timer,
                dictionary: this.dictionaryList[dictionaryIndex].title,
                gameType: this.gameModeService.scrabbleMode,
                roomVisibility: this.roomVisibility,
                password: passwordValue,
            };
        } else {
            gameSettings = {
                roomName: roomNameValue,
                isSoloMode: false,
                timer: this.timer,
                dictionary: this.dictionaryList[dictionaryIndex].title,
                gameType: this.gameModeService.scrabbleMode,
                roomVisibility: this.roomVisibility,
            };
        }
        this.waitingRoomManagerService.setPrivateRoom(gameSettings.roomVisibility);
        sessionStorage.removeItem('playerID');
        sessionStorage.removeItem('chat');
        this.waitingRoomManagerService.createMultiRoom(gameSettings);
        this.router.navigate(['/waiting-room']);
    }

    alertFalseInput() {
        alert('Veuillez remplir les champs vides.');
    }

    incrementClock(): void {
        this.timer.second += TIMER_MODIFICATION_VALUE;
        if (this.timer.second / ONE_MINUTE_VALUE === 1) {
            this.timer.second = 0;
            this.timer.minute++;
            this.decrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute >= MAX_VALUE_TIMER_MINUTE) {
            this.incrementButton.nativeElement.disabled = true;
        }
        this.printTimer();
    }

    decrementClock(): void {
        this.timer.second -= TIMER_MODIFICATION_VALUE;
        if (this.timer.second === -TIMER_MODIFICATION_VALUE) {
            this.timer.second = TIMER_MODIFICATION_VALUE;
            this.timer.minute--;
            this.incrementButton.nativeElement.disabled = false;
        }

        if (this.timer.minute === 0 && this.timer.second <= TIMER_MODIFICATION_VALUE) {
            this.decrementButton.nativeElement.disabled = true;
        }
        this.printTimer();
    }

    printTimer(): void {
        this.time.nativeElement.innerHTML =
            this.timer.second < MINIMAL_DOUBLE_DIGIT
                ? this.timer.minute.toString() + ':0' + this.timer.second.toString()
                : this.timer.minute.toString() + ':' + this.timer.second.toString();
    }
}
