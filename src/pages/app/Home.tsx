import {useTheme} from '@react-navigation/native';
import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
const HomeScreen = ({}) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default HomeScreen;
