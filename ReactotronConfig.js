import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
        name: 'PodNoms Mobile',
    })
    .useReactNative({
        asyncStorage: true, // there are more options to the async storage.
        networking: {
            ignoreUrls: /symbolicate/,
        },
    })
    .connect();
