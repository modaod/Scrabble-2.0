import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { WaitingRoom } from '@app/classes/waiting-room';
import { RoomPasswordComponent } from '@app/components/room-password/room-password.component';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { getAuth } from 'firebase/auth';
import { Database, getDatabase, onValue, ref } from 'firebase/database';
import { Subscription } from 'rxjs';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-join-game',
    templateUrl: './join-game.component.html',
    styleUrls: ['./join-game.component.scss'],
})
export class JoinGameComponent implements OnDestroy, OnInit {
    @Input() hostName: string = '';
    @Input() roomName: string = '';

    waitingRooms: WaitingRoom[] = [];
    guestPlayerName: string;
    subscription: Subscription;
    gameType: GameType;
    theme: string;

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private router: Router,
        private gameModeService: GameModeService,
        private firebaseService: FirebaseService,
        private dialog: MatDialog,
        public languageService: LanguageService,
    ) {
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
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.gameType = this.gameModeService.scrabbleMode;
        this.subscription = this.waitingRoomManagerService.getWaitingRoomObservable().subscribe((rooms) => this.filterRooms(rooms));
        this.waitingRoomManagerService.askForWaitingRooms();
    }

    filterRooms(rooms: WaitingRoom[]) {
        this.waitingRooms = rooms.filter((waitingRooms) => {
            return waitingRooms.gameType === this.gameType;
        });
    }

    sendRoomData(room: WaitingRoom) {
        this.waitingRoomManagerService.setHostPlayerName(room.hostName);
        this.waitingRoomManagerService.setRoomToJoin(room.roomName);
        this.router.navigate(['/waiting-room']);
    }

    joinRoom(waitingRoom: WaitingRoom, isPlayer: boolean) {
        if (waitingRoom.roomVisibility === 'public' && waitingRoom.password) {
            this.dialog.open(RoomPasswordComponent, {
                width: '30%',
                height: 'auto',
                disableClose: true,
                data: {
                    roomPassword: waitingRoom.password,
                    roomName: waitingRoom.roomName,
                    player: isPlayer,
                    isGameStarted: waitingRoom.isGameStarted,
                },
            });
        } else {
            this.waitingRoomManagerService.setMessageSource("Veuillez attendre que l'hôte initialise la partie.");
            this.waitingRoomManagerService.setRoomToJoin(waitingRoom.roomName);
            if (!isPlayer && waitingRoom.isGameStarted) {
                this.waitingRoomManagerService.joinRoomObserverGameStarted();
            } else {
                this.waitingRoomManagerService.joinRoom(isPlayer);
                this.waitingRoomManagerService.setHostPlayer(false);
                this.router.navigate(['/waiting-room']);
            }
        }
    }

    placeRandomly() {
        const randomRoom: WaitingRoom = this.waitingRooms[Math.floor(Math.random() * this.waitingRooms.length)];
        this.sendRoomData(randomRoom);
    }
}
