import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/user.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userName!: FormControl;
  password!: FormControl;

  constructor(private router: Router, public afs: AngularFirestore, public afAuth: AngularFireAuth, private userService: UserService) { }

  ngOnInit(): void {
    this.userName = new FormControl('', Validators.required);
    this.password = new FormControl('', Validators.required);
  }
   // Sign in with email/password
   SignIn(email: string, password: string) {

    console.log("this is my console log")
    console.log(email, password)
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result.user);
        this.userService.setUser(result.user)
        this.router.navigateByUrl('home');
        //this.SetUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigateByUrl('home');
          }
        });
      })
      .catch((error) => {
        // window.alert(error.message);
        window.alert(error);

      });
  }
  // Sign up with email/password
  
  onLogin() {

    this.router.navigateByUrl('home');
  }
}
