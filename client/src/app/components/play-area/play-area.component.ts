import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GridPosition, Vec2 } from '@app/classes/vec2';
import { GRID_CONSTANTS } from '@app/constants/grid-constants';
import { MouseButton } from '@app/constants/mouse-buttons';
import { GameState, GameStateService, ObserverGameState } from '@app/services/game-state-service/game-state.service';
import { GridService } from '@app/services/grid-service/grid.service';
import { LetterAdderService } from '@app/services/letter-adder-service/letter-adder.service';
import { LetterHolderService } from '@app/services/letter-holder-service/letter-holder.service';
import { Subscription } from 'rxjs';

const SHOW_WRONG_LETTERS_DELAY = 3000;
const DRAG_CLICK_TIME = 1000;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
    @Input() receiver: string;
    @ViewChild('draggableCanvasGrid', { static: false }) private draggableCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    buttonPressed = '';
    subscriptions: Subscription[] = [];
    mouseIsIn: boolean = false;
    mousePosition: Vec2 = { x: 0, y: 0 };
    addedLettersLog = new Map<string, string>();
    isDragging: boolean = false;
    selectedLetter: string = '';
    intention: string = 'click';
    detectIntention: null | ReturnType<typeof setTimeout> = null;
    private canvasSize = { x: GRID_CONSTANTS.defaultWidth, y: GRID_CONSTANTS.defaultHeight };

    constructor(
        private readonly gridService: GridService,
        private readonly gameStateService: GameStateService,
        private readonly letterAdderService: LetterAdderService,
        private readonly letterHolderService: LetterHolderService,
    ) {}

    @HostListener('mousedown', ['$event'])
    mouseDown(e: MouseEvent) {
        // if (!this.mouseIsIn) return;
        // this.isReceiver();
        this.intention = 'click';
        this.detectIntention = setTimeout(() => {
            this.addedLettersLog = this.letterAdderService.addedLettersLog;
            const gridCoords = this.letterAdderService.findCoords(e.offsetX, e.offsetY);
            const keys = Array.from(this.addedLettersLog.keys());
            keys.forEach((key) => {
                const value = this.addedLettersLog.get(key);
                if (key.charAt(0) === gridCoords.row && key.charAt(1) === gridCoords.column.toString() && value) {
                    this.selectedLetter = value.toUpperCase();
                }
            });
            const lastLetter = this.addedLettersLog
                .get(keys[keys.length - 1])
                ?.toString()
                .toUpperCase();
            if (this.selectedLetter !== lastLetter) return;
            this.draggableCanvas.nativeElement.style.display = '';
            this.intention = 'drag';
            this.isDragging = true;
            this.draggableCanvas.nativeElement.width = GRID_CONSTANTS.defaultSide - 1;
            this.draggableCanvas.nativeElement.height = GRID_CONSTANTS.defaultSide - 1;
            this.draggableCanvas.nativeElement.style.left = e.pageX - (GRID_CONSTANTS.defaultSide - 1) / 2 + 'px';
            this.draggableCanvas.nativeElement.style.top = e.pageY - (GRID_CONSTANTS.defaultSide - 1) / 2 + 'px';
            this.gridService.drawDraggableLetter(gridCoords.column, gridCoords.row, this.selectedLetter);
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
                if (this.isDragging && this.letterHolderService.canDrop({ x: e.clientX, y: e.clientY })) {
                    this.letterAdderService.removeLetters();
                }
                this.draggableCanvas.nativeElement.style.display = 'none';
                this.selectedLetter = '';
                this.gridService.clearDraggableCanvas();
                this.isDragging = false;
            }
        }
        return;
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(e: MouseEvent) {
        if (!this.isDragging) return;
        this.draggableCanvas.nativeElement.style.left = e.pageX - (GRID_CONSTANTS.defaultSide - 1) / 2 + 'px';
        this.draggableCanvas.nativeElement.style.top = e.pageY - (GRID_CONSTANTS.defaultSide - 1) / 2 + 'px';
        return;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        this.letterAdderService.onPressDown(this.buttonPressed);
    }

    ngOnInit(): void {
        this.letterAdderService.resetMappedBoard();
        this.gameStateService.getObserverGameState();
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.draggableLetterContext = this.draggableCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawIdentificators();
        this.gridService.drawSquares();
        this.gridService.drawGridLines();
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe(async (gameState) => this.updateBoardState(gameState)));
        this.subscriptions.push(
            this.gameStateService.getObserverGameStateObservable().subscribe(async (gameState) => this.updateBoardState(gameState)),
        );
        this.subscriptions.push(this.gameStateService.getFirstLetterPlacedObservable().subscribe(async (position) => this.drawFirstLetter(position)));
        this.gameStateService.getObserverGameState();
    }

    ngOnChanges() {
        if (this.receiver !== 'playarea') this.letterAdderService.removeAll();
    }

    setReceiver(receiver: string) {
        this.receiver = receiver;
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.setReceiver('playarea');
            const coordinateClick: Vec2 = { x: event.offsetX, y: event.offsetY };
            this.letterAdderService.onLeftClick(coordinateClick);
            this.mouseIsIn = true;
        }
    }

    private async updateBoardState(gameState: GameState | ObserverGameState) {
        if (!gameState.boardWithInvalidWords) {
            this.gridService.setBoardState(gameState.board);
            this.letterAdderService.setBoardState(gameState.board);
            this.letterAdderService.removeAll();
        } else {
            this.gridService.setBoardState(gameState.boardWithInvalidWords);
            await this.delay(SHOW_WRONG_LETTERS_DELAY);
            this.gridService.setBoardState(gameState.board);
        }
    }

    private async drawFirstLetter(position: GridPosition) {
        this.gridService.deleteAndRedraw();
        this.gridService.drawFirstLetter(position.column, position.row);
    }
}
