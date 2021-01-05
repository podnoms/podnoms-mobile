import ProfileService from '../../services/api/profileService';
import {GET_PROFILE, GET_PROFILE_STARTED, PROFILE_ERROR} from '../types';

const service = new ProfileService();

export const getProfile = () => {
  return async function (dispatch: any, getState: any) {
    try {
      dispatch(
        dispatch({
          type: GET_PROFILE_STARTED,
        }),
      );
      const res = await service.getProfile();
      dispatch({
        type: GET_PROFILE,
        payload: res,
      });
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: console.log(err),
      });
    }
  };
};
