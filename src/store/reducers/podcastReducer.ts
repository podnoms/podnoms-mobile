import {GET_PODCASTS} from '../types';

const initialState = {
  loading: true,
  podcasts: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PODCASTS:
      return {
        ...state,
        loading: false,
        podcasts: action.payload,
      };
    default:
      return state;
  }
}
