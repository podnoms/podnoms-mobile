import React, {useState} from 'react';
import {Provider as StoreProvider, useSelector} from 'react-redux';
import {Provider as PaperProvider, Text} from 'react-native-paper';

import CustomDarkTheme from './themes/customDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import LoginStackScreen from './services/navigation/LoginStack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';

function AppWrapper() {
    return (
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    );
}

function App() {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

    const loginState = useSelector((state) => state.loginState);
    const Drawer = createDrawerNavigator();

    const renderInner = () => {
        if (loginState.isLoggedIn) {
            console.log('App', 'Into app');
            return (
                <Text>Hello Sailor</Text>
                // <Drawer.Navigator
                //     drawerContent={(props) => <DrawerContent {...props} />}>
                //     <Drawer.Screen
                //         name="HomeDrawer"
                //         component={MainTabScreen}
                //     />
                //     <Drawer.Screen name="DebugDrawer" component={DebugScreen} />
                // </Drawer.Navigator>
            );
        } else {
            return <LoginStackScreen />;
        }
    };
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
                {renderInner()}
            </NavigationContainer>
        </PaperProvider>
    );
}
export default AppWrapper;
