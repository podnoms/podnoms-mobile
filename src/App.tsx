import React, {Component, useCallback} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Provider as StoreProvider, useSelector, useDispatch} from 'react-redux';
import {Provider as PaperProvider, Text} from 'react-native-paper';
import {View} from 'react-native';

import CustomDarkTheme from './themes/CustomDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';
import store from './store';
import {NavigationContainer} from '@react-navigation/native';
import AppStackScreen from './navigation/AppStack';
import ThemeContext from './themes/themeContext';
import {loginActions} from './store/actions/loginActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShareMenu from 'react-native-share-menu';
import LoginStackScreen from './navigation/LoginStack';
import {Logger} from './services/logger';

const logger = Logger.getInstance();

type SharedItem = {
    mimeType: string;
    data: string;
    extraData: any;
};

class AppWrapper extends Component {
    render() {
        return (
            <StoreProvider store={store}>
                <LoginWrapper />
            </StoreProvider>
        );
    }
}

const LoginWrapper = () => {
    const dispatch = useDispatch();

    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

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
                setIsDarkTheme((t) => !t);
            },
        }),
        [isDarkTheme],
    );

    return (
        <PaperProvider theme={theme}>
            <ThemeContext.Provider value={themeContext}>
                <NavigationContainer theme={theme}>
                    <ShareListener />
                </NavigationContainer>
            </ThemeContext.Provider>
        </PaperProvider>
    );
};

const ShareListener = () => {
    const loginState = useSelector((state) => state.loginState);
    const [sharedData, setSharedData] = useState<string>();
    const [sharedMimeType, setSharedMimeType] = useState<string>();

    const handleShare = useCallback((item: SharedItem) => {
        if (!item) {
            return;
        }

        const {mimeType, data, extraData} = item;

        setSharedData(data);
        setSharedMimeType(mimeType);
        // You can receive extra data from your custom Share View
        logger.info(extraData);
    }, []);

    useEffect(() => {
        ShareMenu.getInitialShare(handleShare);
    }, [handleShare]);

    useEffect(() => {
        const listener = ShareMenu.addNewShareListener(handleShare);

        return () => {
            listener.remove();
        };
    }, [handleShare]);

    if (!sharedMimeType && !sharedData) {
        // The user hasn't shared anything yet
        if (loginState.isLoggedIn) {
            return <AppStackScreen />;
        } else {
            // return <AppStackScreen />;
            return <LoginStackScreen />;
        }
    } else if (sharedMimeType === 'text/plain') {
        // The user shared text
        return <AppStackScreen shareUrl={sharedData} />;
    }

    return (
        <View>
            <Text>Shared mime type: {sharedMimeType}</Text>
            <Text>Shared file location: {sharedData}</Text>
        </View>
    );
};

export default AppWrapper;
