import React, {Component, useCallback} from 'react';

import {useEffect, useMemo, useState} from 'react';
import {Provider as StoreProvider, useSelector, useDispatch} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';

import CustomDarkTheme from './themes/CustomDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import LoginStackScreen from './navigation/LoginStack';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './navigation/AppStack';
import ThemeContext from './themes/themeContext';
import {loginActions} from './store/actions/loginActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShareMenu, {ShareMenuReactView} from 'react-native-share-menu';

type SharedItem = {
    mimeType: string;
    data: string;
    extraData: any;
};

class AppWrapper extends Component {
    render() {
        return (
            <StoreProvider store={store}>
                <App />
            </StoreProvider>
        );
    }
}

function App() {
    const loginState = useSelector((state) => state.loginState);
    const dispatch = useDispatch();

    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

    const [shareUrl, setShareUrl] = useState<string>(null);
    const [sharedMimeType, setSharedMimeType] = useState<string>(null);

    const handleShare = useCallback((item: SharedItem) => {
        console.log('App', 'handleShare', item);
        if (!item) {
            return;
        }

        const {mimeType, data} = item;

        console.log('App', 'data', data);
        console.log('App', 'mimeType', mimeType);

        setShareUrl(data);
        setSharedMimeType(mimeType);
    }, []);

    useEffect(() => {
        ShareMenu.getInitialShare(handleShare);
    }, []);

    useEffect(() => {
        const listener = ShareMenu.addNewShareListener(handleShare);

        return () => {
            listener.remove();
        };
    }, []);

    useEffect(() => {
        dispatch(loginActions.loginCheckStatus());
    }, [dispatch]);

    useEffect(() => {
        async function loadTheme() {
            const theme = await AsyncStorage.getItem('isdark');
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
            return <AppStackScreen shareUrl={shareUrl} />;
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
