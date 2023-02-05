import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { MultiChatService } from '@app/services/chat-service/multi-chat.service';
import { Observable } from 'rxjs';
import { FirebaseMessage } from '@app/classes/firebase-message';

@Component({
    selector: 'app-chat-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit {
    selectedRoom: string;
    rooms: string[];
    chats: FirebaseMessage[] = [];
    filteredOptions: Observable<string[]>;
    roomControl = new FormControl('', Validators.required);
    message: string;
    me: string;
    type: string;
    timestamp = new Date();
    show = false;
    constructor(public multiChatService: MultiChatService) {}

    async ngOnInit(): Promise<void> {
        // await this.multiChatService.getChannels().then(() => {
        //     this.rooms = this.multiChatService.channels;
        // });

        this.multiChatService.getChannels();
        this.rooms = this.multiChatService.channels;

        this.multiChatService.getMessages();
        this.chats = [];
        this.chats = this.multiChatService.messages;
        this.me = this.multiChatService.getUser();

        this.filteredOptions = this.roomControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value || '')),
        );
    }

    filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.rooms.filter((option) => option.toLowerCase().includes(filterValue));
    }

    onChange() {}

    get room() {
        return this.multiChatService.getRoom();
    }

    sendMessage() {
        this.multiChatService.sendMessage(this.message);
        this.message = '';
    }

    onChooseRoom(roomName: string) {
        this.multiChatService.onJoinRoom(roomName);
    }

    createRoom() {
        if (this.multiChatService.findRoom(this.roomControl.value) !== undefined) this.multiChatService.createRoom(this.roomControl.value);
    }

    close() {
        window.close();
    }
}
