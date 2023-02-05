import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '@app/classes/user';
import { AvatarComponent } from '@app/components/avatar/avatar.component';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { Auth, createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { child, Database, get, getDatabase, ref, set } from 'firebase/database';
import { Leagues } from '@app/constants/leagues';

@Component({
    selector: 'app-register-page',
    templateUrl: './register-page.component.html',
    styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit {
    // TODO demander au chargé pourquoi cette ligne ne marche pas sans les disable .
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    avatarUrl: string;
    constructor(private dialog: MatDialog, private firebaseService: FirebaseService, private router: Router) {}

    openAvatar() {
        this.dialog
            .open(AvatarComponent, {
                width: '30%',
                height: '500px',
            })
            .componentInstance.imageClicked.subscribe((result) => {
                this.avatarUrl = result;
            });
    }
    signup(email: string, password: string, username: string, confirmedPassword: string) {
        const auth: Auth = getAuth(this.firebaseService.app);
        const dbRef = ref(getDatabase());
        const regex = new RegExp('^[a-zA-Z0-9_.-]*$');
        let canRegister = true;
        if (password !== confirmedPassword) {
            window.alert('two different password');
            return;
        }
        if (!regex.test(username) || !regex.test(password)) {
            return window.alert('You are only allow to use alphanumeric character');
        }
        if (!this.avatarUrl) {
            window.alert('please choose your avatar');
            return;
        }
        get(child(dbRef, 'users')).then((snapshot) => {
            snapshot.forEach((user) => {
                if (user.val().username === username) {
                    canRegister = false;
                    window.alert('Username already in use');
                    return;
                }
            });
            if (canRegister) {
                createUserWithEmailAndPassword(auth, email, password)
                    .then((res) => {
                        updateProfile(res.user, {
                            displayName: username,
                        }).then(() => {
                            const db: Database = getDatabase();
                            const user: User = {
                                uid: res.user.uid,
                                username,
                                email,
                                avatarUrl: this.avatarUrl,
                                status: 'Offline',
                                language: 'fr',
                                friends: [],
                                theme: '#FFFFFF',
                                incomingFriendRequests: [],
                                outgoingFriendRequests: [],
                                rankedLevel: Leagues.bronze,
                                rankedPoints: 0,
                            };
                            set(ref(db, 'users/' + res.user.uid), user);
                        });
                    })
                    .then(() => {
                        this.router.navigateByUrl('auth');
                    })
                    .catch((error: Error) => {
                        window.alert(error);
                    });
            }
        });
    }
    // entryIsValid((email: string, password: string, username: string, confirmedPassword: string): boolean{
    //   const regex = "^[A-Za-z][A-Za-z0-9_]{7,29}$"
    //   if(password !== confirmedPassword){
    //     window.alert("two different password")
    //   }
    //   if(username.match(regex) && password.match(regex)){
    //     return true
    //   }
    //   return false
    // }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
    ngOnInit(): void {}
}
