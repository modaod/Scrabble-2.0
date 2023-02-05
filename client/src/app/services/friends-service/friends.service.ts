import { Injectable } from '@angular/core';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { Database, ref, get, child, set, onValue } from 'firebase/database';
import { User } from '@app/classes/user';
import { AuthService } from '@app/services/authentification-service/auth.service';

@Injectable({
    providedIn: 'root',
})
export class FriendsService {
    db: Database;
    playerUID: string;
    incomingFriendRequests: User[] = [];
    outgoingFriendRequests: User[] = [];
    onlineFriends: User[] = [];
    allFriends: User[] = [];

    constructor(private firebaseService: FirebaseService, private authService: AuthService) {
        this.db = this.firebaseService.db;
        this.playerUID = this.authService.getUserID();
    }

    getUserIncomingRequests() {
        const selfInc = ref(this.db, `users/${this.playerUID}/incomingFriendRequests`);
        onValue(selfInc, (snapshot) => {
            this.incomingFriendRequests = [];
            if (snapshot.exists()) {
                snapshot.val().forEach((children: string) => {
                    get(child(ref(this.db), `users/${children}`)).then((userSnapshot) => {
                        const user = userSnapshot.val() as User;
                        this.incomingFriendRequests.push(user);
                    });
                });
            }
        });
    }

    getUserOutgoingRequests() {
        const selfInc = ref(this.db, `users/${this.playerUID}/outgoingFriendRequests`);
        onValue(selfInc, (snapshot) => {
            this.outgoingFriendRequests = [];
            if (snapshot.exists()) {
                snapshot.val().forEach((children: string) => {
                    get(child(ref(this.db), `users/${children}`)).then((userSnapshot) => {
                        const user = userSnapshot.val() as User;
                        this.outgoingFriendRequests.push(user);
                    });
                });
            }
        });
    }

    getUserAllFriends() {
        const selfInc = ref(this.db, `users/${this.playerUID}/friends`);
        onValue(selfInc, (snapshot) => {
            this.allFriends = [];
            if (snapshot.exists()) {
                snapshot.val().forEach((children: string) => {
                    get(child(ref(this.db), `users/${children}`)).then((userSnapshot) => {
                        const user = userSnapshot.val() as User;
                        this.allFriends.push(user);
                        onValue(ref(this.db, `users/${children}/status`), (statusSnapshot) => {
                            if (statusSnapshot.exists()) {
                                this.allFriends[this.allFriends.map(u => u.uid).indexOf(user.uid, 0)].status = statusSnapshot.val();
                            }
                        })
                    });
                });
            }
        });
    }

