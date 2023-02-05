import { Component } from '@angular/core';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { FriendsService } from '@app/services/friends-service/friends.service';
import { getAuth } from 'firebase/auth';
import { Database, getDatabase, onValue, ref } from 'firebase/database';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-friend-page',
    templateUrl: './friend-page.component.html',
    styleUrls: ['./friend-page.component.scss'],
})
export class FriendPageComponent {
    theme: string;
    inputValue: string;
    isOnlineView: boolean = true;
    isAllView: boolean = false;
    isPendingView: boolean = false;
    isAddView: boolean = false;

    constructor(public friendService: FriendsService, private firebaseService: FirebaseService, public languageService: LanguageService) {
        this.friendService.getUserIncomingRequests();
        this.friendService.getUserOutgoingRequests();
        this.friendService.getUserAllFriends();
        this.friendService.getUserOnlineFriends();

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

    setOnlineView() {
        this.friendService.getUserOnlineFriends();
        this.isOnlineView = true;
        this.isAllView = false;
        this.isPendingView = false;
        this.isAddView = false;
    }

    setAllView() {
        this.friendService.getUserAllFriends();
        this.isOnlineView = false;
        this.isAllView = true;
        this.isPendingView = false;
        this.isAddView = false;
    }

    setPendingView() {
        this.friendService.getUserIncomingRequests();
        this.friendService.getUserOutgoingRequests();
        this.isOnlineView = false;
        this.isAllView = false;
        this.isPendingView = true;
        this.isAddView = false;
    }

    setAddView() {
        this.isOnlineView = false;
        this.isAllView = false;
        this.isPendingView = false;
        this.isAddView = true;
    }

    addFriend() {
        this.friendService.addFriend(this.inputValue);
        (document.getElementById('word-input') as HTMLInputElement).value = '';
    }
}
