import React, {useEffect, useMemo, useReducer, useState} from 'react';
import {Provider as StoreProvider} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';

import {useDispatch} from 'react-redux';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';

import {AuthContext} from './services/auth/context';
import store from './store';
import {podcastActions} from './store/actions/podcastActions';
import UserToken from './model/UserToken';
import MainTabScreen from './pages/app/TabContainer';
import {DrawerContent} from './pages/app/Drawer';
import DebugScreen from './pages/Debug';
import CustomDarkTheme from './themes/customDarkTheme';
import CustomDefaultTheme from './themes/CustomDefaultTheme';

const AppWrapper = () => {
  return (
    <StoreProvider store={store}>
      <App />
    </StoreProvider>
  );
};
const App = (props) => {
  console.log('App', 'Props Are', props);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const storeDispatch = useDispatch();

  const [loginState, dispatch] = useReducer(loginReducer, initialloginState);

  useEffect(() => {
    setTimeout(async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (data) {
          let user: UserToken = UserToken.fromStorage(JSON.parse(data));
          storeDispatch(podcastActions.getPodcasts());
          storeDispatch(podcastActions.getProfile());
        } else {
          dispatch({type: 'LOGINREQUIRED'});
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
  }, []);
  const authContext = useMemo(
    () => ({
      signIn: async (user: UserToken) => {
        try {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          dispatch({type: 'LOGGEDIN', user: user});
          store.dispatch(getPodcasts());
        } catch (e) {
          console.log(e);
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('user');
          dispatch({type: 'LOGOUT'});
        } catch (e) {
          console.log(e);
        }
      },
      signUp: () => {
        // setUserToken('fgkj');
        // setIsLoading(false);
      },
      toggleTheme: () => {
        console.log('App', 'toggleTheme', !isDarkTheme);
        setIsDarkTheme((isDarkTheme) => !isDarkTheme);
      },
    }),
    [],
  );

  if (loginState.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator color="red" size="large" />
      </View>
    );
  } else {
    return (
      <PaperProvider theme={theme}>
        <AuthContext.Provider value={authContext}>
          <NavigationContainer theme={theme}>
            {renderInner()}
          </NavigationContainer>
        </AuthContext.Provider>
      </PaperProvider>
    );
  }
};
export default OldAppWrapper;
