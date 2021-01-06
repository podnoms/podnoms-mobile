import React, {Component} from 'react';

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

class AppWrapper extends Component {
    render() {
        return (
            <StoreProvider store={store}>
                <App shareUrl={this.props.shareUrl} />
            </StoreProvider>
        );
    }
}
// function AppWrapper(props) {
//     return (
//         <StoreProvider store={store}>
//             <App props={props} />
//         </StoreProvider>
//     );
// }

function App(props) {
    console.log('App', 'Props', props);

    const loginState = useSelector((state) => state.loginState);
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
                setIsDarkTheme((isDarkTheme) => !isDarkTheme);
            },
        }),
        [isDarkTheme],
    );

    const renderInner = () => {
        if (loginState.isLoggedIn) {
            return <AppStackScreen shareUrl={props?.shareUrl} />;
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
