import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import {
    ActivityIndicator,
    Banner,
    Button,
    Colors,
    Snackbar,
    Text,
    TextInput,
} from 'react-native-paper';
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
import ProcessingProgressControl from '../../components/ProcessingProgressControl';

const SharingScreen = (props) => {
    const {colors} = useTheme();
    const podcasts = useSelector((state) => state.podcastState.podcasts);
    const [processMessage, setProcessMessage] = useState<string>(
        'Ready to upload',
    );
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [selectedPodcast, setSelectedPodcast] = useState<any>();
    const [isProcessingPodcast, setIsProcessingPodcast] = useState<boolean>(
        false,
    );
    const [isAwaitingProgress, setIsAwaitingProgress] = useState<boolean>(
        false,
    );

    const [podcastTitle, setPodcastTitle] = useState<string>(
        props.sourceTitle || 'New from PodNoms Mobile',
    );
    const [snackBarVisible, setSnackBarVisible] = useState<boolean>(false);
    const [snackBarText, setSnackBarText] = useState<string>(
        'New from PodNoms Mobile',
    );
    const [episodeId, setEpisodeId] = useState<string>('');
    const [episodeProcessed, setEpisodeProcessed] = useState<boolean>(false);

    const dispatch = useDispatch();

    const sendToPodcast = async () => {
        try {
            if (!selectedPodcast) {
                setSnackBarText('Please select a Podcast first');
                setSnackBarVisible(true);
                return;
            }
            console.log('Sharing', 'sendToPodacst', 'Creating service');
            const service = new PodcastService();
            console.log(
                'Sharing',
                'sendToPodacst',
                'Validatating',
                props.shareUrl,
            );
            console.log(
                'Sharing',
                'sendToPodacst',
                'Validatating',
                'URL is valid',
            );
            const episode = await service.addPodcastEntry(
                selectedPodcast.value,
                props.shareUrl,
                podcastTitle,
            );
            if (episode && episode.id) {
                setProcessMessage('Waiting for server processing');
                setEpisodeId(episode.id);
                setIsAwaitingProgress(true);
            }
        } catch (err) {
            console.log('Sharing', 'Error creating entry', err);
            setSnackBarText('Unable to add this entry at this time!');
            setSnackBarVisible(true);
            setIsProcessingPodcast(false);
            setIsAwaitingProgress(false);
        }
    };

    useEffect(() => {
        async function checkForValidUrl(url) {
            const service = new PodcastService();
            const valid = await service.validateUrl(url);
            if (!valid) {
                console.log(
                    'Sharing',
                    'sendToPodacst',
                    'Validatating',
                    'URL is not valid',
                );
                setSnackBarText("This doesn't look like a URL we can manage!");
                setSnackBarVisible(true);
                setIsValidUrl(false);
            }
        }
        if (props.shareUrl) {
            checkForValidUrl(props.shareUrl);
        }
    }, [props.shareUrl]);

    useEffect(() => {
        dispatch(podcastActions.getPodcasts());
    }, [dispatch]);

    const gemmeOuttaHere = () => {
        navigate('DefaultApp', null);
    };

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
                    dropDownMaxHeight={styles.dropdown.height}
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
                {!isAwaitingProgress && !episodeProcessed ? (
                    <Button
                        style={styles.button}
                        color={colors.accent}
                        mode="contained"
                        loading={isProcessingPodcast}
                        disabled={
                            isProcessingPodcast ||
                            isAwaitingProgress ||
                            episodeProcessed
                        }
                        onPress={() => {
                            setIsProcessingPodcast(true);
                            setTimeout(() => {
                                sendToPodcast();
                            });
                        }}>
                        Send 2 PodNoms
                    </Button>
                ) : null}
                <View style={styles.progressArea}>
                    <ProcessingProgressControl
                        processMessage={processMessage}
                        onEpisodeProcessed={() => {
                            setIsAwaitingProgress(false);
                            setEpisodeProcessed(true);
                        }}
                        episodeId={episodeId}
                    />
                </View>
                <Banner
                    actions={[
                        {
                            label: 'OK',
                            onPress: () => gemmeOuttaHere(),
                        },
                    ]}
                    icon={require('../../../assets/happy-bot.png')}
                    visible={episodeProcessed}>
                    Episode succesfully sent to PodNoms!
                </Banner>
            </Animatable.View>
            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                action={{
                    label: 'Ok',
                    onPress: () => {
                        setSnackBarVisible(false);
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
        height: 320,
    },
    inputContainerStyle: {
        margin: 8,
    },
    header: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressArea: {
        flex: 2,
        paddingVertical: 10,
        paddingHorizontal: 10,
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
