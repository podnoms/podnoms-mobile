import React from 'react';

import {AppRegistry, NativeModules} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {startNetworkLogging} from 'react-native-network-logger';
import AppWrapper from './src/App';
import {name as appName} from './app.json';
const isHermes = () => !!global.HermesInternal;

import {logger} from 'react-native-logs';
var log = logger.createLogger();
log.debug('Bootstrapping application');

if (__DEV__) {
    log.debug('index.js', 'Setting up dev tools');
    startNetworkLogging();
    // NativeModules.DevSettings.setIsDebuggingRemotely(true);
} else {
    log.debug('index.js', 'Disabling logging');
    console.log = () => {};
    console.time = () => {};
    console.timeLog = () => {};
    console.timeEnd = () => {};
    console.warn = () => {};
    console.count = () => {};
    console.countReset = () => {};
    console.error = () => {};
    console.info = () => {};
}

log.info(
    'index',
    'Bootstrapping',
    appName,
    isHermes ? 'Hermes Enabled' : 'Hermes disabled',
);

AppRegistry.registerComponent(appName, () => AppWrapper);
TrackPlayer.registerPlaybackService(() => require('./service'));
