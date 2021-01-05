import React from 'react';
interface IContextProps {
    loadTheme: any;
    toggleTheme: any;
}
const ThemeContext = React.createContext({} as IContextProps);

export default ThemeContext;
