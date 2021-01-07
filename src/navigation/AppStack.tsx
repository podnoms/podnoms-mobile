import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {createStackNavigator} from '@react-navigation/stack';
import DefaultAppScreen from '../pages/app/DefaultAppScreen';
import {profileActions} from '../store/actions/profileActions';
import SharingScreen from '../pages/sharing/Sharing';
import DebugScreen from '../pages/Debug';
import {Logger} from '../services/logger';
const logger = Logger.getInstance();

const AppStack = createStackNavigator();

const AppStackScreen = (props) => {
    logger.errorlog('AppStack', 'props', props);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(profileActions.loadProfile());
    }, [dispatch]);
    const content = props.shareUrl ? (
        <AppStack.Screen name="SharingScreen">
            {(screenProps) => <SharingScreen shareUrl={props.shareUrl} />}
        </AppStack.Screen>
    ) : null;
    return (
        <AppStack.Navigator headerMode="none">
            {content}
            <AppStack.Screen name="DefaultApp" component={DefaultAppScreen} />
            <AppStack.Screen
                name="Debug"
                component={DebugScreen}></AppStack.Screen>
        </AppStack.Navigator>
    );
};

export default AppStackScreen;
