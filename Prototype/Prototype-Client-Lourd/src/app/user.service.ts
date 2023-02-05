import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Injectable({
  providedIn: 'root'
})

export class UserService {
  user: firebase.default.User | null = null
  constructor(private auth: AngularFireAuth) { }
  logOut(){
    this.auth.signOut()
  }
  setUser(newUser:firebase.default.User | null){
    console.log("call the service")
    this.user =  newUser
    console.log(this.user)
  }
  // TODO implement the leave logic

}
