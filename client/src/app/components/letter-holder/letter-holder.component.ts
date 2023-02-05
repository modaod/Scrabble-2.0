import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { HOLDER_MEASUREMENTS, isManipulated, isSelected } from '@app/constants/letters-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { ChatService } from '@app/services/chat-service/chat.service';
import { GameState, GameStateService } from '@app/services/game-state-service/game-state.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { ManipulationRackService } from '@app/services/manipulation-rack-service/manipulation-rack.service';
import { MouseService } from '@app/services/mouse-service/mouse.service';
import { Subscription } from 'rxjs';
import {LanguageService} from "@app/services/language-service/language.service";

const LIMIT_LETTERS_IN_RESERVE = 7;
const LIMIT_MULTIPLE_OCCURENCES = 2;
const OFFSET_POSITION = 1;
const DRAG_CLICK_TIME = 1000;

@Component({
    selector: 'app-letter-holder',
    templateUrl: './letter-holder.component.html',
    styleUrls: ['./letter-holder.component.scss'],
})
export class LetterHolderComponent implements AfterViewInit, OnDestroy, OnInit {
    @Output() receiver = new EventEmitter();
    @Output() disabledEvent = new EventEmitter();
    @ViewChild('draggableCanvas', { static: false }) private draggableCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('letterHolder', { static: false }) private letterHolder!: ElementRef<HTMLCanvasElement>;
    switch: boolean = false;
    isDisabled: boolean = false;
    notEnoughLettersLeft: boolean = false;
    mouseIsIn: boolean = false;
    makingSelection: boolean = false;
    playerHand: string[] = [''];
    oldKeyPressed: string = '';
    counter: number = 0;
    initialPosition: number = 0;
    subscription: Subscription;
    isDragging: boolean = false;
    selectedLetter: string = '';
    intention: string = 'click';
    detectIntention: null | ReturnType<typeof setTimeout> = null;
    isPlayer: boolean = true;
    subscriptions: Subscription[] = [];

    private holderSize = { x: HOLDER_MEASUREMENTS.holderWidth, y: HOLDER_MEASUREMENTS.holderHeight };

    constructor(
        private readonly letterHolderService: LetterHolderService,
        private readonly gameStateService: GameStateService,
        private chatService: ChatService,
        private mouseService: MouseService,
        private letterAdderService: LetterAdderService,
        private manipulationRack: ManipulationRackService,
        public languageService: LanguageService,
    ) {}

