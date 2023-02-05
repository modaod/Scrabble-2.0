// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    // serverUrl: 'http://localhost:3000/',
    serverUrl: 'http://ec2-99-79-39-161.ca-central-1.compute.amazonaws.com:3000/',
    firebaseConfig: {
        apiKey: 'AIzaSyBMXp6exKLg7Lr2CeIQIvGaS7zbh8S431A',
        authDomain: 'scrabble-79318.firebaseapp.com',
        databaseURL: 'https://scrabble-79318-default-rtdb.firebaseio.com',
        projectId: 'scrabble-79318',
        storageBucket: 'scrabble-79318.appspot.com',
        messagingSenderId: '213273036174',
        appId: '1:213273036174:web:a91557811fff6d79c250df',
        measurementId: 'G-59XHGSL8SW',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
