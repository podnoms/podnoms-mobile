import {GET_PROFILE} from '../types';

const initialState = {
  loading: true,
  profile: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROFILE:
      return {
        loading: false,
        profile: action.payload,
      };
    default:
      return state;
  }
}
