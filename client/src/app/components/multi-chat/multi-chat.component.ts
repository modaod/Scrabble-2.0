import { Component, OnInit } from '@angular/core';
import { MultiChatService } from '@app/services/chat-service/multi-chat.service';
import { FirebaseMessage } from '@app/classes/firebase-message';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-multi-chat',
    templateUrl: './multi-chat.component.html',
    styleUrls: ['./multi-chat.component.scss'],
})
export class MultiChatComponent implements OnInit {
    // @ViewChild("chatlist") chatList: ElementRef;
    chats: FirebaseMessage[] = [];
    newMessage: string;
    me: string;

    constructor(private multiChatService: MultiChatService, public languageService: LanguageService ) {}

    ngOnInit(): void {
        // if(this.multiChatService.chatHistory){
        //     this.renderer.setProperty(this.chatList.nativeElement, 'innerHTML', '');
        //     this.multiChatService.chatHistory = false;
        // }

        this.multiChatService.getMessages();
        this.chats = this.multiChatService.messages;
        this.multiChatService.getChannels();
        this.me = this.multiChatService.getUser();

        // this.messages = this.multiChatService.messageHistory;
        // this.filterMessage(this.messages);
        // const history = sessionStorage.getItem('firebaseChat');
        // if (history) this.chats = JSON.parse(history);
        // this.updateMessage();

        // const history = sessionStorage.getItem('chat');
        // if (history) this.messageHistory = JSON.parse(history);
        // console.log("HISTORY: " + history);
        // console.log("MESSAGE-HISTORY: " + this.messageHistory[1].body);
        // this.subscription = this.chatService.getMessages().subscribe((message: Message) => this.updateMessageHistory(message));
    }

    sendMessage() {
        this.multiChatService.sendMessage(this.newMessage);
        this.newMessage = '';
    }

    get room() {
        return this.multiChatService.getRoom();
    }
}
