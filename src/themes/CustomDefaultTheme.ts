import {DefaultTheme} from '@react-navigation/native';
import {DefaultTheme as PaperDefaultTheme} from 'react-native-paper';

const CustomDefaultTheme = {
    ...DefaultTheme,
    ...PaperDefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        ...PaperDefaultTheme.colors,
        background: '#ffffff',
        lowerBackground: '#F18F29',
        text: '#333333',
    },
};
export default CustomDefaultTheme;
