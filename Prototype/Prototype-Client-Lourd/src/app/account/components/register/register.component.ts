import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/compat/auth"
import {Router} from "@angular/router";

import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  userName!: FormControl;
  email!: FormControl;
  password!: FormControl;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  constructor(public afs: AngularFirestore, public afAuth: AngularFireAuth, private router : Router) { }

  ngOnInit(): void {
    this.userName = new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.-]*$')
      ]);
    this.email = new FormControl('', [
      Validators.required,
      Validators.pattern(this.regexp),
    ]);
    this.password = new FormControl('', Validators.required);

  }
  SignUp(email: string, password: string, username: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password).then((result) => {
        result.user?.updateProfile({
        displayName: username + '_' +result.user.uid.substring(0,4)
      })
      }
      ).then(()=>{
        this.router.navigateByUrl('auth');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
}
