import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import DefaultAppScreen from '../../pages/app/DefaultAppScreen';

const AppStack = createStackNavigator();

const AppStackScreen = () => (
    <AppStack.Navigator headerMode="none">
        <AppStack.Screen name="DefaultApp" component={DefaultAppScreen} />
    </AppStack.Navigator>
);

export default AppStackScreen;
