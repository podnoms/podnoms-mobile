import {GET_PODCASTS_SUCCESS, ADD_PODCASTENTRY_STARTED} from '../types';

const initialState = {
    loading: true,
    podcasts: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_PODCASTS_SUCCESS:
            return {
                ...state,
                loading: false,
                podcasts: action.podcasts,
            };
        case ADD_PODCASTENTRY_STARTED:
            return {
                ...state,
                loading: true,
            };
        default:
            return state;
    }
}
