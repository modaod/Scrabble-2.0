import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player, playersInfo } from '@app/components/info-panel/players-info';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';
import { GameStateService } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { Subscription } from 'rxjs';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { ChatService } from '@app/services/chat-service/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { RoomComponent } from '@app/components/room/room.component';
import { MultiChatService } from '@app/services/chat-service/multi-chat.service';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    isReceiver: string;
    playersInfo: Player[] = playersInfo;
    endGame: boolean = false;
    isPlayer: boolean = false;
    subscriptions: Subscription[] = [];
    isDisabled: boolean;
    isDragging: boolean = false;
    playerHand: string[] = [''];
    selectedLetter: string = '';
    imageData: ImageData;

    constructor(
        private readonly gameStateService: GameStateService,
        private readonly letterHolderService: LetterHolderService,
        private readonly gridService: GridService,
        private readonly router: Router,
        private readonly fontSize: FontSizeService,
        private letterAdderService: LetterAdderService,
        private chatService: ChatService,
        private dialog: MatDialog,
        private multiChatService: MultiChatService,
        public languageService: LanguageService,
    ) {}

    ngOnInit() {
        const id = sessionStorage.getItem('playerID');
        if (id) this.gameStateService.reconnect(id);
        this.subscriptions.push(this.gameStateService.getPlayerID().subscribe((newID) => sessionStorage.setItem('playerID', newID)));
        this.subscriptions.push(
            this.gameStateService.getGameStateObservable().subscribe((gameState) => {
                this.endGame = gameState.gameOver;
                this.isPlayer = true;
            }),
        );
        this.gameStateService.requestId();
        this.gameStateService.getJoinedPlayers();

        this.gameStateService.getObserverGameState();
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) subscription.unsubscribe();
    }

    alert() {
        if (this.isPlayer) {
            const text = 'Êtes-vous sûr(e) de vouloir quitter la partie? Tout votre progrès sera perdu.';
            if (confirm(text)) {
                this.gameStateService.sendAbandonRequest();
                this.router.navigate(['/home']);
            }
        } else {
            this.gameStateService.sendAbandonRequest();
            this.router.navigate(['/home']);
        }
    }

    goEndScreen() {
        this.gameStateService.sendAbandonRequest();
        this.router.navigate(['/home']);
    }

    goEndPage() {
        this.router.navigate(['end-game']);
    }

    setReceiver(receiver: string) {
        this.isReceiver = receiver;
    }

    onIncrease() {
        this.fontSize.increaseSize();
        this.letterHolderService.redrawTiles();
        this.gridService.deleteAndRedraw();
    }

    onDecrease() {
        this.fontSize.decreaseSize();
        this.letterHolderService.redrawTiles();
        this.gridService.deleteAndRedraw();
    }

    // disableButton(event: boolean) {
    //     this.isDisabled = event;
    //     console.log(`Event: ${event} '--' isDisabled: ${this.isDisabled}`)
    // }

    sendWord() {
        this.letterAdderService.makeMove();
    }

    skipTurn() {
        this.chatService.sendCommand('', 'Pass');
    }

    selectRoom() {
        this.dialog.open(RoomComponent);
    }

    publicChat() {
        // this.multiChatService.chatHistory = true;
        // this.multiChatService.chatType = ChatType.ROOMS;
        this.multiChatService.roomName = 'general';
        this.multiChatService.getMessages();
        // this.multiChatService.messages = [];
        // this.multiChatService.updateMessage();
    }

    goHome() {}

    goChatPage() {
        // this.router.navigateByUrl('chat');
        // window.open('chat', 'blank');

        const url = this.router.serializeUrl(this.router.createUrlTree(['/chat']));
        window.open(url, '_blank');
    }
}
