import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { get, getDatabase, ref } from 'firebase/database';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Output() imageClicked = new EventEmitter<any>();
    images: string[];
    currentImage: string;
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() {}

    onClick(url: string) {
        this.imageClicked.emit(url);
        this.currentImage = url;
    }
    ngOnInit(): void {
        const dbRef = getDatabase();
        get(ref(dbRef, 'images')).then((snapshot) => {
            this.images = this.snapshotToArray(snapshot);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshotToArray = (snapshot: any) => {
        const returnArr = Array();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshot.forEach((childSnapshot: any) => {
            const item = childSnapshot.val();
            returnArr.push(item);
        });

        return returnArr;
    };
}
