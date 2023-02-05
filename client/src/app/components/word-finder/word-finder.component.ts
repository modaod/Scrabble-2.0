import { Component, OnInit } from '@angular/core';
import { Dictionary } from '@app/classes/dictionary';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import {LanguageService} from "@app/services/language-service/language.service";

@Component({
    selector: 'app-word-finder',
    templateUrl: './word-finder.component.html',
    styleUrls: ['./word-finder.component.scss']
})
export class WordFinderComponent implements OnInit {
    isEmpty: boolean = true;
    isValidWord: boolean = false;
    wordEntered: string = '';

    constructor(private readonly communicationService: CommunicationService, public languageService: LanguageService) { }

    ngOnInit(): void {}

    cleanInterface() {
        this.isEmpty = true;
        (document.getElementById('word-input') as HTMLInputElement).value = '';
    }

    verifyWord(word: string) {
        this.communicationService.getDictionary('Mon dictionnaire')?.subscribe((dict: Dictionary) => {
            if (dict.words) {
              this.isValidWord = dict.words?.includes(word);
              this.isEmpty = false;
              this.wordEntered = word.toUpperCase();
            }
        });
    }
}
