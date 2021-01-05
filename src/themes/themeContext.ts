import React from 'react';
interface IContextProps {
    toggleTheme: any;
}
const ThemeContext = React.createContext({} as IContextProps);

export default ThemeContext;
