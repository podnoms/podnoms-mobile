import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';

import AppWrapper from './src/App';
import {name as appName} from './app.json';
import {Logger} from './src/services/logger';
const isHermes = () => !!global.HermesInternal;
import {
    createHostExceptionHandlers,
    createNativeExceptionHandlers,
} from './src/services/exceptions';

createNativeExceptionHandlers();
createHostExceptionHandlers();
const logger = Logger.getInstance();
logger.debug('index.js');

if (__DEV__) {
    logger.debug('index.js', 'Setting up dev tools');
    import('./ReactotronConfig').then(() => {
        logger.log('index', 'Reactotron Configured');
    });
    // NativeModules.DevSettings.setIsDebuggingRemotely(true);
} else {
    logger.debug('index', 'ProductionInstance', 'Bootstrapping');
}

logger.debug(
    'index',
    'Bootstrapping',
    appName,
    isHermes ? 'Hermes Enabled' : 'Hermes disabled',
);

AppRegistry.registerComponent(appName, () => AppWrapper);
TrackPlayer.registerPlaybackService(() => require('./service'));
