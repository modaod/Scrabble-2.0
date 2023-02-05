import {
    BETWEEN_THIRTEEN_TO_EIGHTEEN_PROBABILITY,
    ErrorType,
    HIGH_RANGE,
    LESS_THAN_SIX_PROBABILITY,
    LOW_RANGE,
    MAX_HAND,
    MEDIUM_RANGE,
    MIN_PLAY_TIME,
    VALUE_FOR_PASS,
    VALUE_FOR_SWAP,
} from '@app/constants/basic-constants';
import { CommandTypes } from '@app/controllers/command.controller';
import { PossibleWords } from '@app/services/possible-word-finder.service';
import { CommandDetails, VirtualPlayer } from './virtual-player';

export class VirtualPlayerEasy extends VirtualPlayer {
    play(): CommandDetails {
        this.playing = true;
        return this.playAction(this.getAction());
    }
    protected getValidWord(possibleWord: PossibleWords[]): PossibleWords {
        return this.getValidWordFromRange(possibleWord, this.getRange());
    }
    protected getNumberToSwap() {
        return Math.floor(Math.random() * MAX_HAND) + 1;
    }

    private getValidWordFromRange(possibleWord: PossibleWords[], range: number[]) {
        possibleWord.sort((firsWord, secondWord) => firsWord.value - secondWord.value);
        const validWord = possibleWord.find((word) => word.value >= range[0] && word.value <= range[1]);
        return validWord || this.getTheClosest(possibleWord, range);
    }

    private getRange(): number[] {
        return this.getRangeFromRandom(Math.random());
    }

    private playAction(action: CommandTypes): CommandDetails {
        const minTime: number = Date.now() + MIN_PLAY_TIME;
        let details: CommandDetails = { command: '', result: { errorType: ErrorType.IllegalCommand } };
        switch (action) {
            case CommandTypes.Place:
                details = this.place();
                if (details.result.errorType !== undefined) details = this.pass();
                if (details.command.split(' ')[0] === '!placer')
                    details.result.otherPlayerMessage = `a placé ${details.command.split(' ')[2]} pour ${
                        details.result.otherPlayerMessage
                    } point(s).`;
                break;
            case CommandTypes.Swap:
                details = this.swap();
                if (details.result.errorType !== undefined) details = this.pass();
                break;
            case CommandTypes.Pass:
                details = this.pass();
                break;
        }
        if (details.result === undefined || details.result.otherPlayerMessage === undefined) details = this.pass();
        while (Date.now() < minTime);
        return details;
    }
    private getRangeFromRandom(range: number): number[] {
        if (range <= LESS_THAN_SIX_PROBABILITY) {
            return LOW_RANGE;
        } else if (range >= BETWEEN_THIRTEEN_TO_EIGHTEEN_PROBABILITY) {
            return HIGH_RANGE;
        } else return MEDIUM_RANGE;
    }

    private getTheClosest(possibleWord: PossibleWords[], range: number[]): PossibleWords {
        possibleWord.sort((firsWord, secondWord) => this.order(firsWord, range) - this.order(secondWord, range));
        return possibleWord[0];
    }
    private order(possibleWord: PossibleWords, range: number[]): number {
        if (possibleWord.value < range[0]) {
            return range[0] - possibleWord.value;
        }
        return possibleWord.value - range[1];
    }
    private getActionFromRandom(choice: number): CommandTypes {
        if (choice <= VALUE_FOR_SWAP) {
            return CommandTypes.Swap;
        } else if (choice >= VALUE_FOR_PASS) {
            return CommandTypes.Pass;
        }
        return CommandTypes.Place;
    }
    private getAction(): CommandTypes {
        return this.getActionFromRandom(Math.random());
    }
}
