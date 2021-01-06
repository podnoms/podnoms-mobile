import {
    LOGIN_STARTED,
    LOGIN_REQUIRED,
    LOGIN_INIT_SUCCESS,
    LOGGEDIN,
    LOGOUT_COMPLETE,
    LOGIN_SUCCESS,
} from '../types';

const initialState = {
    isLoading: true,
    isLoggedIn: false,
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
            };
        case LOGIN_REQUIRED:
            return {
                ...prevState,
                user: null,
                isLoggedIn: false,
                isLoading: false,
            };
        case LOGGEDIN:
            return {
                ...prevState,
                user: action.user,
                isLoggedIn: true,
                isLoading: false,
            };
        case LOGOUT_COMPLETE:
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
