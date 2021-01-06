import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {createStackNavigator} from '@react-navigation/stack';
import DefaultAppScreen from '../pages/app/DefaultAppScreen';
import {profileActions} from '../store/actions/profileActions';
import SharingScreen from '../pages/sharing/Sharing';
import DebugScreen from '../pages/Debug';

const AppStack = createStackNavigator();

const AppStackScreen = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(profileActions.loadProfile());
    }, [dispatch]);

    const content = props.shareUrl ? (
        <AppStack.Screen name="SharingScreen">
            {(screenProps) => <SharingScreen shareUrl={props.shareUrl} />}
        </AppStack.Screen>
    ) : (
        <AppStack.Screen name="DefaultApp" component={DefaultAppScreen} />
    );
    return (
        <AppStack.Navigator headerMode="none">
            {content}
            <AppStack.Screen
                name="Debug"
                component={DebugScreen}></AppStack.Screen>
        </AppStack.Navigator>
    );
};

export default AppStackScreen;