/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameRecap, User } from '@app/classes/user';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { child, get, getDatabase, onValue, ref } from 'firebase/database';
import { ProfileSettingsComponent } from '../profile-settings/profile-settings.component';
import {LanguageService} from "@app/services/language-service/language.service";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    // private auth: Auth;
    avatarUrl: string;
    user: User;
    // eslint-disable-next-line no-invalid-this

    playedGames: number = 0;
    wonGames: number = 0;
    meanScore: number = 0;
    meanTime: number = 0;
    games: GameRecap[] = [];
    constructor(private dialog: MatDialog, private authService: AuthService, public languageService: LanguageService) {}

    ngOnInit(): void {
        this.authService.auth.onAuthStateChanged(() => {
            this.getProfile();
            onValue(ref(getDatabase(), `users/${this.authService.auth.currentUser?.uid?.toString()}`), (snapshot) => {
                this.user = snapshot.val();
                this.calculStats();
            });
        });
    }

    calculStats() {
        let totalScore = 0;
        let totalTime = 0;
        this.playedGames = this.user.gamesPlayed?.length || 0;
        if (this.playedGames > 0) {
            this.user.gamesPlayed?.forEach((game) => {
                if (game.win) {
                    this.wonGames += 1;
                }
                totalScore += game.score;
                totalTime += game.time;
            });
            this.meanScore = totalScore / this.playedGames;
            this.meanTime = Math.round(totalTime / this.playedGames);
        }
    }
    getProfile() {
        const dbRef = getDatabase();
        get(child(ref(dbRef), `users/${this.authService.auth.currentUser?.uid?.toString()}`)).then((snapshot) => {
            this.user = snapshot.val();
            this.avatarUrl = snapshot.val().avatarUrl;
            this.calculStats();
            console.log(this.user.activity)
        });

    }



    openModifyProfile(isAvatarModification: boolean) {
        this.dialog.open(ProfileSettingsComponent, {
            width: '40%',
            height: '300px',
            disableClose: true,
            data: { isAvatar: isAvatarModification },
        });
    }

}
