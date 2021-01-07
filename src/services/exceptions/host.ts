import {setJSExceptionHandler} from 'react-native-exception-handler';
import {Alert} from 'react-native';
import RNRestart from 'react-native-restart';
import {Logger} from '../logger';
const logger = Logger.getInstance();

const exceptionhandler = (e, isFatal) => {
    logger.error('Fatal host exception', e);
    if (isFatal) {
        Alert.alert(
            'Unexpected error occurred',
            `
        Error: ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}
        We will need to restart the app.
        `,
            [
                {
                    text: 'Restart',
                    onPress: () => {
                        RNRestart.Restart();
                    },
                },
            ],
        );
    } else {
        logger.error(e); // So that we can see it in the ADB logs in case of Android if needed
    }
};
export const createHostExceptionHandlers = () => {
    setJSExceptionHandler(exceptionhandler, true);
};
