import React, {useState} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {Button} from 'react-native-paper';
import {Text} from 'react-native-paper';
import {Menu} from 'react-native-paper';
import {Divider} from 'react-native-paper';
import {Provider} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';

const SharingScreen = () => {
    const [showDropDown, setShowDropDown] = useState(false);
    const [gender, setGender] = useState();

    const genderList = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Others', value: 'others'},
    ];

    return (
        <View style={styles.container}>
            <Text>PodNoms Mobile!</Text>
            <SafeAreaView style={styles.container}>
                <DropDown
                    label={'Choose Podcast'}
                    mode={'outlined'}
                    value={gender}
                    setValue={setGender}
                    list={genderList}
                    visible={showDropDown}
                    showDropDown={() => setShowDropDown(true)}
                    onDismiss={() => setShowDropDown(false)}
                    inputProps={{
                        right: <TextInput.Icon name={'menu-down'} />,
                    }}
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
export default SharingScreen;
