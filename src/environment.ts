import {Platform} from 'react-native';
import {Logger} from './services/logger';

const localhost =
    Platform.OS === 'ios' ? 'http://localhost:5000' : 'http://10.1.1.1:5000';

const ENV = {
    dev: {
        apiUrl: localhost,
        hubUrl: 'https://dev.pdnm.be:5001/hubs',
        logUrl: 'http://10.1.1.1:8000/api/logger',
    },
    prod: {
        apiUrl: 'https://api.podnoms.com',
        hubUrl: 'https://rt.podnoms.com/hubs',
        logUrl: 'http://logging.fergl.ie:8000/api/logger',
    },
};

const getEnvVars = () => {
    // What is __DEV__ ?
    // This variable is set to true when react-native is running in Dev mode.
    // __DEV__ is true when run locally, but false when published.
    if (__DEV__) {
        return ENV.dev;
    }
    return ENV.prod;
};

export default getEnvVars;
