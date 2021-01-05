import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import SharingScreen from '../../pages/sharing/Sharing';

const SharingStack = createStackNavigator();

const SharingStackScreen = (url) => (
    <SharingStack.Navigator headerMode="none">
        <SharingStack.Screen name="Sharing" component={SharingScreen} />
    </SharingStack.Navigator>
);

export default SharingStackScreen;
