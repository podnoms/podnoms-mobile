import {setNativeExceptionHandler} from 'react-native-exception-handler';
import {Logger} from'../logger';
const logger = Logger.getInstance();

export const createNativeExceptionHandlers = () => {
    setNativeExceptionHandler((exceptionString) => {
        logger.errorwarn('Native error detected', exceptionString);
    });
};
