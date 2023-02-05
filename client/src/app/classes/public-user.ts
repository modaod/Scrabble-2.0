export enum UserType {
    HUMAN = 'human',
    VIRTUAL = 'virtual',
    OBSERVER = 'observer',
}

export interface PublicUser {
    username: string;
    avatar: string;
    userType: UserType;
}
