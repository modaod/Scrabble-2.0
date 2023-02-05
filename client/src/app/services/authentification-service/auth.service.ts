import { Injectable } from '@angular/core';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    auth = getAuth();
    public userID: string;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {
        setPersistence(this.auth, browserLocalPersistence);
    }

    getUsername(): string {
        const username = this.auth.currentUser?.displayName;
        if (username) {
            return username;
        }
        return '';
    }

    setUserID() {
        if (this.auth.currentUser) {
            this.userID = this.auth.currentUser?.uid;
        }
    }

    getUserID(): string {
        if (this.auth.currentUser) {
            this.setUserID();
            return this.userID;
        }
        return '';
    }
}
