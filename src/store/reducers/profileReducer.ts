import {LOAD_PROFILE_SUCCESS} from '../types';

const initialState = {
    loading: true,
    profile: {},
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOAD_PROFILE_SUCCESS:
            return {
                loading: false,
                profile: action.user,
            };
        default:
            return state;
    }
}
