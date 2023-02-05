/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database, DataSnapshot, get, getDatabase, ref } from 'firebase/database';

import 'reflect-metadata';
// eslint-disable-next-line no-unused-vars
import { Service } from 'typedi';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { User } from '@app/constants/basic-interface';

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

@Service()
// eslint-disable-next-line no-unused-vars
export class RealtimeDatabaseService {
    private db: Database;
    private app: FirebaseApp;

    constructor() {
        const firebaseConfig: FirebaseConfig = {
            apiKey: 'AIzaSyBMXp6exKLg7Lr2CeIQIvGaS7zbh8S431A',
            authDomain: 'scrabble-79318.firebaseapp.com',
            databaseURL: 'https://scrabble-79318-default-rtdb.firebaseio.com',
            projectId: 'scrabble-79318',
            storageBucket: 'scrabble-79318.appspot.com',
            messagingSenderId: '213273036174',
            appId: '1:213273036174:web:c51d588a133c5c9ac250df',
            measurementId: 'G-MK50W5ML4G',
        };
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
    }

    async getUser(userID: string): Promise<any> {
        return await get(ref(this.db, `users/${userID}`))
            .then((snapshot: DataSnapshot) => {
                return snapshot.val() as User;
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }
}
