import React, {useState} from 'react';
import {Provider as StoreProvider, useSelector} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';

import CustomDarkTheme from './themes/customDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import LoginStackScreen from './services/navigation/LoginStack';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './services/navigation/AppStack';
import ThemeContext from './themes/themeContext';

function AppWrapper() {
    return (
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    );
}

function App() {
    const loginState = useSelector((state) => state.loginState);

    const [isDarkTheme, setIsDarkTheme] = React.useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

    const themeContext = React.useMemo(
        () => ({
            toggleTheme: () => {
                setIsDarkTheme((isDarkTheme) => !isDarkTheme);
            },
        }),
        [],
    );

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
            <ThemeContext.Provider value={themeContext}>
                <NavigationContainer theme={theme}>
                    {renderInner()}
                </NavigationContainer>
            </ThemeContext.Provider>
        </PaperProvider>
    );
}
export default AppWrapper;
