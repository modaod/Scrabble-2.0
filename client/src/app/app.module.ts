import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SoloMultiPageComponent } from '@app/pages/solo-multi-page/solo-multi-page.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { ChatComponent } from './components/chat/chat.component';
import { CreateGameComponent } from './components/game-initialisation/create-game/create-game.component';
import { JoinGameComponent } from './components/game-initialisation/join-game/join-game.component';
import { NameValidatorComponent } from './components/game-initialisation/name-validator/name-validator/name-validator.component';
import { RankedWaitingRoomComponent } from './components/game-initialisation/ranked-waiting-room/ranked-waiting-room.component';
// import { RankedWaitingRoomComponent } from './components/game-initialisation/ranked-waiting-room/ranked-waiting-room.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { WaitingRoomComponent } from './components/game-initialisation/waiting-room/waiting-room.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LetterHolderComponent } from './components/letter-holder/letter-holder.component';
import { MultiChatComponent } from './components/multi-chat/multi-chat.component';
import { PrivateMessagesComponent } from './components/private-messages/private-messages.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RoomComponent } from './components/room/room.component';
import { TimerComponent } from './components/timer/timer.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { EndGamePageComponent } from './pages/end-game-page/end-game-page.component';
import { FriendPageComponent } from './pages/friend-page/friend-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { ChatService } from './services/chat-service/chat.service';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { RoomPasswordComponent } from './components/room-password/room-password.component';
import { WordFinderComponent } from './components/word-finder/word-finder.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        InfoPanelComponent,
        SoloMultiPageComponent,
        NameValidatorComponent,
        CreateGameComponent,
        JoinGameComponent,
        WaitingRoomComponent,
        ChatComponent,
        LetterHolderComponent,
        TimerComponent,
        LeaderboardComponent,
        MultiChatComponent,
        RoomComponent,
        AuthPageComponent,
        RegisterPageComponent,
        ProfileComponent,
        AvatarComponent,
        ProfileSettingsComponent,
        FriendPageComponent,
        EndGamePageComponent,
        RankedWaitingRoomComponent,
        PrivateMessagesComponent,
        ChatPageComponent,
        RoomPasswordComponent,
        WordFinderComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatInputModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatBadgeModule,
        MatGridListModule,
        MatIconModule,
    ],
    providers: [ChatService],
    bootstrap: [AppComponent],
})
export class AppModule {}
