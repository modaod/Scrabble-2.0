import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { COLOUR_COORDINATES, COLUMNS, GRID_COLOURS, GRID_CONSTANTS, GRID_OFFSETS, GRID_WORDS, ROWS } from '@app/constants/grid-constants';
import { HOLDER_MEASUREMENTS, LETTER_POINTS } from '@app/constants/letters-constants';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';

const isCoordinateOf = (colourCoords: number[][], coord: number[]): boolean => {
    for (const square of colourCoords) {
        let isCoord = false;
        for (let rowOrColumn = 0; rowOrColumn < square.length; rowOrColumn++) {
            if (square[rowOrColumn] === coord[rowOrColumn]) {
                isCoord = true;
            } else {
                isCoord = false;
                break;
            }
        }
        if (isCoord) {
            return true;
        }
    }
    return false;
};

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    draggableLetterContext: CanvasRenderingContext2D;
    horizontalArrow = '→';
    verticalArrow = '↓';
    private boardState: string[][] = [];
    private canvasSize: Vec2 = { x: GRID_CONSTANTS.defaultWidth, y: GRID_CONSTANTS.defaultHeight };

    constructor(private size: FontSizeService) {}

    drawIdentificators() {
        this.gridContext.beginPath();
        this.gridContext.font = 'bold 27px Courier';
        this.gridContext.textAlign = 'center';
        this.gridContext.textBaseline = 'top';
        this.gridContext.fillStyle = GRID_COLOURS.defaultDarkRed;

        for (let x = GRID_CONSTANTS.defaultSide, i = 0; x < GRID_CONSTANTS.defaultHeight; x += GRID_CONSTANTS.defaultSide, i++) {
            const columnNumbers: string[] = Object.keys(COLUMNS);
            const rowLetters: string[] = Object.keys(ROWS);
            this.gridContext.fillText(columnNumbers[i], x + GRID_CONSTANTS.defaultSide / 2, GRID_CONSTANTS.defaultSide / 3);
            this.gridContext.fillText(rowLetters[i], GRID_CONSTANTS.defaultSide / 2, x + GRID_CONSTANTS.defaultSide / 3);
        }

        this.gridContext.strokeStyle = 'black';
        this.gridContext.stroke();
    }

    isStartSquare(column: number, row: number): boolean {
        return column === COLUMNS[8] && row === ROWS.H;
    }

    drawSquare(column: number, row: number, colour: string, word: string, points: string) {
        this.gridContext.fillStyle = colour;
        this.gridContext.fillRect(column, row, GRID_CONSTANTS.defaultSide, GRID_CONSTANTS.defaultSide);
        this.gridContext.fillStyle = GRID_COLOURS.defaultBlack;
        if (this.isStartSquare(column, row))
            this.gridContext.fillText(
                GRID_WORDS.startWord,
                column + GRID_CONSTANTS.defaultSide / 2,
                row + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.wordOffset,
            );
        else {
            this.gridContext.fillText(word, column + GRID_CONSTANTS.defaultSide / 2, row + GRID_CONSTANTS.defaultSide / 2);
            this.gridContext.fillText(
                points,
                column + GRID_CONSTANTS.defaultSide / 2,
                row + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.multiplicatorOffset,
            );
        }
    }

    drawSquares() {
        this.gridContext.beginPath();
        this.gridContext.lineWidth = GRID_CONSTANTS.defaultLineWidth;
        this.gridContext.font = `800 ${GRID_WORDS.defaultFontSize}px Arial`;
        this.gridContext.textBaseline = 'bottom';
        for (let x = GRID_CONSTANTS.defaultSide; x <= GRID_CONSTANTS.rowColumnCount * GRID_CONSTANTS.defaultSide; x += GRID_CONSTANTS.defaultSide) {
            for (
                let y = GRID_CONSTANTS.defaultSide;
                y <= GRID_CONSTANTS.rowColumnCount * GRID_CONSTANTS.defaultSide;
                y += GRID_CONSTANTS.defaultSide
            ) {
                if (isCoordinateOf(COLOUR_COORDINATES.lightBlueCoordinates, [x, y])) {
                    this.drawSquare(x, y, GRID_COLOURS.defaultLightBlue, GRID_WORDS.blueWord, GRID_WORDS.doubleWord);
                } else if (isCoordinateOf(COLOUR_COORDINATES.blueCoordinates, [x, y])) {
                    this.drawSquare(x, y, GRID_COLOURS.defaultBlue, GRID_WORDS.blueWord, GRID_WORDS.tripleWord);
                } else if (isCoordinateOf(COLOUR_COORDINATES.pinkCoordinates, [x, y])) {
                    this.drawSquare(x, y, GRID_COLOURS.defaultPink, GRID_WORDS.pinkRedWord, GRID_WORDS.doubleWord);
                } else if (isCoordinateOf(COLOUR_COORDINATES.redCoordinates, [x, y])) {
                    this.drawSquare(x, y, GRID_COLOURS.defaultRed, GRID_WORDS.pinkRedWord, GRID_WORDS.tripleWord);
                } else {
                    this.gridContext.fillStyle = GRID_COLOURS.defaultWhite;
                    this.gridContext.fillRect(x, y, GRID_CONSTANTS.defaultSide, GRID_CONSTANTS.defaultSide);
                }
            }
        }
    }

    drawGridLines() {
        this.gridContext.beginPath();
        for (let x = GRID_CONSTANTS.defaultSide; x <= GRID_CONSTANTS.defaultWidth; x += GRID_CONSTANTS.defaultSide) {
            this.gridContext.moveTo(x, GRID_CONSTANTS.defaultSide);
            this.gridContext.lineTo(x, GRID_CONSTANTS.defaultHeight);
            this.gridContext.moveTo(GRID_CONSTANTS.defaultSide, x);
            this.gridContext.lineTo(GRID_CONSTANTS.defaultWidth, x);
        }

        this.gridContext.strokeStyle = 'black';
        this.gridContext.stroke();
    }

    drawLetter(column: number, row: string, letter: string) {
        if (this.checkParamsValidity(column, row, letter)) {
            const fullLetter = this.validLetter(letter);
            const blankHandledLetter = this.manageBlank(fullLetter);
            const checkedRow: string = this.validRowColumn(column, row);
            const letterPoint: number = LETTER_POINTS[blankHandledLetter.points as keyof typeof LETTER_POINTS];
            this.gridContext.beginPath();

            this.gridContext.font = `bold ${this.size.getFontSize().get('gridLettersSize')}px Courier`;
            this.gridContext.textBaseline = 'bottom';
            this.gridContext.textAlign = 'center';
            this.gridContext.fillStyle = GRID_COLOURS.defaultBackground;
            this.gridContext.fillRect(COLUMNS[column], ROWS[checkedRow], GRID_CONSTANTS.defaultSide - 1, GRID_CONSTANTS.defaultSide - 1);

            this.gridContext.fillStyle = GRID_COLOURS.defaultBlack;
            this.gridContext.fillText(
                blankHandledLetter.letter,
                COLUMNS[column] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.letterOffsetH,
                ROWS[checkedRow] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.letterOffsetV,
            );

            this.gridContext.textBaseline = 'top';
            this.gridContext.font = `bold ${this.size.getFontSize().get('gridPointSize')}px Courier`;

            this.gridContext.fillText(
                `${letterPoint}`,
                COLUMNS[column] + HOLDER_MEASUREMENTS.tileSide / GRID_OFFSETS.pointOffsetH,
                ROWS[checkedRow] + HOLDER_MEASUREMENTS.tileSide / GRID_OFFSETS.pointOffsetV,
            );

            this.gridContext.strokeStyle = 'black';
            this.gridContext.stroke();
        }
    }

    drawFirstLetter(column: number, row: string) {
        this.gridContext.beginPath();
        this.gridContext.lineWidth = 3;
        this.gridContext.fillStyle = 'orange';
        this.gridContext.lineJoin = 'round';
        this.gridContext.fillRect(COLUMNS[column] - 1, ROWS[row] - 1, GRID_CONSTANTS.defaultSide + 2, GRID_CONSTANTS.defaultSide + 2);
    }

    drawDraggableLetter(column: number, row: string, letter: string) {
        if (this.checkParamsValidity(column, row, letter)) {
            const fullLetter = this.validLetter(letter);
            const blankHandledLetter = this.manageBlank(fullLetter);
            const letterPoint: number = LETTER_POINTS[blankHandledLetter.points as keyof typeof LETTER_POINTS];
            this.draggableLetterContext.beginPath();

            this.draggableLetterContext.font = `bold ${this.size.getFontSize().get('gridLettersSize')}px Courier`;
            this.draggableLetterContext.textBaseline = 'bottom';
            this.draggableLetterContext.textAlign = 'center';
            this.draggableLetterContext.fillStyle = GRID_COLOURS.defaultBackground;
            this.draggableLetterContext.fillRect(0, 0, GRID_CONSTANTS.defaultSide - 1, GRID_CONSTANTS.defaultSide - 1);

            this.draggableLetterContext.fillStyle = GRID_COLOURS.defaultBlack;
            this.draggableLetterContext.fillText(
                blankHandledLetter.letter,
                GRID_CONSTANTS.defaultSide / GRID_OFFSETS.letterOffsetH,
                GRID_CONSTANTS.defaultSide / GRID_OFFSETS.letterOffsetV,
            );

            this.draggableLetterContext.textBaseline = 'top';
            this.draggableLetterContext.font = `bold ${this.size.getFontSize().get('gridPointSize')}px Courier`;

            this.draggableLetterContext.fillText(
                `${letterPoint}`,
                HOLDER_MEASUREMENTS.tileSide / GRID_OFFSETS.pointOffsetH,
                HOLDER_MEASUREMENTS.tileSide / GRID_OFFSETS.pointOffsetV,
            );

            this.gridContext.strokeStyle = 'black';
            this.gridContext.stroke();
        }
    }

    clearDraggableCanvas() {
        this.draggableLetterContext.clearRect(0, 0, GRID_CONSTANTS.defaultSide - 1, GRID_CONSTANTS.defaultSide - 1);
    }

    deleteAndRedraw(addedLettersLog?: Map<string, string>) {
        this.gridContext.clearRect(GRID_CONSTANTS.defaultSide, GRID_CONSTANTS.defaultSide, GRID_CONSTANTS.defaultWidth, GRID_CONSTANTS.defaultHeight);
        this.drawSquares();
        this.drawGridLines();
        for (let row = 0; row < this.boardState.length; row++) {
            for (let col = 0; col < this.boardState[row].length; col++) {
                if (this.boardState[row][col]) {
                    this.drawLetter(col + 1, String.fromCharCode(row + 'A'.charCodeAt(0)), this.boardState[row][col]);
                }
            }
        }
        if (addedLettersLog) {
            Array.from(addedLettersLog.keys()).forEach((key) => {
                const column = parseInt(key.slice(1), 10);
                const row = key.charAt(0);
                const letter = addedLettersLog.get(key);
                this.drawLetter(column, row, letter as string);
                this.gridContext.strokeStyle = 'orange';
                this.gridContext.lineWidth = 3;
                this.gridContext.strokeRect(COLUMNS[column], ROWS[row], GRID_CONSTANTS.defaultSide, GRID_CONSTANTS.defaultSide);
            });
        }
    }

    validLetter(letter: string): string {
        if (letter >= 'A' && letter <= 'Z') return letter;
        else if (letter.substring(0, letter.length - 1) === 'blank') return letter.toUpperCase();
        else if (letter >= 'a' && letter <= 'z') return letter.toUpperCase();
        else return '';
    }

    validRowColumn(column: number, row: string): string {
        const validColumn = 1 <= column && GRID_CONSTANTS.rowColumnCount >= column;
        if (validColumn && row >= 'A' && row <= 'O') return row;
        else if (validColumn && row >= 'a' && row <= 'o') return row.toUpperCase();
        else return '';
    }

    checkParamsValidity(column: number, row: string, letter: string): boolean {
        return Boolean(this.validLetter(letter)) && Boolean(this.validRowColumn(column, row));
    }

    manageBlank(letter: string): { [key: string]: string } {
        if (this.validLetter(letter).length > 1) {
            return { points: letter.substring(0, letter.length - 1), letter: letter.substring(letter.length - 1, letter.length) };
        }
        return { points: letter, letter };
    }

    highlightCoords(column: number, row: string) {
        this.gridContext.fillStyle = 'orange';
        this.gridContext.lineJoin = 'round';
        this.gridContext.fillRect(COLUMNS[column] - 2, ROWS[row] - 2, GRID_CONSTANTS.defaultSide + 4, GRID_CONSTANTS.defaultSide + 4);
    }

    addArrow(column: number, row: string, direction: boolean) {
        this.gridContext.fillStyle = 'black';
        this.gridContext.font = '45px Courier';
        this.gridContext.textBaseline = 'bottom';
        const arrowDirection = direction ? this.horizontalArrow : this.verticalArrow;
        this.gridContext.fillText(
            arrowDirection,
            COLUMNS[column] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowH,
            ROWS[row] + GRID_CONSTANTS.defaultSide / GRID_OFFSETS.arrowV,
        );
    }

    setBoardState(board: string[][]) {
        this.boardState = board;
        this.deleteAndRedraw();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
