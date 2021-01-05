import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../../model/User';
import LoginService from '../../services/api/loginService';
import {
    LOGIN_INIT_STARTED,
    LOGIN_INIT_SUCCESS,
    LOGIN_INIT_FAILED,
    LOGIN_STARTED,
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGGEDIN,
    LOGOUT_COMPLETE,
    LOGOUT_STARTED,
    LOGOUT_FAILED,
} from '../types';

const loginCheckStatus = () => {
    const service = new LoginService();
    return async function (dispatch: any, getState: any) {
        console.log('loginActions', 'loginCheckStatus');
        try {
            dispatch(request());
            const t = await AsyncStorage.getItem('user');
            const stored = User.fromStorage(JSON.parse(t));
            console.log('loginActions', 'loginCheckStatus-stored', stored);
            if (stored) {
                const user = await service.refreshToken(
                    stored?.token,
                    stored?.refreshToken,
                );
                console.log('loginActions', 'loginCheckStatus-refresh', user);
                if (user) {
                    dispatch(success(user));
                }
            } else {
                console.log('loginActions', 'No user stored');
            }
        } catch (err) {
            console.log('loginActions', 'Error refreshing tokens', err);
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: LOGIN_INIT_STARTED};
    }
    function success(user) {
        return {type: LOGIN_INIT_SUCCESS, user};
    }
    function failure(error) {
        return {type: LOGIN_INIT_FAILED, error};
    }
};

const loginUser = (username: string, password: string) => {
    const service = new LoginService();
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request(username));
            const res = await service.loginUser(username, password);
            await AsyncStorage.setItem('user', JSON.stringify(res));
            console.log(
                'loginActions',
                'Stored user',
                await AsyncStorage.getItem('user'),
            );
            dispatch({type: LOGGEDIN, user: res});
            dispatch(success(res));
        } catch (err) {
            dispatch(failure(err));
        }
    };
    function request(user) {
        return {type: LOGIN_STARTED, user};
    }
    function success(user) {
        return {type: LOGIN_SUCCESS, user};
    }
    function failure(error) {
        return {type: LOGIN_FAILED, error};
    }
};

const logoutUser = () => {
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request());
            await AsyncStorage.removeItem('user');
            dispatch(success());
        } catch (err) {
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: LOGOUT_STARTED};
    }
    function success() {
        return {type: LOGOUT_COMPLETE};
    }
    function failure(error) {
        return {type: LOGOUT_FAILED, error};
    }
};
export const loginActions = {
    loginCheckStatus,
    loginUser,
    logoutUser,
};
