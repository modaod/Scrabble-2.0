import { Component } from '@angular/core';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { GameModeService } from '@app/services/game-mode-service/game-mode.service';
import { getAuth } from 'firebase/auth';
import { Database, getDatabase, onValue, ref } from 'firebase/database';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-solo-multi-page',
    templateUrl: './solo-multi-page.component.html',
    styleUrls: ['./solo-multi-page.component.scss'],
})
export class SoloMultiPageComponent {
    theme: string;

    constructor(private gameModeService: GameModeService, private firebaseService: FirebaseService, public languageService: LanguageService) {
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

    setRankedMode(isRankedMode: boolean): void {
        this.gameModeService.setGameMode(isRankedMode);
    }
}
