import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { child, Database, get, ref, set } from 'firebase/database';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { User } from '@app/classes/user';
import { FriendsService } from '@app/services/friends-service/friends.service';
import { Leagues } from '@app/constants/leagues';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-end-game-page',
    templateUrl: './end-game-page.component.html',
    styleUrls: ['./end-game-page.component.scss'],
})
export class EndGamePageComponent implements OnInit {
    db: Database;
    playerUID: string;
    winner: [User, number][] = [];
    losers: [User, number][] = [];

    constructor(
        public friendService: FriendsService,
        private readonly router: Router,
        private fireBaseService: FirebaseService,
        private authService: AuthService,
        private gameStateService: GameStateService,
        public languageService: LanguageService,
    ) {
        this.db = this.fireBaseService.db;
        this.playerUID = this.authService.getUserID();
    }

    ngOnInit() {
        this.getFinalRanking();
    }

    getFinalRanking() {
        get(child(ref(this.db), 'users/')).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((secondshot) => {
                    const user = secondshot.val() as User;
                    for (const player of this.gameStateService.playerInfos) {
                        if (user.username === player.username && player.winner) {
                            if (this.gameStateService.isRankedGame && user.uid === this.playerUID) {
                                if (user.rankedPoints + 20 >= 100) {
                                    if (Object.keys(Leagues).indexOf(user.rankedLevel) !== 4) {
                                        user.rankedLevel = Object.values(Leagues)[Object.keys(Leagues).indexOf(user.rankedLevel) + 1];
                                    }
                                    user.rankedPoints = user.rankedPoints + 20 - 100;
                                    set(ref(this.db, `users/${user.uid}/rankedLevel`), user.rankedLevel);
                                } else {
                                    user.rankedPoints += 20;
                                }
                                set(ref(this.db, `users/${user.uid}/rankedPoints`), user.rankedPoints);
                            }
                            this.winner.push([user, player.currentScore]);
                        } else {
                            if (user.username === player.username && !player.winner) {
                                if (this.gameStateService.isRankedGame && user.uid === this.playerUID) {
                                    if (user.rankedPoints - 10 < 0) {
                                        if (Object.keys(Leagues).indexOf(user.rankedLevel) !== 0) {
                                            user.rankedLevel = Object.values(Leagues)[Object.keys(Leagues).indexOf(user.rankedLevel) - 1];
                                        }
                                        user.rankedPoints = 0;
                                        set(ref(this.db, `users/${user.uid}/rankedLevel`), user.rankedLevel);
                                    } else {
                                        user.rankedPoints -= 10;
                                    }
                                    set(ref(this.db, `users/${user.uid}/rankedPoints`), user.rankedPoints);
                                }
                                this.losers.push([user, player.currentScore]);
                            }
                        }
                    }
                });
            }
        });
    }

    goHome() {
        this.router.navigate(['home']);
    }
}
