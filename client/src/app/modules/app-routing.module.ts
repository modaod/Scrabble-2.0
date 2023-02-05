import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGameComponent } from '@app/components/game-initialisation/create-game/create-game.component';
import { JoinGameComponent } from '@app/components/game-initialisation/join-game/join-game.component';
import { WaitingRoomComponent } from '@app/components/game-initialisation/waiting-room/waiting-room.component';
import { ProfileComponent } from '@app/components/profile/profile.component';
import { AuthPageComponent } from '@app/pages/auth-page/auth-page.component';
import { EndGamePageComponent } from '@app/pages/end-game-page/end-game-page.component';
import { FriendPageComponent } from '@app/pages/friend-page/friend-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { RegisterPageComponent } from '@app/pages/register-page/register-page.component';
import { SoloMultiPageComponent } from '@app/pages/solo-multi-page/solo-multi-page.component';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';
import { RankedWaitingRoomComponent } from '@app/components/game-initialisation/ranked-waiting-room/ranked-waiting-room.component';
import { WordFinderComponent } from '@app/components/word-finder/word-finder.component';

const routes: Routes = [
    { path: '', redirectTo: '/auth', pathMatch: 'full' },
    { path: 'auth', component: AuthPageComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'word-finder', component: WordFinderComponent },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'solo-multi', component: SoloMultiPageComponent },
    { path: 'create-game', component: CreateGameComponent },
    { path: 'join-game', component: JoinGameComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'ranked-waiting-room', component: RankedWaitingRoomComponent },
    { path: 'register', component: RegisterPageComponent },
    { path: 'friend', component: FriendPageComponent },
    { path: 'end-game', component: EndGamePageComponent },
    { path: 'chat', component: ChatPageComponent },
    { path: '**', redirectTo: '/auth' },
    { path: '**', redirectTo: '/auth' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
