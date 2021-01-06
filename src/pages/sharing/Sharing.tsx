import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {useEffect} from 'react';
import {podcastActions} from '../../store/actions/podcastActions';
import DropDown from 'react-native-paper-dropdown';

const SharingScreen = () => {
    const {colors} = useTheme();
    const podcasts = useSelector((state) => state.podcastState.podcasts);
    const dispatch = useDispatch();
    const [showDropDown, setShowDropDown] = useState(false);
    const {selectedPodcast, setSelectedPodcast} = useState();
    const sendToPodcast = () => {};

    useEffect(() => {
        dispatch(podcastActions.getPodcasts());
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#009387" barStyle="light-content" />
            <View style={styles.header}>
                <Animatable.Image
                    animation="bounceIn"
                    duration={1500}
                    source={require('../../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="stretch"
                />
            </View>
            <Animatable.View
                style={[
                    styles.footer,
                    {
                        backgroundColor: colors.background,
                    },
                ]}
                animation="fadeInUpBig">
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
                        },
                    ]}>
                    Share To PodNoms!
                </Text>
                <DropDown
                    label={'Choose podcast'}
                    mode={'outlined'}
                    value={selectedPodcast}
                    setValue={setSelectedPodcast}
                    list={podcasts}
                    visible={showDropDown}
                    showDropDown={() => setShowDropDown(true)}
                    onDismiss={() => setShowDropDown(false)}
                    inputProps={{
                        right: <TextInput.Icon name={'menu-down'} />,
                    }}
                />
                <View style={styles.button}>
                    <TouchableOpacity
                        onPress={() => {
                            sendToPodcast();
                        }}>
                        <LinearGradient
                            colors={['#08d4c4', '#01ab9d']}
                            style={styles.sendButton}>
                            <Text style={styles.textSign}>Send!</Text>
                            <MaterialIcons
                                name="navigate-next"
                                color="#fff"
                                size={20}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        </View>
    );
};

const {height} = Dimensions.get('screen');
const height_logo = height * 0.28;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#009387',
    },
    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 50,
        paddingHorizontal: 30,
    },
    logo: {
        width: height_logo,
        height: height_logo,
    },
    title: {
        color: '#05375a',
        fontSize: 22,
        fontWeight: 'bold',
    },
    text: {
        color: 'grey',
        marginTop: 5,
    },
    button: {
        alignItems: 'flex-end',
        marginTop: 30,
    },
    sendButton: {
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
    },
});
export default SharingScreen;
