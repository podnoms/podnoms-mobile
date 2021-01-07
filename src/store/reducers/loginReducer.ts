import Logger from '../../services/logger';
import {
    LOGIN_STARTED,
    LOGIN_REQUIRED,
    LOGIN_INIT_SUCCESS,
    LOGGEDIN,
    LOGOUT_COMPLETE,
    LOGIN_SUCCESS,
    LOGIN_FAILED,
} from '../types';

const initialState = {
    isLoading: true,
    isLoggedIn: false,
    isLoginError: false,
    user: null,
};

export default function (prevState = initialState, action) {
    switch (action.type) {
        case LOGIN_STARTED:
            return {
                ...prevState,
                isLoading: true,
            };
        case LOGIN_SUCCESS:
        case LOGIN_INIT_SUCCESS:
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
                isLoginError: false,
            };
        case LOGIN_REQUIRED:
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
                isLoginError: false,
            };
        case LOGGEDIN:
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
                isLoginError: false,
            };
        case LOGIN_FAILED:
            Logger.log('loginReducer', 'LOGIN_FAILED', action);
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
                isLoginError: true,
            };
        case LOGOUT_COMPLETE:
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
                isLoginError: false,
            };
        default:
            return prevState;
    }
}
