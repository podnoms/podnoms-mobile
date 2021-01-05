import {combineReducers} from 'redux';
import loginReducer from './loginReducer';
import podcastReducer from './podcastReducer';
import profileReducer from './profileReducer';

export default combineReducers({
    loginState: loginReducer,
    podcastState: podcastReducer,
    profileState: profileReducer,
});
