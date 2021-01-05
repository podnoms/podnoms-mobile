import React, { createContext } from "react";
import UserToken from "../model/UserToken";
interface IContextProps {
    state: any;
    signOut: any;
    signIn: any;
    toggleTheme: any;
    user: UserToken;
    dispatch: ({type}: {type: string}) => void;
}

export const AuthContext = createContext({} as IContextProps);
