import { useTheme } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, StatusBar, Button } from "react-native";
const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();

    const theme = useTheme();

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.dark ? "light-content" : "dark-content"}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
export default HomeScreen;
