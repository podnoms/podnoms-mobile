import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginService from '../../services/api/loginService';
import {
    LOGIN_STARTED,
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    LOGGEDIN,
    LOGOUT_COMPLETE,
    LOGOUT_STARTED,
    LOGOUT_FAILED,
} from '../types';

const loginUser = (username: string, password: string) => {
    const service = new LoginService();
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request(username));
            const res = await service.loginUser(username, password);
            await AsyncStorage.setItem('user', JSON.stringify(res));
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
    loginUser,
    logoutUser,
};
