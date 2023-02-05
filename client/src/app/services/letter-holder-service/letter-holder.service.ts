import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { HOLDER_MEASUREMENTS, LETTER_POINTS, TILE_COLOURS } from '@app/constants/letters-constants';
import { FontSizeService } from '@app/services/font-size-service/font-size.service';

@Injectable({
    providedIn: 'root',
})
export class LetterHolderService {
    holderContext: CanvasRenderingContext2D;
    draggableLetterContext: CanvasRenderingContext2D;
    letterLog = new Map<number, string>();
    holderState: string[] = [];
    private holderSize = { x: HOLDER_MEASUREMENTS.holderWidth, y: HOLDER_MEASUREMENTS.holderHeight };

    constructor(private size: FontSizeService) {}

    drawLetter(letter: string, position: number) {
        const checkedLetter = this.validParams(letter, position);
        if (checkedLetter) {
            this.holderContext.beginPath();
            const letterPoint = LETTER_POINTS[checkedLetter as keyof typeof LETTER_POINTS];
            const pixelPosition = (position - 1) * (HOLDER_MEASUREMENTS.tileSide + HOLDER_MEASUREMENTS.spaceBetween);
            this.holderContext.font = `800 ${this.size.getFontSize().get('tileLetterSize')}px Courier`;
            this.holderContext.textBaseline = 'bottom';
            this.holderContext.textAlign = 'center';
            this.holderContext.fillStyle = TILE_COLOURS.backgroundColour;
            this.holderContext.fillRect(pixelPosition, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
            this.holderContext.fillStyle = TILE_COLOURS.textColour;
            if (letterPoint)
                this.holderContext.fillText(
                    checkedLetter,
                    pixelPosition + HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.letterOffsetH,
                    HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.letterOffsetV,
                );

            this.holderContext.textBaseline = 'top';
            this.holderContext.font = `800 ${this.size.getFontSize().get('tilePointSize')}px Courier`;
            if (letterPoint)
                this.holderContext.fillText(
                    `${letterPoint}`,
                    pixelPosition + HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.pointOffsetH,
                    HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.pointOffsetV,
                );

            this.holderContext.strokeStyle = 'black';
            this.holderContext.stroke();

            this.letterLog.set(position, checkedLetter);
        } else {
            const pixelPosition = (position - 1) * (HOLDER_MEASUREMENTS.tileSide + HOLDER_MEASUREMENTS.spaceBetween);
            this.holderContext.clearRect(pixelPosition, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
            this.letterLog.delete(position);
        }
    }

    drawDraggableLetter(letter: string, position: number, coordinate: Vec2) {
        const checkedLetter = this.validParams(letter, position);
        if (checkedLetter) {
            this.draggableLetterContext.clearRect(0, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
            this.draggableLetterContext.beginPath();
            const letterPoint = LETTER_POINTS[checkedLetter as keyof typeof LETTER_POINTS];
            this.draggableLetterContext.font = `800 ${this.size.getFontSize().get('tileLetterSize')}px Courier`;
            this.draggableLetterContext.textBaseline = 'bottom';
            this.draggableLetterContext.textAlign = 'center';
            this.draggableLetterContext.fillStyle = TILE_COLOURS.backgroundColour;
            this.draggableLetterContext.fillRect(coordinate.x, coordinate.y, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
            this.draggableLetterContext.fillStyle = TILE_COLOURS.textColour;
            if (letterPoint)
                this.draggableLetterContext.fillText(
                    letter,
                    coordinate.x + HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.letterOffsetH,
                    HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.letterOffsetV,
                );

            this.draggableLetterContext.textBaseline = 'top';
            this.draggableLetterContext.font = `800 ${this.size.getFontSize().get('tilePointSize')}px Courier`;
            if (letterPoint)
                this.draggableLetterContext.fillText(
                    `${letterPoint}`,
                    coordinate.x + HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.pointOffsetH,
                    HOLDER_MEASUREMENTS.tileSide / HOLDER_MEASUREMENTS.pointOffsetV,
                );

            this.draggableLetterContext.strokeStyle = 'black';
            this.draggableLetterContext.stroke();
        }
    }

    clearDrawableLetterContext(coordinate: Vec2) {
        this.draggableLetterContext.clearRect(coordinate.x, coordinate.y, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
    }

    validParams(letter: string, position: number): string {
        if (HOLDER_MEASUREMENTS.minPositionHolder <= position && HOLDER_MEASUREMENTS.maxPositionHolder >= position) {
            if (letter >= 'A' && letter <= 'Z') return letter;
            else if (letter === 'blank') return 'BLANK';
            else if (letter >= 'a' && letter <= 'z') return letter.toUpperCase();
            else return '';
        } else return '';
    }

    setHolderState(holder: string[]) {
        this.holderState = holder;
    }

    addLetters() {
        // draws letters from the holder state directly
        this.holderContext.clearRect(0, 0, HOLDER_MEASUREMENTS.holderWidth, HOLDER_MEASUREMENTS.holderHeight);
        for (let pos = 0; pos < this.holderState.length; pos++) {
            if (this.holderState[pos]) this.drawLetter(this.holderState[pos], pos + 1);
        }
    }

    redrawTiles() {
        // draws letters from letterlog (temporarily for 3s)
        Array.from(this.letterLog.keys()).forEach((key) => {
            const letter = this.letterLog.get(key);
            this.drawLetter(letter as string, key);
        });
    }

    drawTypedLetters(letters: string[]) {
        const previousState = this.holderState;
        this.holderContext.clearRect(0, 0, HOLDER_MEASUREMENTS.holderWidth, HOLDER_MEASUREMENTS.holderHeight);
        this.holderState = letters;
        this.addLetters();
        this.holderState = previousState;
    }

    redrawLetter(position: number) {
        const letter = this.letterLog.get(position);
        if (letter) this.drawLetter(letter, position);
    }

    drawSelection(position: number) {
        const pixelPosition = (position - 1) * (HOLDER_MEASUREMENTS.tileSide + HOLDER_MEASUREMENTS.spaceBetween);
        this.holderContext.beginPath();
        this.holderContext.lineWidth = 1;
        this.holderContext.fillStyle = TILE_COLOURS.selectionColour;
        this.holderContext.fillRect(pixelPosition, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
        this.holderContext.stroke();
    }

    drawManipulation(position: number) {
        const pixelPosition = (position - 1) * (HOLDER_MEASUREMENTS.tileSide + HOLDER_MEASUREMENTS.spaceBetween);
        this.holderContext.beginPath();
        this.holderContext.lineWidth = 1;
        this.holderContext.fillStyle = TILE_COLOURS.manipulationColor;
        this.holderContext.fillRect(pixelPosition, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
        this.holderContext.stroke();
    }

    removeSelection(position: number) {
        const pixelPosition = (position - 1) * (HOLDER_MEASUREMENTS.tileSide + HOLDER_MEASUREMENTS.spaceBetween);
        this.holderContext.clearRect(pixelPosition, 0, HOLDER_MEASUREMENTS.tileSide, HOLDER_MEASUREMENTS.tileSide);
        this.redrawLetter(position);
    }

    changePosition(oldPosition: number, newPosition: number) {
        const lettersPosition = this.letterLog;
        const letterToMove = lettersPosition.get(oldPosition);
        const letterToChange = lettersPosition.get(newPosition);
        lettersPosition.delete(oldPosition);
        lettersPosition.delete(newPosition);

        if (letterToMove && letterToChange) {
            lettersPosition.set(newPosition, letterToMove);
            lettersPosition.set(oldPosition, letterToChange);
            const newLettersMap = new Map([...lettersPosition.entries()].sort(([key1], [key2]) => key1 - key2));
            this.letterLog = newLettersMap;

            this.redrawTiles();
            this.drawManipulation(newPosition);
        }
    }

    canDrop(coords: Vec2): boolean {
        const box = (document.getElementById('letter-holder-container') as HTMLElement).getBoundingClientRect();
        const top = box.top;
        const left = box.left;
        const transformedCoordsToOffset: Vec2 = { x: coords.x - left, y: coords.y - top };
        if (
            transformedCoordsToOffset.x >= 0 &&
            transformedCoordsToOffset.x <= HOLDER_MEASUREMENTS.holderWidth &&
            transformedCoordsToOffset.y >= 0 &&
            transformedCoordsToOffset.y <= HOLDER_MEASUREMENTS.holderHeight
        )
            return true;
        return false;
    }

    get width(): number {
        return this.holderSize.x;
    }

    get height(): number {
        return this.holderSize.y;
    }
}
