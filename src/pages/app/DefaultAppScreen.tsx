import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {DrawerContent} from './Drawer';
import MainTabScreen from './TabContainer';

const DefaultAppScreen = () => {
    const Drawer = createDrawerNavigator();

    return (
        <Drawer.Navigator
            drawerContent={(props) => <DrawerContent {...props} />}>
            <Drawer.Screen name="HomeDrawer" component={MainTabScreen} />
        </Drawer.Navigator>
    );
};

export default DefaultAppScreen;
