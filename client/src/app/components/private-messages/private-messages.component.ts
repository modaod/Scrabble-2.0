import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PrivateMessage } from '@app/classes/message';
import { User } from '@app/classes/user';
import { FriendsService } from '@app/services/friends-service/friends.service';
import { PrivateMessagesService } from '@app/services/private-messages-service/private-messages-service.service';
import { uuidv4 } from '@firebase/util';
import { getDatabase, onValue, push, ref } from 'firebase/database';
import { getDownloadURL, getStorage, ref as refStorage, uploadBytes } from "firebase/storage";
import {LanguageService} from "@app/services/language-service/language.service";






@Component({
  selector: 'app-private-messages',
  templateUrl: './private-messages.component.html',
  styleUrls: ['./private-messages.component.scss']
})
export class PrivateMessagesComponent implements OnInit {
  show = false
  friends: User[] = []
  data : Map<String, PrivateMessage[]> = new Map()
  currentConversation: PrivateMessage[] = []
  currentFriend: User| undefined
  currentUser: User | undefined
  // canScroll = true
  @ViewChild('input') input: ElementRef;
  @ViewChild('inputFile') inputFile: ElementRef;
  // @ViewChild('messagesList') messagesList : ElementRef

  selectedFile: File




  constructor(public privateMessagesService: PrivateMessagesService, public friendsService : FriendsService, public languageService: LanguageService) { }

  async ngOnInit(): Promise<void> {

    await this.privateMessagesService.getAllMessages().then(()=>{

      this.data = this.privateMessagesService.data
      console.log("line 23")
      console.log(this.data)
    }
    )


    await this.privateMessagesService.getAllFriends().then(()=>{

      this.friends = this.privateMessagesService.allFriends
      console.log("line 32")
      console.log(this.privateMessagesService.allFriends)

    })
    
    onValue(ref(getDatabase(), `users/${this.privateMessagesService.auth.auth.currentUser?.uid?.toString()}`), (snapshot) => {
      this.currentUser = snapshot.val()

 
 
   })

    
  
    






  }

  openConversation(friendUid : String){
    onValue(ref(getDatabase(), `users/${this.privateMessagesService.auth.auth.currentUser?.uid?.toString()}/chat/${friendUid}`), (snapshot) => {
     this.currentConversation = this.privateMessagesService.snapshotToArray(snapshot)
    console.log(this.currentConversation)
    this.currentFriend = this.privateMessagesService.allFriends.find(friend=>friend.uid ===  friendUid)
    console.log("line 55")
    console.log(this.currentFriend)

  })
  }





// scrollToBottom() {
//   if(this.canScroll){
//     this.messagesList.nativeElement.scrollTop = this.messagesList.nativeElement.scrollHeight;
//     this.canScroll = false
//   }

//  }
  sendMessage(text: string){
    console.log(this.inputFile.nativeElement.value)
     
    let date = new Date()
    let dateToSend =  date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + " " + date.getHours() +":"+ date.getMinutes() + ":" + date.getSeconds()
    console.log(this.selectedFile)
    const imagePath = uuidv4()

    if(text.trim() === '' && !this.selectedFile){
      return
    }
    if(this.selectedFile && this.inputFile.nativeElement.value !== ''){
      uploadBytes(refStorage(getStorage(), imagePath), this.selectedFile).then((snapshot) => {

        getDownloadURL(refStorage(getStorage(), imagePath)).then((url) => {


        push(ref(getDatabase(),`users/${this.privateMessagesService.auth.auth.currentUser?.uid?.toString()}/chat/${this.currentFriend?.uid}` ), {
          message: url,
          time: dateToSend,
          uid: this.privateMessagesService.auth.auth.currentUser?.uid,
          picture: true
        })
        push(ref(getDatabase(),`users/${this.currentFriend?.uid}/chat/${this.privateMessagesService.auth.auth.currentUser?.uid}` ), {
          message: url,
          time: dateToSend,
          uid:  this.privateMessagesService.auth.auth.currentUser?.uid,
          picture: true
        })



    })
    .catch((error) => {
      // Handle any errors
    });



      });



    }
    if(text.trim() !== ''){
      push(ref(getDatabase(),`users/${this.privateMessagesService.auth.auth.currentUser?.uid?.toString()}/chat/${this.currentFriend?.uid}` ), {
        message: text,
        time: dateToSend,
        uid: this.privateMessagesService.auth.auth.currentUser?.uid,
        picture: false      })
      push(ref(getDatabase(),`users/${this.currentFriend?.uid}/chat/${this.privateMessagesService.auth.auth.currentUser?.uid}` ), {
        message: text,
        time: dateToSend,
        uid:  this.privateMessagesService.auth.auth.currentUser?.uid,
        picture: false
            })
  
    }

  
    
    this.input.nativeElement.value = ""
    this.inputFile.nativeElement.value = ""
    console.log(this.inputFile.nativeElement.value)
  }



  async onFileChanged(event:any) {
    this.selectedFile = event.target.files[0]
    // const imagePath = refStorage(getStorage(), 'images')







    // const docRef = await addDoc(collection(getFirestore(), "images"), this.selectedFile.stream);
    // console.log("Document written with ID: ", docRef.id);
    // const storage = getStorage();
    // const storageRef = refStorage(storage, 'images');

    // Create a child reference
    // const imagesRef = refStorage(storage, 'images');
  }
}
