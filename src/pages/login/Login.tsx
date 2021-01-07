import React, {useContext, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Platform,
    StyleSheet,
    StatusBar,
    Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import Feather from 'react-native-vector-icons/dist/Feather';
import {useDispatch, useSelector} from 'react-redux';

import {Snackbar, useTheme} from 'react-native-paper';

import LoginService from '../../services/api/loginService';
import {loginActions} from '../../store/actions/loginActions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Logger from '../../services/logger';
const LoginScreen = ({navigation: {navigate}}) => {
    const [data, setData] = useState({
        username: __DEV__ ? 'fergal.moran+testharness@gmail.com' : '',
        password: __DEV__ ? 'secret' : '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
    });
    const dispatch = useDispatch();
    const [loginError, setLoginError] = useState<boolean>(false);
    const {colors} = useTheme();

    const loginService: LoginService = new LoginService();

    const textInputChange = (val) => {
        if (val.trim().length >= 4) {
            setData({
                ...data,
                username: val,
                check_textInputChange: true,
                isValidUser: true,
            });
        } else {
            setData({
                ...data,
                username: val,
                check_textInputChange: false,
                isValidUser: false,
            });
        }
    };

    const handlePasswordChange = (val) => {
        if (val.trim().length >= 4) {
            setData({
                ...data,
                password: val,
                isValidPassword: true,
            });
        } else {
            setData({
                ...data,
                password: val,
                isValidPassword: false,
            });
        }
    };

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry,
        });
    };

    const handleValidUser = (val) => {
        if (val.trim().length >= 4) {
            setData({
                ...data,
                isValidUser: true,
            });
        } else {
            setData({
                ...data,
                isValidUser: false,
            });
        }
    };

    const loginHandle = async (userName: string, password: string) => {
        if (data.username.length === 0 || data.password.length === 0) {
            Alert.alert(
                'Wrong Input!',
                'Username or password field cannot be empty.',
                [{text: 'Okay'}],
            );
            return;
        }

        var result = await loginService.loginUser(userName, password);
        if (!result) {
            Alert.alert('Invalid User!', 'Username or password is incorrect.', [
                {text: 'Okay'},
            ]);
            setLoginError(true);
            return;
        }
        Logger.log('Login', 'dispatchingAction');
        dispatch(loginActions.loginUser(userName, password));
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#009387" barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.text_header}>Welcome!</Text>
            </View>
            <Animatable.View
                animation="fadeInUpBig"
                style={[
                    styles.footer,
                    {
                        backgroundColor: colors.background,
                    },
                ]}>
                <Text
                    style={[
                        styles.text_footer,
                        {
                            color: colors.text,
                        },
                    ]}>
                    Username
                </Text>
                <View style={styles.action}>
                    <FontAwesome name="user-o" color={colors.text} size={20} />
                    <TextInput
                        placeholder="Your Username"
                        placeholderTextColor="#666666"
                        value={data.username}
                        style={[
                            styles.textInput,
                            {
                                color: colors.text,
                            },
                        ]}
                        autoCapitalize="none"
                        onChangeText={(val) => textInputChange(val)}
                        onEndEditing={(e) =>
                            handleValidUser(e.nativeEvent.text)
                        }
                    />
                    {data.check_textInputChange ? (
                        <Animatable.View animation="bounceIn">
                            <Feather
                                name="check-circle"
                                color="green"
                                size={20}
                            />
                        </Animatable.View>
                    ) : null}
                </View>
                {data.isValidUser ? null : (
                    <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>
                            Username must be 4 characters long.
                        </Text>
                    </Animatable.View>
                )}

                <Text
                    style={[
                        styles.text_footer,
                        {
                            color: colors.text,
                            marginTop: 35,
                        },
                    ]}>
                    Password
                </Text>
                <View style={styles.action}>
                    <Feather name="lock" color={colors.text} size={20} />
                    <TextInput
                        placeholder="Your Password"
                        placeholderTextColor="#666666"
                        secureTextEntry={data.secureTextEntry ? true : false}
                        style={[
                            styles.textInput,
                            {
                                color: colors.text,
                            },
                        ]}
                        value={data.password}
                        autoCapitalize="none"
                        onChangeText={(val) => handlePasswordChange(val)}
                    />
                    <TouchableOpacity onPress={updateSecureTextEntry}>
                        {data.secureTextEntry ? (
                            <Feather name="eye-off" color="grey" size={20} />
                        ) : (
                            <Feather name="eye" color="grey" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
                {data.isValidPassword ? null : (
                    <Animatable.View animation="fadeInLeft" duration={500}>
                        <Text style={styles.errorMsg}>
                            Password must be 4 characters long.
                        </Text>
                    </Animatable.View>
                )}

                <TouchableOpacity>
                    <Text style={{color: '#009387', marginTop: 15}}>
                        Forgot password?
                    </Text>
                </TouchableOpacity>
                <View style={styles.button}>
                    <TouchableOpacity
                        onPress={() => {
                            loginHandle(data.username, data.password);
                        }}>
                        <LinearGradient
                            colors={['#08d4c4', '#01ab9d']}
                            style={styles.signIn}>
                            <Text style={styles.textSign}>Login</Text>
                            <AntDesign name="login" color="#fff" size={15} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                {/* <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.signIn}
                        onPress={() => {
                            loginHandle(data.username, data.password);
                        }}>
                        <LinearGradient
                            colors={['#08d4c4', '#01ab9d']}
                            style={styles.signIn}>
                            <Text
                                style={[
                                    styles.textSign,
                                    {
                                        color: '#fff',
                                    },
                                ]}>
                                Sign In
                            </Text>
                            <MaterialIcons
                                name="login-variant"
                                color="#fff"
                                size={20}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View> */}
            </Animatable.View>
            <Snackbar
                visible={loginError}
                onDismiss={() => setLoginError(false)}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setLoginError(false);
                    },
                }}>
                Unable to log you in at this time.
            </Snackbar>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#009387',
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30,
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18,
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
    },
    actionError: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FF0000',
        paddingBottom: 5,
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    errorMsg: {
        color: '#FF0000',
        fontSize: 14,
    },
    button: {
        alignItems: 'flex-end',
        marginTop: 30,
    },
    signIn: {
        width: 150,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        flexDirection: 'row',
    },
    textSign: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 5,
    },
});
