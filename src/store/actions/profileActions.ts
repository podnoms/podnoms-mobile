import User from '../../model/User';
import ProfileService from '../../services/api/profileService';
import {
    LOAD_PROFILE_STARTED,
    LOAD_PROFILE_SUCCESS,
    LOAD_PROFILE_ERROR,
} from '../types';

const service = new ProfileService();

const loadProfile = () => {
    return async function (dispatch: any, getState: any) {
        try {
            dispatch(request());
            const res = await service.getProfile();
            dispatch(success(res));
        } catch (err) {
            dispatch(failure(err));
        }
    };
    function request() {
        return {type: LOAD_PROFILE_STARTED};
    }
    function success(user) {
        return {type: LOAD_PROFILE_SUCCESS, user};
    }
    function failure(error) {
        return {type: LOAD_PROFILE_ERROR, error};
    }
};
export const profileActions = {
    loadProfile,
};
