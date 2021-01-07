import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../pages/login/Splash';
import LoginScreen from '../pages/login/Login';

const LoginStack = createStackNavigator();

const LoginStackScreen = () => (
    <LoginStack.Navigator headerMode="none">
        <LoginStack.Screen name="Splash" component={SplashScreen} />
        <LoginStack.Screen name="Login" component={LoginScreen} />
    </LoginStack.Navigator>
);

export default LoginStackScreen;
