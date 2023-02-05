import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { SocketManagerService } from '@app/services/socket-manager-service/socket-manager.service';
import { Observable, Observer } from 'rxjs';

export const LIMIT_OF_CHARACTERS = 512;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private socket;

    messageHelp: Message = {
        username: '[SERVER]',
        body:
            'Voici les commandes possibles:\n!placer - Ajouter une ou plusieurs lettres sur la grille selon le format <ligne><colonne>[h|v] <' +
            'lettres>. (ex. !placer g9h adant)\n!passer - Passer votre tour.\n!échanger - Échanger un certain nombre de lettres. (ex. !échanger mwb)',
        color: '',
    };

    messageInvalidCommand: Message = {
        username: '[SERVER]',
        body: 'Entrée invalide.',
        color: '',
    };

    messageInvalidArgument: Message = {
        username: '[SERVER]',
        body: 'Erreur de syntaxe.',
        color: '',
    };

    constructor(private socketManagerService: SocketManagerService) {
        this.socket = this.socketManagerService.getSocket();
    }

    getClientID(): string {
        return this.socket.id;
    }

    sendMessage(message: Message) {
        this.socket.emit('new-message', message);
    }

    sendCommand(argument: string, command: string) {
        this.socket.emit('command', command, argument.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    }

    getMessages(): Observable<Message> {
        return new Observable((observer: Observer<Message>) => {
            this.socket.on('new-message', (message: Message) => observer.next(message));
        });
    }
}
