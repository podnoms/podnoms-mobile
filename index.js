import React from 'react';

import {AppRegistry, NativeModules} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import Reactotron from 'reactotron-react-native';

import AppWrapper from './src/App';
import {name as appName} from './app.json';
import Logger from './src/services/logger';
const isHermes = () => !!global.HermesInternal;
import {
    createHostExceptionHandlers,
    createNativeExceptionHandlers,
} from './src/services/exceptions';

createNativeExceptionHandlers();
createHostExceptionHandlers();

Logger.debug('index.js');

if (__DEV__) {
    Logger.debug('index.js', 'Setting up dev tools');
    import('./ReactotronConfig').then(() => {
        // Logger.log('Reactotron Configured'),
        Logger.log('index', 'Reactotron Configured');
    });
    // NativeModules.DevSettings.setIsDebuggingRemotely(true);
} else {
    Logger.debug('index', 'ProductionInstance', 'Bootstrapping');
}

Logger.debug(
    'index',
    'Bootstrapping',
    appName,
    isHermes ? 'Hermes Enabled' : 'Hermes disabled',
);

AppRegistry.registerComponent(appName, () => AppWrapper);
TrackPlayer.registerPlaybackService(() => require('./service'));
