import {setNativeExceptionHandler} from 'react-native-exception-handler';
import Logger from '../logger';

export const createNativeExceptionHandlers = () => {
    setNativeExceptionHandler((exceptionString) => {
        Logger.warn('Native error detected', exceptionString);
    });
};
