import {DarkTheme} from '@react-navigation/native';
import {DarkTheme as PaperDarkTheme} from 'react-native-paper';

const CustomDarkTheme = {
    ...DarkTheme,
    ...PaperDarkTheme,
    colors: {
        ...DarkTheme.colors,
        ...PaperDarkTheme.colors,
        background: '#333333',
        lowerBackground: '#FFFFFF',
        text: '#ffffff',
    },
};

export default CustomDarkTheme;
