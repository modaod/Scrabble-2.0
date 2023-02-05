import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FirebaseService {
    app = initializeApp(environment.firebaseConfig);
    // eslint-disable-next-line no-invalid-this
    db = getDatabase(this.app);
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}
}
