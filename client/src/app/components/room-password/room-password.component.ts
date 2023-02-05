/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import {LanguageService} from "@app/services/language-service/language.service";

@Component({
    selector: 'app-room-password',
    templateUrl: './room-password.component.html',
    styleUrls: ['./room-password.component.scss'],
})
export class RoomPasswordComponent implements OnInit {
    roomPassword: string;
    roomName: string;
    isPlayer: boolean;
    isGameStarted: boolean;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<RoomPasswordComponent>,
        private router: Router,
        private waitingRoomManagerService: WaitingRoomManagerService,
        public languageService: LanguageService,
    ) {}

    ngOnInit(): void {
        this.roomPassword = this.data.roomPassword;
        this.roomName = this.data.roomName;
        this.isPlayer = this.data.player;
        this.isGameStarted = this.data.isGameStarted;
    }

    closeDialog() {
        this.dialogRef.close();
    }

    enterPassword(passwordInput: string) {
        if (passwordInput === this.roomPassword) {
            this.waitingRoomManagerService.setRoomToJoin(this.roomName);
            if (!this.isPlayer && this.isGameStarted) {
                this.waitingRoomManagerService.joinRoomObserverGameStarted();
            } else {
                this.waitingRoomManagerService.joinRoom(this.isPlayer);
                this.waitingRoomManagerService.setHostPlayer(false);
                this.router.navigate(['/waiting-room']);
            }
            this.dialogRef.close();
        } else alert('Mot de passe incorrect');
    }
}
