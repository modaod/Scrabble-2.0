import { Component } from '@angular/core';
import { NameValidatorService } from '@app/services/name-validator-service/name-validator.service';
import { LanguageService } from '@app/services/language-service/language.service';

@Component({
    selector: 'app-name-validator',
    templateUrl: './name-validator.component.html',
    styleUrls: ['./name-validator.component.scss'],
})
export class NameValidatorComponent {
    playerName = '';
    constructor(public nameValidatorService: NameValidatorService, public languageService: LanguageService) {}
}
