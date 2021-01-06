import {LOAD_PODCASTS_SUCCESS, ADD_PODCASTENTRY_STARTED} from '../types';

const initialState = {
    loading: true,
    showPodcasts: true,
    podcasts: [],
    entries: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOAD_PODCASTS_SUCCESS:
            return {
                ...state,
                loading: false,
                showPodcasts: false,
                podcasts: action.podcasts,
            };
        case ADD_PODCASTENTRY_STARTED:
            return {
                ...state,
                loading: true,
                showPodcasts: true,
            };
        default:
            return state;
    }
}
