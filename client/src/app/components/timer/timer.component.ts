import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { GameState, GameStateService, ObserverGameState } from '@app/services/game-state-service/game-state.service';
import { TimerService } from '@app/services/timer-service/timer.service';
import { Subscription } from 'rxjs';
import {LanguageService} from "@app/services/language-service/language.service";

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    constructor(private timerService: TimerService, private readonly gameStateService: GameStateService, public languageService: LanguageService) {}

    ngOnInit(): void {
        this.timerService.setTimerStopped(false);
        this.timerService.resetTimer();
        this.subscriptions.push(this.gameStateService.getGameStateObservable().subscribe((gameState) => this.updateTime(gameState)));
        this.subscriptions.push(this.gameStateService.getObserverGameStateObservable().subscribe((gameState) => this.updateTime(gameState)));
    }

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    getTimer(): Timer {
        return this.timerService.getTimer();
    }

    updateTime(gameState: GameState | ObserverGameState) {
        if (gameState.gameOver) {
            this.timerService.setTimerStopped(true);
        } else {
            this.timerService.resetTimer();
        }
    }
}