    getUserOnlineFriends() {
        const selfInc = ref(this.db, `users/${this.playerUID}/friends`);
        onValue(selfInc, (snapshot) => {
            this.onlineFriends = [];
            if (snapshot.exists()) {
                snapshot.val().forEach((children: string) => {
                    get(child(ref(this.db), `users/${children}`)).then((userSnapshot) => {
                        const user = userSnapshot.val() as User;
                        onValue(ref(this.db, `users/${children}/status`), (statusSnapshot) => {
                            if (statusSnapshot.exists()) {
                                if (statusSnapshot.val() === 'Offline') {
                                    this.onlineFriends.splice(this.onlineFriends.map(u => u.uid).indexOf(user.uid, 0), 1);
                                } else {
                                    user.status = statusSnapshot.val();
                                    this.onlineFriends.push(user);
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    deleteFriend(friend: User) {
        // Remove friend for yourself and the other dude
        // Update with new friend list
        get(child(ref(this.db), `users/${friend.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const him = snapshot.val() as User;
                him.friends.splice(him.friends.indexOf(this.playerUID, 0), 1);
                set(ref(this.db, `users/${friend.uid}/friends`), him.friends);
            }
        });
        // Update own friend list
        get(child(ref(this.db), `users/${this.playerUID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const me = snapshot.val() as User;
                me.friends.splice(me.friends.indexOf(friend.uid, 0), 1);
                set(ref(this.db, `users/${this.playerUID}/friends`), me.friends);
            }
        });
    }

    addFriend(username: string) {
        get(child(ref(this.db), 'users/')).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((secondshot) => {
                    const user = secondshot.val() as User;
                    if (user.username === username && user.uid !== this.playerUID) {
                        if (user.incomingFriendRequests !== undefined) {
                            for (const itr of user.incomingFriendRequests) {
                                if (itr === this.playerUID) return;
                            }
                            user.incomingFriendRequests.push(this.playerUID);
                            set(ref(this.db, `users/${user.uid}/incomingFriendRequests`), user.incomingFriendRequests);
                        } else set(ref(this.db, `users/${user.uid}/incomingFriendRequests`), [this.playerUID]);

                        get(child(ref(this.db), `users/${this.playerUID}`)).then((self) => {
                            if (self.exists()) {
                                const data = self.val() as User;
                                if (data.outgoingFriendRequests !== undefined) {
                                    data.outgoingFriendRequests.push(user.uid);
                                    set(ref(this.db, `users/${this.playerUID}/outgoingFriendRequests`), data.outgoingFriendRequests);
                                } else set(ref(this.db, `users/${this.playerUID}/outgoingFriendRequests`), [user.uid]);
                            }
                        });
                    }
                });
            }
        });
    }

    acceptFriendRequest(stranger: User) {
        get(child(ref(this.db), `users/${stranger.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const him = snapshot.val() as User;
                him.outgoingFriendRequests.splice(him.outgoingFriendRequests.indexOf(this.playerUID, 0), 1);
                set(ref(this.db, `users/${stranger.uid}/outgoingFriendRequests`), him.outgoingFriendRequests);
                if (him.friends !== undefined) {
                    him.friends.push(this.playerUID);
                    him.friends = him.friends.filter((v, i, a) => a.indexOf(v) === i);
                    set(ref(this.db, `users/${stranger.uid}/friends`), him.friends);
                } else set(ref(this.db, `users/${stranger.uid}/friends`), [this.playerUID]);
            }
        });
        get(child(ref(this.db), `users/${this.playerUID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const me = snapshot.val() as User;
                me.incomingFriendRequests.splice(me.incomingFriendRequests.indexOf(stranger.uid, 0), 1);
                set(ref(this.db, `users/${this.playerUID}/incomingFriendRequests`), me.incomingFriendRequests);
                if (me.friends !== undefined) {
                    me.friends.push(stranger.uid);
                    me.friends = me.friends.filter((v, i, a) => a.indexOf(v) === i);
                    set(ref(this.db, `users/${this.playerUID}/friends`), me.friends);
                } else set(ref(this.db, `users/${this.playerUID}/friends`), [stranger.uid]);
            }
        });
    }

    denyFriendRequest(stranger: User) {
        get(child(ref(this.db), `users/${stranger.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const him = snapshot.val() as User;
                him.outgoingFriendRequests.splice(him.outgoingFriendRequests.indexOf(this.playerUID, 0), 1);
                set(ref(this.db, `users/${stranger.uid}/outgoingFriendRequests`), him.outgoingFriendRequests);
            }
        });
        get(child(ref(this.db), `users/${this.playerUID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const me = snapshot.val() as User;
                me.incomingFriendRequests.splice(me.incomingFriendRequests.indexOf(stranger.uid, 0), 1);
                set(ref(this.db, `users/${this.playerUID}/incomingFriendRequests`), me.incomingFriendRequests);
            }
        });
    }

    retractFriendRequest(stranger: User) {
        get(child(ref(this.db), `users/${stranger.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const him = snapshot.val() as User;
                him.incomingFriendRequests.splice(him.incomingFriendRequests.indexOf(this.playerUID, 0), 1);
                set(ref(this.db, `users/${stranger.uid}/incomingFriendRequests`), him.incomingFriendRequests);
            }
        });
        get(child(ref(this.db), `users/${this.playerUID}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const me = snapshot.val() as User;
                me.outgoingFriendRequests.splice(me.outgoingFriendRequests.indexOf(stranger.uid, 0), 1);
                set(ref(this.db, `users/${this.playerUID}/outgoingFriendRequests`), me.outgoingFriendRequests);
            }
        });
    }
}
