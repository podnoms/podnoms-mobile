import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginService from '../../services/api/loginService';
import {LOGIN_STARTED, LOGIN_SUCCESS, LOGIN_FAILED, LOGGEDIN} from '../types';

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
            dispatch(failure(username));
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

export const loginActions = {
    loginUser,
};
