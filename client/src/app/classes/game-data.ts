export interface GameData {
    date: string;
    result: GameResult[];
}

export interface GameResult {
    score: number;
    uid: string;
    winner: boolean;
}
