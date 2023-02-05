import { Injectable } from '@angular/core';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { Auth, getAuth } from 'firebase/auth';
import { child, Database, getDatabase, onChildAdded, onValue, push, ref, update } from 'firebase/database';
import { FirebaseMessage } from '@app/classes/firebase-message';
import { AuthService } from '@app/services/authentification-service/auth.service';

@Injectable({
    providedIn: 'root',
})
export class MultiChatService {
    db: Database = getDatabase();
    messages: FirebaseMessage[] = [];
    roomName = 'general';
    channels: string[] = [];
    chatHistory = false;

    constructor(private firebaseService: FirebaseService, public auth: AuthService) {}

    getUser(): string {
        const auth: Auth = getAuth(this.firebaseService.app);
        return auth.currentUser?.displayName as string;
    }

    getMessages() {
        const messagesDb = ref(this.db, `chat/${this.roomName}`);

        onValue(messagesDb, (snapshot) => {
            this.messages.splice(0);
            console.log(this.messages);
            console.log("=========");
            console.log(snapshot.val());
            snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val() as FirebaseMessage;
                this.messages.push(childData);
                console.log(this.messages);
            });
            // sessionStorage.setItem('firebaseChat', JSON.stringify(this.messages));
        });

        // onChildAdded(messagesDb, (data) => {
        //     this.messages.push(data.val() as FirebaseMessage);
        // });
    }

    sendMessage(message: string) {
        const postKey = push(child(ref(this.db), `chat/${this.roomName}`)).key;
        const date = new Date().toString();
        const user = this.getUser();
        const postData = { date, message, user };

        update(ref(this.db, `chat/${this.roomName}/` + postKey), postData);
    }

    // snapshotToArray = (snapshot: unknown) => {
    //     const returnArr = Array();
    //     snapshot.forEach((childSnapshot: unknown) => {
    //         const item = childSnapshot.val();
    //         // item.key = childSnapshot.key;
    //         returnArr.push(item);
    //     });
    //     return returnArr;
    // };

    createRoom(roomName: string) {
        this.roomName = roomName;

        const newPostKey = push(child(ref(this.db), `chat/${roomName}`)).key;
        const date = new Date().toString();
        const username = this.getUser().toString().toUpperCase();
        const message = `Salon crée par ${username}`;
        const user = `Debut de ${roomName} `;

        const postData = { date, message, user };
        update(ref(this.db, `chat/${roomName}/` + newPostKey), postData);

        // this.chatHistory = true;
        this.getMessages();
    }

    getChannels() {
        const messagesDb = ref(this.db, 'chat');
        // onValue(messagesDb, (snapshot) => {
        //     snapshot.forEach((childSnapshot) => {
        //         const childData = childSnapshot.ref.key as string;
        //         console.log(childData);
        //         if(childData !== 'general')
        //             this.channels.push(childData);
        //     });
        // });
        this.channels.splice(0);
        onChildAdded(messagesDb, (data) => {
            const channel = data.ref.key as string;
            this.channels.push(channel);
        });
    }

    onJoinRoom(roomName: string) {
        // this.chatHistory = true;
        this.roomName = roomName;
        this.getMessages();
    }

    getRoom() {
        return this.roomName;
    }

    async getChannelss() {
        this.auth.auth.onAuthStateChanged(() => {
            onValue(ref(getDatabase(), 'chat'), (snapshot) => {
                snapshot.forEach((data) => {
                    const channel = data.ref.key as string;
                    this.channels.push(channel);
                });
            });
        });
    }

    findRoom(name: string) {
        return this.channels.find((roomName) => roomName === name);
    }
}
