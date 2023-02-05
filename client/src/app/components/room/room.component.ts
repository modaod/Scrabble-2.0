import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import {MultiChatService} from "@app/services/chat-service/multi-chat.service";
import {MatDialogRef} from "@angular/material/dialog";
import {LanguageService} from "@app/services/language-service/language.service";

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
    roomName = 'none';
    rooms: string[];
    newRoom: FormControl;
    roomExist: boolean;
    selectedRoom: string;
    filteredOptions: Observable<string[]>;
    roomControl = new FormControl('', Validators.required);

    constructor(private multiChatService: MultiChatService, private dialogRef: MatDialogRef<RoomComponent>, public languageService: LanguageService) {}

    ngOnInit(): void {
        this.rooms = this.multiChatService.channels;

        this.newRoom = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z1-9]*')]);

        // if (this.roomName !== 'none') this.newRoom.disable();
        // else this.newRoom.enable();

        this.filteredOptions = this.roomControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value || '')),
        );
    }

    onCreateRoom() {
        this.multiChatService.createRoom(this.newRoom.value);
        this.dialogRef.close();
    }

    onChange() {
        if(this.newRoom.value !== '')
            this.roomControl.disable();
        else
            this.roomControl.enable();
    }

    onChange2() {
        if(this.roomControl.value !== '')
            this.newRoom.disable();
        else
            this.newRoom.enable();
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.rooms.filter((option) => option.toLowerCase().includes(filterValue));
    }

    onJoinRoom() {
        this.multiChatService.onJoinRoom(this.roomControl.value);
        this.dialogRef.close();
    }

    find() {
        return this.rooms.find(value => this.roomControl.value === value);
    }
}
