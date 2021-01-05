import React from 'react';

import {useEffect, useContext, useMemo, useState} from 'react';
import {Provider as StoreProvider, useSelector, useDispatch} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';

import CustomDarkTheme from './themes/customDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import LoginStackScreen from './navigation/LoginStack';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './navigation/AppStack';
import ThemeContext from './themes/themeContext';
import {loginActions} from './store/actions/loginActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AppWrapper() {
    return (
        <StoreProvider store={store}>
            <App />
        </StoreProvider>
    );
}

function App() {
    const loginState = useSelector((state) => state.loginState);
    const dispatch = useDispatch();

    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;
    const {toggleTheme} = useContext(ThemeContext);

    useEffect(() => {
        dispatch(loginActions.loginCheckStatus());
    }, [dispatch]);

    useEffect(() => {
        async function loadTheme() {
            const theme = await AsyncStorage.getItem('isdark');
            console.log('App', 'loadingTheme', theme);
            if (JSON.parse(theme || 'false')) {
                setIsDarkTheme(true);
            }
        }
        loadTheme();
    }, [isDarkTheme]);

    const themeContext = useMemo(
        () => ({
            loadTheme: async () => {},
            toggleTheme: async () => {
                await AsyncStorage.setItem(
                    'isdark',
                    JSON.stringify(!isDarkTheme),
                );
                setIsDarkTheme((isDarkTheme) => !isDarkTheme);
            },
        }),
        [isDarkTheme],
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
