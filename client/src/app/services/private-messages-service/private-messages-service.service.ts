import { Injectable } from '@angular/core';
import { PrivateMessage } from '@app/classes/message';
import { User } from '@app/classes/user';
import { child, get, getDatabase, onValue, ref } from 'firebase/database';
import { getStorage } from "firebase/storage";
import { AuthService } from '../authentification-service/auth.service';
@Injectable({
  providedIn: 'root'
})
export class PrivateMessagesService {
  // allDM: PrivateMessage[] = []
  allFriends: User[] = []
  currentUser: User
  data : Map<String, PrivateMessage[]> = new Map()
  storage = getStorage();
  constructor(public auth: AuthService) { }
  async getAllMessages(){
    this.auth.auth.onAuthStateChanged(()=>{
      
  
      onValue(ref(getDatabase(), `users/${this.auth.auth.currentUser?.uid?.toString()}/chat`), (messages) => {
        console.log("ligne 19 in private message service ")
        console.log(messages.val())
        messages.forEach((message)=>{
          // message.forEach((elem) => {

          //   console.log(elem.val())
          // })
          this.data.set(message.key!!, this.snapshotToArray(message))
          
          
    })
      
    })
   
    })
  }
 

  async getAllFriends(){
    this.auth.auth.onAuthStateChanged(()=>{
      
      console.log(`users/${this.auth.auth.currentUser?.uid?.toString()}/friends`)
      onValue(ref(getDatabase(), `users/${this.auth.auth.currentUser?.uid?.toString()}/friends`), (snapshot) => {
         
         
          if (snapshot.exists()) {
            this.allFriends = [];
              snapshot.val().forEach((children: string) => {
                  get(child(ref(getDatabase()), `users/${children}`)).then((userSnapshot) => {
                      const user = userSnapshot.val() as User;
                      this.allFriends.push(user);
                      console.log("line 45")
                      console.log(this.allFriends)
                  });
              });
              
          }
      });
      
          
    
   
    })
   
        
  }
    
  
  snapshotToArray = (snapshot: any) => {
    const returnArr = Array();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshot.forEach((childSnapshot: any) => {
        const item = childSnapshot.val();
        returnArr.push(item);
    });

    return returnArr;
}




}
