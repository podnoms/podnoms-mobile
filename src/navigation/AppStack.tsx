import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {createStackNavigator} from '@react-navigation/stack';
import DefaultAppScreen from '../pages/app/DefaultAppScreen';
import {profileActions} from '../store/actions/profileActions';

const AppStack = createStackNavigator();

const AppStackScreen = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(profileActions.loadProfile());
    }, [dispatch]);

    return (
        <AppStack.Navigator headerMode="none">
            <AppStack.Screen name="DefaultApp" component={DefaultAppScreen} />
        </AppStack.Navigator>
    );
};

export default AppStackScreen;
