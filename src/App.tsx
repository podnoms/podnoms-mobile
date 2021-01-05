import React, {useState} from 'react';
import {Provider as StoreProvider, useSelector} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';

import CustomDarkTheme from './themes/customDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import LoginStackScreen from './services/navigation/LoginStack';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './services/navigation/AppStack';

function AppWrapper() {
    return (
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    );
}

function App() {
    const [isDarkTheme] = useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

    const loginState = useSelector((state) => state.loginState);

    const renderInner = () => {
        if (loginState.isLoggedIn) {
            console.log('App', 'Into app');
            return <AppStackScreen />;
        } else {
            // return <AppStackScreen />;
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
