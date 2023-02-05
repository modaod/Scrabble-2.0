import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/classes/user';
import { AuthService } from '@app/services/authentification-service/auth.service';
import { FirebaseService } from '@app/services/authentification-service/firebase.service';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Database, get, getDatabase, ref, set, update } from 'firebase/database';
@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss'],
})
export class AuthPageComponent implements OnInit {
    constructor(private firebaseService: FirebaseService, private router: Router, private authService: AuthService) {}

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @typescript-eslint/no-empty-function
    ngOnInit(): void {
        getAuth().onAuthStateChanged((res)=>{
            if(res?.uid){

                this.router.navigateByUrl('home');
            }
        })
    }
    login(email: string, password: string) {
        const auth = getAuth(this.firebaseService.app);

        signInWithEmailAndPassword(auth, email, password)
            .then((res) => {
                const db: Database = getDatabase();
                let date = new Date()

                get(ref(db, `users/${res.user.uid}`)).then((val)=>{

                    let user: User = val.val()
                    if(user.status == "Offline"){
                        update(ref(db, `users/${res.user.uid}`), {
                            status: 'Online',
                        });
                        const audio = new Audio('assets/scrabbleMusic.mp3');
                        audio.loop = true;
                        audio.play();
                        this.authService.setUserID();
                        this.router.navigateByUrl('home');
                        let dbUrl = `users/${auth.currentUser?.uid}/activity/${user.activity?.length || 0}`
                        let dateToSend =  date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + " " + date.getHours() +":"+ date.getMinutes()
                        console.log(dbUrl)
                        set(ref(db, dbUrl), {
                            date :dateToSend,
                            type: "Connexion"
                        })

                    }
                    else{
                        window.alert("You're already connected on another device")
                        auth.signOut()
                    }
                })

            })
            .catch((error: Error) => {
                window.alert(error);
            })
            .catch((error: Error) => {
                window.alert(error);
            });
    }
}