    @HostListener('mousedown', ['$event'])
    mouseDown(e: MouseEvent) {
        // if (!this.mouseIsIn) return;
        // this.isReceiver();
        this.intention = 'click';
        this.detectIntention = setTimeout(() => {
            this.intention = 'drag';
            this.selectedLetter = '';
            this.isDragging = true;
            this.playerHand = this.letterHolderService.holderState;
            const tilePosition = this.mouseService.getPositionTileWithCoordinates({ x: e.offsetX, y: e.offsetY }) - 1;
            this.selectedLetter = this.playerHand[tilePosition].toUpperCase();
            if (this.selectedLetter === '') return;
            this.draggableCanvas.nativeElement.style.display = '';
            this.draggableCanvas.nativeElement.width = HOLDER_MEASUREMENTS.tileSide;
            this.draggableCanvas.nativeElement.height = HOLDER_MEASUREMENTS.tileSide;
            this.draggableCanvas.nativeElement.style.left = e.pageX - HOLDER_MEASUREMENTS.tileSide / 2 + 'px';
            this.draggableCanvas.nativeElement.style.top = e.pageY - HOLDER_MEASUREMENTS.tileSide / 2 + 'px';
            this.letterHolderService.drawDraggableLetter(this.selectedLetter, tilePosition + 1, {
                x: 0,
                y: 0,
            });
        }, DRAG_CLICK_TIME);
        return;
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(e: MouseEvent) {
        clearTimeout(Number(this.detectIntention));
        if (this.intention === 'drag') {
            // do mouseup stuff
        } else {
            this.intention = 'click';
            if (this.isDragging) {
                if (this.isDragging && this.letterAdderService.canDrop({ x: e.clientX, y: e.clientY })) {
                    this.letterAdderService.addLetters(this.selectedLetter.toLowerCase());
                }
                this.draggableCanvas.nativeElement.style.display = 'none';
                this.selectedLetter = '';
                this.letterHolderService.clearDrawableLetterContext({
                    x: 0,
                    y: 0,
                });
                this.isDragging = false;
            } else if (e.button === MouseButton.Right) {
                if (!this.mouseIsIn) return;
                this.isReceiver();
                this.manipulationRack.cancelManipulation();
                this.mouseService.selectRack({ x: e.offsetX, y: e.offsetY });
                this.makingSelection = Object.values(isSelected).some((selection) => selection === true);
            } else if (e.button === MouseButton.Left) {
                if (!this.mouseIsIn) return;
                e.stopPropagation();
                this.isReceiver();
                this.makingSelection = false;
                this.manipulationRack.cancelAll(isSelected);
                this.initialPosition = this.mouseService.manipulateRackOnClick({ x: e.offsetX, y: e.offsetY }) as number;
                this.counter = 0;
            }
        }
        return;
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(e: MouseEvent) {
        if (!this.isDragging) return;
        this.draggableCanvas.nativeElement.style.left = e.pageX - HOLDER_MEASUREMENTS.tileSide / 2 + 'px';
        this.draggableCanvas.nativeElement.style.top = e.pageY - HOLDER_MEASUREMENTS.tileSide / 2 + 'px';
        return;
    }

    @HostListener('window:keypress', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (!this.mouseIsIn) return;

        let letter = e.key.toLowerCase();
        letter = letter === '*' ? 'blank' : letter;
        this.makingSelection = false;
        if (this.playerHand.includes(letter)) {
            const occurence = this.checkOccurence(letter);
            this.initialPosition = this.playerHand.indexOf(letter) + OFFSET_POSITION;

            if (this.oldKeyPressed === letter) {
                this.counter += 1;
                this.manipulationRack.manipulateRackOnKey(this.nextIndex(this.playerHand, letter, this.counter) + OFFSET_POSITION);
                this.counter = this.counter >= occurence ? 0 : this.counter;
            } else {
                this.manipulationRack.manipulateRackOnKey(this.playerHand.indexOf(letter) + OFFSET_POSITION);
                this.counter = 0;
            }
        } else {
            this.cancelSelection();
        }

        return;
    }

    @HostListener('window:keydown', ['$event'])
    onArrowDown(e: KeyboardEvent) {
        if (!this.mouseIsIn || this.makingSelection) return;
        if (e.key === 'ArrowRight') {
            this.manipulationRack.moveLetter('right', this.initialPosition, this.playerHand);
            this.initialPosition++;
            this.initialPosition = this.initialPosition >= HOLDER_MEASUREMENTS.maxPositionHolder + OFFSET_POSITION ? 1 : this.initialPosition;
        } else if (e.key === 'ArrowLeft') {
            this.manipulationRack.moveLetter('left', this.initialPosition, this.playerHand);
            this.initialPosition--;
            this.initialPosition = this.initialPosition <= 0 ? HOLDER_MEASUREMENTS.maxPositionHolder : this.initialPosition;
        }
        return;
    }

    @HostListener('window:wheel', ['$event'])
    onWheel(e: WheelEvent) {
        e.stopPropagation();
        if (!this.mouseIsIn || this.makingSelection) return;
        if (e.deltaY > 0) {
            this.manipulationRack.moveLetter('right', this.initialPosition, this.playerHand);
            this.initialPosition++;
            this.initialPosition = this.initialPosition >= HOLDER_MEASUREMENTS.maxPositionHolder + OFFSET_POSITION ? 1 : this.initialPosition;
        } else if (e.deltaY < 0) {
            this.manipulationRack.moveLetter('left', this.initialPosition, this.playerHand);
            this.initialPosition--;
            this.initialPosition = this.initialPosition <= 0 ? HOLDER_MEASUREMENTS.maxPositionHolder : this.initialPosition;
        }
        return;
    }

    @HostListener('document:click') clickOut() {
        if (!this.mouseIsIn) return;
        this.cancelSelection();
        this.mouseIsIn = false;
    }

    ngOnInit() {
        this.disabledEvent.emit(this.isDisabled);
    }

    sendWord() {
        this.letterAdderService.makeMove();
    }

    skipTurn() {
        this.chatService.sendCommand('', 'Pass');
    }

    nextIndex(hand: string[], letter: string, nextLetter: number): number {
        let position = -1;
        while (nextLetter-- && position++ < hand.length) {
            position = hand.indexOf(letter, position);
            if (position < 0) break;
        }
        return position;
    }

    ngAfterViewInit() {
        this.letterHolderService.holderContext = this.letterHolder.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.letterHolderService.draggableLetterContext = this.draggableCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.subscriptions.push(
            this.gameStateService.getGameStateObservable().subscribe((gameState) => {
                this.updateHolder(gameState);
                (document.getElementById('letter-holder-container') as HTMLElement).style.display = '';
                (document.getElementById('playButton') as HTMLElement).style.display = '';
                (document.getElementById('skipButton') as HTMLElement).style.display = '';
            }),
        );
        this.subscriptions.push(
            this.gameStateService.getObserverGameStateObservable().subscribe(() => {
                (document.getElementById('letter-holder-container') as HTMLElement).style.display = 'none';
                (document.getElementById('playButton') as HTMLElement).style.display = 'none';
                (document.getElementById('skipButton') as HTMLElement).style.display = 'none';
            }),
        );
    }

    updateHolder(gameState: GameState) {
        this.letterHolderService.setHolderState(this.formatHandState([...gameState.hand]));
        this.isDisabled = !gameState.isYourTurn;
        this.disabledEvent.emit(this.isDisabled);
        this.playerHand = this.letterHolderService.holderState;
        this.letterAdderService.setPlayerHand(this.playerHand);
        this.letterAdderService.setCanPlay(this.isDisabled);
        this.letterHolderService.addLetters();
        if (gameState.reserveLength < LIMIT_LETTERS_IN_RESERVE) this.notEnoughLettersLeft = true;
        this.cancelSelection();
    }

    formatHandState(hand: string[]): string[] {
        const letters: string[] = [];
        this.letterHolderService.letterLog.forEach((letter: string, key: number) => {
            const lowerLetter = letter.toLowerCase();
            if (hand.includes(lowerLetter)) {
                delete hand[hand.indexOf(lowerLetter)];
                letters[key - 1] = lowerLetter;
            }
        });
        for (const letter of hand) {
            for (let i = 0; i < LIMIT_LETTERS_IN_RESERVE; i++) {
                if (!letters[i]) {
                    letters[i] = letter;
                    break;
                }
            }
        }
        while (letters.length < LIMIT_LETTERS_IN_RESERVE) letters.push('');
        return letters;
    }

    isReceiver() {
        this.switch = !this.switch;
        this.receiver.emit('letterholder' + this.switch);
        this.mouseIsIn = true;
        return false;
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    cancelSelection() {
        this.makingSelection = false;
        this.counter = 0;
        this.manipulationRack.cancelAll(isSelected);
        this.manipulationRack.cancelAll(isManipulated);
    }

    swapLetters() {
        const result = this.filterBlanckLetter(this.lettersToSwap(this.playerHand, isSelected));

        this.chatService.sendCommand(`${result.join('')}`, 'Swap');
    }

    checkOccurence(letter: string): number {
        this.oldKeyPressed = this.playerHand.reduce((a, v) => (v === letter ? a + 1 : a), 0) >= LIMIT_MULTIPLE_OCCURENCES ? letter : '';
        return this.playerHand.reduce((a, v) => (v === letter ? a + 1 : a), 0);
    }

    filterBlanckLetter(lettersToFilter: string[]): string[] {
        const lettersToSwap = lettersToFilter;
        lettersToSwap.forEach((element, index) => {
            if (element === 'blank') {
                lettersToSwap[index] = '*';
            }
        });
        return lettersToSwap;
    }

    lettersToSwap(handLetters: string[], selectedPosition: { [key: string]: boolean }): string[] {
        const lettersToSwap: string[] = [];

        this.filterPosition(selectedPosition).forEach((position) => {
            lettersToSwap.push(handLetters[position - OFFSET_POSITION]);
        });

        return lettersToSwap;
    }

    filterPosition(selectedPosition: { [key: string]: boolean }): number[] {
        return Object.keys(selectedPosition)
            .filter((position) => selectedPosition[position] === true)
            .map((x) => {
                return Number(x);
            });
    }

    get height(): number {
        return this.holderSize.y;
    }

    get width(): number {
        return this.holderSize.x;
    }
}
