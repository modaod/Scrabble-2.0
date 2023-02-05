import { Component, OnInit } from '@angular/core';
import { WaitingRoomManagerService } from '@app/services/waiting-room-manager-service/waiting-room-manager.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-ranked-waiting-room',
    templateUrl: './ranked-waiting-room.component.html',
    styleUrls: ['./ranked-waiting-room.component.scss'],
})
export class RankedWaitingRoomComponent implements OnInit {
    message: string = '';
    joinResponseSubscription: Subscription;

    constructor(private waitingRoomManagerService: WaitingRoomManagerService, private router: Router, public languageService: LanguageService) {}

    ngOnInit(): void {
        this.message = this.waitingRoomManagerService.getMessageSource();
        this.waitingRoomManagerService.rankedGameReady();
        this.joinResponseSubscription = this.waitingRoomManagerService.getJoinResponse().subscribe((answer) => this.manageJoinResponse(answer));
    }

    leaveQueue() {
        this.waitingRoomManagerService.leaveRankedQueue();
        this.router.navigate(['/home']);
    }

    private manageJoinResponse(answer: boolean) {
        if (answer) {
            sessionStorage.removeItem('playerID');
            sessionStorage.removeItem('chat');
            this.router.navigate(['/game']);
        } else {
            this.joinResponseSubscription.unsubscribe();
            alert(this.waitingRoomManagerService.getAlertMessage());
            this.router.navigate(['/home']);
        }
    }
}
