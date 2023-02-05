/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-invalid-this */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '@app/classes/user';
import { getAuth, updateProfile } from 'firebase/auth';
import { child, get, getDatabase, ref, set, update } from 'firebase/database';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-profile-settings',
    templateUrl: './profile-settings.component.html',
    styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
    isAvatarModification: string;
    images: string[];
    currentImage: string;
    private auth = getAuth();
    private user = this.auth.currentUser;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ProfileSettingsComponent>, public languageService: LanguageService) {}
    onClick(url: string) {
        this.currentImage = url;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    changeUsername(newUsername: string) {
        const username = this.user?.displayName;
        const dbRef = getDatabase();
        const dbUrl = 'users/' + getAuth().currentUser?.uid;

        get(child(ref(dbRef), dbUrl)).then((snapshot) => {
            snapshot.forEach((user) => {
                if (user.val().username === username) {
                    return window.alert('Username already in use');
                }
            });
            const userData = snapshot.val() as User;
            userData.username = newUsername;
            updateProfile(this.user!, {
                displayName: newUsername,
            });
            set(ref(dbRef, dbUrl), userData);
        });
        this.dialogRef.close();
    }

    onSave() {
        const userUid = this.user?.uid;
        const dbRef = getDatabase();
        update(ref(dbRef, `users/${userUid}`), {
            avatarUrl: this.currentImage,
        });
        this.dialogRef.close();
    }

    ngOnInit(): void {
        this.isAvatarModification = this.data.isAvatar;
        const dbRef = getDatabase();
        get(ref(dbRef, 'images')).then((snapshot: any) => {
            this.images = this.snapshotToArray(snapshot);
        });
    }

    snapshotToArray = (snapshot: any) => {
        const returnArr = Array();
        snapshot.forEach((childSnapshot: any) => {
            const item = childSnapshot.val();
            // item.key = childSnapshot.key;
            returnArr.push(item);
        });

        return returnArr;
    };
}
