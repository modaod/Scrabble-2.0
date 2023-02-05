enum Value {
    A = 1,
    B = 3,
    C = 3,
    D = 2,
    E = 1,
    F = 4,
    G = 2,
    H = 4,
    I = 1,
    J = 8,
    K = 10,
    L = 1,
    M = 2,
    N = 1,
    O = 1,
    P = 3,
    Q = 8,
    R = 1,
    S = 1,
    T = 1,
    U = 1,
    V = 4,
    W = 10,
    X = 10,
    Y = 10,
    Z = 10,
    BLANK = 0,
}
enum Count {
    A = 10,
    B = 2,
    C = 2,
    D = 3,
    E = 16,
    F = 2,
    G = 2,
    H = 2,
    I = 8,
    J = 1,
    K = 1,
    L = 5,
    M = 3,
    N = 6,
    O = 6,
    P = 2,
    Q = 1,
    R = 6,
    S = 6,
    T = 6,
    U = 6,
    V = 2,
    W = 1,
    X = 1,
    Y = 1,
    Z = 1,
    BLANK = 0,
}

export const LETTERS: [string, number, number][] = [
    ['a', Count.A, Value.A],
    ['b', Count.B, Value.B],
    ['c', Count.C, Value.C],
    ['d', Count.D, Value.D],
    ['e', Count.E, Value.E],
    ['f', Count.F, Value.F],
    ['g', Count.G, Value.G],
    ['h', Count.H, Value.H],
    ['i', Count.I, Value.I],
    ['j', Count.J, Value.J],
    ['k', Count.K, Value.K],
    ['l', Count.L, Value.L],
    ['m', Count.M, Value.M],
    ['n', Count.N, Value.N],
    ['o', Count.O, Value.O],
    ['p', Count.P, Value.P],
    ['q', Count.Q, Value.Q],
    ['r', Count.R, Value.R],
    ['s', Count.S, Value.S],
    ['t', Count.T, Value.T],
    ['u', Count.U, Value.U],
    ['v', Count.V, Value.V],
    ['w', Count.W, Value.W],
    ['x', Count.X, Value.X],
    ['y', Count.Y, Value.Y],
    ['z', Count.Z, Value.Z],
    ['blank', Count.BLANK, Value.BLANK],
];
