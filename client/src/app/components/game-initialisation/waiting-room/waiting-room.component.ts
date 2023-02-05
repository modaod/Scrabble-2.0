import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PublicUser } from '@app/classes/public-user';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { getAuth } from 'firebase/auth';
import { Database, getDatabase, onValue, ref } from 'firebase/database';
import { Subscription } from 'rxjs';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    userList: PublicUser[] = [];
    playerList: PublicUser[] = [];
    observerList: PublicUser[] = [];
    virtualPlayerList: PublicUser[] = [];
    message: string = '';
    alertMessage: string = '';
    isHostPlayerWaiting: boolean = false;
    isGuestPlayerWaiting: boolean = false;
    subscription: Subscription;
    joinResponseSubscription: Subscription;
    selfUsername: string = '';
    theme: string;
    isPrivateRoom: boolean = false;

    constructor(
        private waitingRoomManagerService: WaitingRoomManagerService,
        private router: Router,
        private authService: AuthService,
        private firebaseService: FirebaseService,
        public languageService: LanguageService,
    ) {
        this.waitingRoomManagerService.askForWaitingPlayers();

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

    ngOnInit(): void {
        this.message = this.waitingRoomManagerService.getMessageSource();
        this.isHostPlayerWaiting = this.waitingRoomManagerService.isHostPlayer();
        this.isPrivateRoom = this.waitingRoomManagerService.isPrivateRoom();
        this.waitingRoomManagerService.getJoinedPlayer().subscribe((playerName) => this.updateJoinMessage(playerName));
        this.joinResponseSubscription = this.waitingRoomManagerService.getJoinResponse().subscribe((answer) => this.manageJoinResponse(answer));
        this.waitingRoomManagerService.getGuestPlayerLeft().subscribe((answer) => this.updateWaitingStatus(answer));
        this.waitingRoomManagerService.askForWaitingPlayers();
        this.subscription = this.waitingRoomManagerService.getWaitingPlayersObservable().subscribe((users) => this.filterPlayers(users));
    }

    filterPlayers(users: PublicUser[]) {
        this.selfUsername = this.authService.getUsername();
        this.userList = users;
        this.playerList = users.filter((user) => {
            return user.username !== this.selfUsername && (user.userType === 'human' || user.userType === 'virtual');
        });
        this.observerList = users.filter((user) => {
            return user.userType === 'observer';
        });
        this.virtualPlayerList = users.filter((user) => {
            return user.userType === 'virtual';
        });
    }

    updateWaitingStatus(answer: string): void {
        this.isGuestPlayerWaiting = false;
        this.message = answer;
    }

    launchGame(): void {
        this.waitingRoomManagerService.answerGuestPlayer(true, '', '');
        sessionStorage.removeItem('playerID');
        sessionStorage.removeItem('chat');
        this.router.navigate(['/game']);
    }

    denyPlayer(username: string, isPlayer: boolean): void {
        if (isPlayer) this.waitingRoomManagerService.answerGuestPlayer(false, 'playerDeleted', username);
        else this.waitingRoomManagerService.answerGuestPlayer(false, 'observerDeleted', username);
        this.waitingRoomManagerService.setGuestPlayer(false);
        this.isGuestPlayerWaiting = false;
        this.waitingRoomManagerService.askForWaitingPlayers();
    }

    removeVirtualPlayer(username: string): void {
        this.waitingRoomManagerService.removeVirtualPlayer(username);
        this.waitingRoomManagerService.askForWaitingPlayers();
    }

    convertMultiToSolo(): void {
        this.waitingRoomManagerService.convertMultiToSolo();
        this.router.navigate(['/create-game']);
        this.waitingRoomManagerService.deleteRoom();
    }

    deleteRoom(): void {
        if (this.userList.length > 0) this.waitingRoomManagerService.answerGuestPlayer(false, 'roomDeleted', '');
        this.waitingRoomManagerService.deleteRoom();
        this.router.navigate(['/create-game']);
    }

    leaveRoom(): void {
        this.waitingRoomManagerService.setGuestPlayer(false);
        this.isGuestPlayerWaiting = false;
        this.waitingRoomManagerService.updateWaitingRoom("Veuillez attendre qu'un joueur rejoigne votre salle.");
        this.message = this.waitingRoomManagerService.getMessageSource();
        this.joinResponseSubscription.unsubscribe();
        this.router.navigate(['/join-game']);
    }

    addVirtualPlayer() {
        this.waitingRoomManagerService.addVirtualPlayer();
        this.waitingRoomManagerService.askForWaitingPlayers();
    }

    private updateJoinMessage(playerName: string) {
        this.isGuestPlayerWaiting = this.waitingRoomManagerService.isGuestPlayer();
        if (this.isGuestPlayerWaiting) this.message = `${playerName} tente de rejoindre votre partie`;
        else this.message = "Veuillez attendre qu'un joueur rejoigne votre salle.";
    }

    private manageJoinResponse(answer: boolean) {
        if (answer) {
            sessionStorage.removeItem('playerID');
            sessionStorage.removeItem('chat');
            this.router.navigate(['/game']);
        } else {
            this.joinResponseSubscription.unsubscribe();
            alert(this.waitingRoomManagerService.getAlertMessage());
            this.router.navigate(['/join-game']);
        }
    }
}
