import { Injectable } from '@angular/core';
import { Database, ref, onValue, get, set, child } from 'firebase/database';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { EnglishVersion, FrenchVersion, Languages } from '@app/constants/languages';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    db: Database;
    language: Languages;
    constructor(private authService: AuthService, private firebaseService: FirebaseService) {
        this.db = this.firebaseService.db;
    }

    getLanguage() {
        const self = ref(this.db, `users/${this.authService.getUserID()}/language`);
        onValue(self, (snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val() === 'en') this.language = new EnglishVersion();
                else this.language = new FrenchVersion();
            } else this.language = new FrenchVersion();
        });
    }

    changeLanguage() {
        get(child(ref(this.db), `users/${this.authService.getUserID()}/language`)).then((snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val() === 'fr') set(ref(this.db, `users/${this.authService.getUserID()}/language`), 'en');
                else set(ref(this.db, `users/${this.authService.getUserID()}/language`), 'fr');
            }
        });
    }
}
