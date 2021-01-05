import {
    LOGIN_STARTED,
    LOGIN_REQUIRED,
    LOGIN_INIT_SUCCESS,
    LOGGEDIN,
    LOGOUT_COMPLETE,
    LOGIN_SUCCESS,
} from '../types';
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
        case LOGIN_SUCCESS:
        case LOGIN_INIT_SUCCESS:
            log.debug('loginReducer', action.type, prevState, action.user.name);
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
            };
        case LOGIN_REQUIRED:
            log.debug('loginReducer', LOGIN_REQUIRED, prevState);
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
        case LOGOUT_COMPLETE:
            log.debug('loginReducer', LOGOUT_COMPLETE, prevState);
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
