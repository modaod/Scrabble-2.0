import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { LayoutComponent } from './components/layout/layout.component';
import {SessionRoutingModule} from "./session-routing.module";
import {CoreModule} from "../core/core.module";


@NgModule({
  declarations: [
    ChatComponent,
    LayoutComponent
  ],
    imports: [
        CommonModule,
        CoreModule,
        SessionRoutingModule
    ]
})
export class SessionModule { }
