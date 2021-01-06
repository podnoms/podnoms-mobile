import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {createStackNavigator} from '@react-navigation/stack';
import DefaultAppScreen from '../pages/app/DefaultAppScreen';
import {profileActions} from '../store/actions/profileActions';
import SharingScreen from '../pages/sharing/Sharing';

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
    return <AppStack.Navigator headerMode="none">{content}</AppStack.Navigator>;
};

export default AppStackScreen;
