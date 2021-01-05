import {LOGIN, LOGIN_STARTED, LOGIN_REQUIRED, LOGGEDIN, LOGOUT} from '../types';
import {logger} from 'react-native-logs';
var log = logger.createLogger();

const initialState = {
    isLoading: true,
    isLoggedIn: false,
    user: null,
};

export default function (prevState = initialState, action) {
    switch (action.type) {
        case LOGIN_STARTED:
            log.debug('loginReducer', LOGIN_STARTED, prevState);
            return {
                ...prevState,
                isLoading: true,
            };
        case LOGIN:
            log.debug('loginReducer', LOGIN, prevState);
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
            };
        case LOGIN_REQUIRED:
            log.debug('loginReducer', LOGIN, prevState);
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
            };
        case LOGGEDIN:
            log.debug('loginReducer', LOGGEDIN, prevState);
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
            };
        case LOGOUT:
            log.debug('loginReducer', LOGOUT, prevState);
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
            };
        default:
            return prevState;
    }
}
