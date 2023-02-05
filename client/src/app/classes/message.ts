export interface Message {
    username: string;
    body: string;
    color?: string;
}

export interface PrivateMessage {
    message: string;
    time: string;
    uid: string;
    picture?: boolean;
}
