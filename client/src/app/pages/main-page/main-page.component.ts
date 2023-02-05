import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-settings';
import { User } from '@app/classes/user';
import { LeaderboardComponent } from '@app/components/leaderboard/leaderboard.component';
import { ProfileComponent } from '@app/components/profile/profile.component';
import { WordFinderComponent } from '@app/components/word-finder/word-finder.component';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { LanguageService } from '@app/services/language-service/language.service';
import { getAuth } from 'firebase/auth';
import { Database, get, getDatabase, onValue, ref, set, update } from 'firebase/database';
import { FriendPageComponent } from '../friend-page/friend-page.component';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    theme: string;

    constructor(
        private dialog: MatDialog,
        private gameModeService: GameModeService,
        private firebaseService: FirebaseService,
        private router: Router,
        public languageService: LanguageService,
    ) {
        this.languageService.getLanguage();
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

    openScores() {
        this.dialog.open(LeaderboardComponent, {
            width: '30%',
            height: '500px',
        });
    }

    openWordFinder() {
        this.dialog.open(WordFinderComponent, {
            width: '70%',
            height: 'auto',
            panelClass: 'custom-dialog-container',
        });
    }

    openProfile() {
        this.dialog.open(ProfileComponent, {
            width: '70%',
            height: '600px',
            panelClass: 'custom-dialog-container',
        });
    }

    openFriends() {
        this.dialog.open(FriendPageComponent, {
            width: '70%',
            height: '600px',
            panelClass: 'custom-dialog-container',
        });
    }

    changeTheme() {
        const auth = getAuth(this.firebaseService.app);
        const db: Database = getDatabase();

        this.theme = this.theme === '#3A3B3C' ? '#FFFFFF' : '#3A3B3C';

        update(ref(db, `users/${auth.currentUser?.uid}`), {
            theme: this.theme,
        });
    }

    setScrabbleMode(scrabbleMode: GameType): void {
        this.gameModeService.setScrabbleMode(scrabbleMode);
    }

    get gameTypeEnum(): typeof GameType {
        return GameType;
    }
    logout() {
        const date = new Date();
        const auth = getAuth(this.firebaseService.app);
        const db: Database = getDatabase();

        update(ref(db, `users/${auth.currentUser?.uid}`), {
            status: 'Offline',
        });
        get(ref(db, `users/${auth.currentUser?.uid}`))
            .then((snapshot) => {
                const user: User = snapshot.val();
                const dbUrl = `users/${auth.currentUser?.uid}/activity/${user.activity?.length || 0}`;
                const dateToSend =
                    date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + ' ' + date.getHours() + ':' + date.getMinutes();
                console.log(dbUrl);
                set(ref(db, dbUrl), {
                    date: dateToSend,
                    type: 'Déconnexion',
                });
            })
            .then(() => {
                auth.signOut();
                this.router.navigateByUrl('auth');
            });
    }

    openChat() {
        this.dialog.open(ChatPageComponent);
    }
}
