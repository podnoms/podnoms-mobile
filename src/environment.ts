import {Platform} from 'react-native';

const localhost =
    Platform.OS === 'ios' ? 'http://localhost:5000' : 'http://10.1.1.1:5000';

const ENV = {
    dev: {
        apiUrl: localhost,
        hubUrl: 'https://dev.pdnm.be:5001/hubs',
    },
    prod: {
        apiUrl: 'https://api.podnoms.com',
        hubUrl: 'https://rt.podnoms.com/hubs',
    },
};

const getEnvVars = () => {
    // What is __DEV__ ?
    // This variable is set to true when react-native is running in Dev mode.
    // __DEV__ is true when run locally, but false when published.
    if (__DEV__) {
        console.log('environment', 'Returning dev env', ENV.dev);
        return ENV.dev;
    }
    console.log('environment', 'Returning prod env', ENV.prod);
    return ENV.prod;
};

export default getEnvVars;
