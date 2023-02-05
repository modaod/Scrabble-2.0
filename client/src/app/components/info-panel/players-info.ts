import { Goal } from '@app/classes/goal';

export interface Player {
    username: string;
    avatar: string;
    isHuman: boolean;
    currentScore: number;
    letterCount: string;
    active: boolean;
    winner: boolean;
    objectives: Goal[];
}

export const playersInfo = [
    {
        username: 'Joueur 1',
        avatar: '',
        isHuman: false,
        currentScore: 0,
        letterCount: '0',
        active: false,
        winner: false,
        objectives: [],
    },
    {
        username: 'Joueur 2',
        avatar: '',
        isHuman: false,
        currentScore: 0,
        letterCount: '0',
        active: false,
        winner: false,
        objectives: [],
    },
    {
        username: 'Joueur 3',
        avatar: '',
        isHuman: false,
        currentScore: 0,
        letterCount: '0',
        active: false,
        winner: false,
        objectives: [],
    },
    {
        username: 'Joueur 4',
        avatar: '',
        isHuman: false,
        currentScore: 0,
        letterCount: '0',
        active: false,
        winner: false,
        objectives: [],
    },
];
