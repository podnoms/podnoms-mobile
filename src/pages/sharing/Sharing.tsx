import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import {Snackbar, Text, TextInput} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {useEffect} from 'react';
import {podcastActions} from '../../store/actions/podcastActions';
import DropDownPicker from 'react-native-dropdown-picker';
import PodcastService from '../../services/api/podcastService';
import {navigate} from '../../navigation/rootNavigator';

const SharingScreen = (props) => {
    const {colors} = useTheme();
    const podcasts = useSelector((state) => state.podcastState.podcasts);
    const [selectedPodcast, setSelectedPodcast] = useState<any>();
    const [podcastTitle, setPodcastTitle] = useState<string>(
        props.sourceTitle || 'New from PodNoms Mobile',
    );
    const [snackBarVisible, setSnackBarVisible] = React.useState<boolean>(
        false,
    );
    const [snackBarText, setSnackBarText] = React.useState<string>(
        'New from PodNoms Mobile',
    );

    const dispatch = useDispatch();

    const sendToPodcast = async () => {
        if (!selectedPodcast) {
            setSnackBarText('Please select a Podcast first');
            setSnackBarVisible(true);
            return;
        }
        console.log('Sharing', 'sendToPodacst', 'Creating service');
        const service = new PodcastService();
        console.log('Sharing', 'sendToPodacst', 'Validatating', props.shareUrl);
        const valid = await service.validateUrl(props.shareUrl);
        if (!valid) {
            console.log(
                'Sharing',
                'sendToPodacst',
                'Validatating',
                'URL is not valid',
            );
            setSnackBarText("This doesn't look like a URL we can manage!");
            setSnackBarVisible(true);
            return;
        }
        console.log('Sharing', 'sendToPodacst', 'Validatating', 'URL is valid');
        try {
            const result = await service.addPodcastEntry(
                selectedPodcast.value,
                props.shareUrl,
                podcastTitle,
            );
            if (result) {
                setSnackBarText(
                    'Entry successfully added, visit podnoms.com to view progress!',
                );
                setSnackBarVisible(true);
                return;
            }
        } catch (err) {
            console.log('Sharing', 'Error creating entry', err);
        }
        setSnackBarText('Unable to add this entry at this time!');
        setSnackBarVisible(true);
    };

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
                <View style={styles.subText}>
                    <Text style={styles.text}>{props.shareUrl}</Text>
                </View>
                <DropDownPicker
                    searchable={true}
                    placeholder="Choose a podcast"
                    items={podcasts.map((p) => {
                        return {
                            label: p.publicTitle,
                            value: p.id,
                        };
                    })}
                    containerStyle={styles.dropdownContainer}
                    style={styles.dropdown}
                    dropDownStyle={styles.dropdown}
                    onChangeItem={(item) => setSelectedPodcast(item)}
                />
                <TextInput
                    style={styles.inputContainerStyle}
                    dense
                    label="Entry title"
                    placeholder="Type something"
                    value={podcastTitle}
                    onChangeText={(title) => setPodcastTitle(title)}
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
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                action={{
                    label: 'Undo',
                    onPress: () => {
                        // Do something
                    },
                }}
                duration={Snackbar.DURATION_MEDIUM}>
                {snackBarText}
            </Snackbar>
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
    subText: {
        marginBottom: 12,
    },
    dropdownContainer: {
        height: 40,
    },
    dropdown: {
        backgroundColor: '#fafafa',
    },
    inputContainerStyle: {
        margin: 8,
    },
    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flex: 3,
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
