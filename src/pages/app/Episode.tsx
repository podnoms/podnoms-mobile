import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import TrackPlayer, {usePlaybackState} from 'react-native-track-player';

import AudioPlayer from '../../components/audioPlayer/AudioPlayer';

const EpisodeScreen = ({route, navigation}) => {
    const {episode} = route.params;
    const playbackState = usePlaybackState();

    useEffect(() => {
        setup();
    }, []);

    async function setup() {
        await TrackPlayer.setupPlayer({});
        await TrackPlayer.updateOptions({
            stopWithApp: true,
            capabilities: [
                TrackPlayer.CAPABILITY_PLAY,
                TrackPlayer.CAPABILITY_PAUSE,
                TrackPlayer.CAPABILITY_STOP,
            ],
            compactCapabilities: [
                TrackPlayer.CAPABILITY_PLAY,
                TrackPlayer.CAPABILITY_PAUSE,
            ],
        });
    }

    async function togglePlayback() {
        const currentTrack = await TrackPlayer.getCurrentTrack();
        if (currentTrack == null) {
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: episode.id,
                url: episode.audioUrl,
                title: episode.title,
                artist: episode.userName,
                artwork: episode.imageUrl,
            });
            await TrackPlayer.play();
        } else {
            if (playbackState === TrackPlayer.STATE_PAUSED) {
                await TrackPlayer.play();
            } else {
                await TrackPlayer.pause();
            }
        }
    }
    return (
        <View style={styles.container}>
            <AudioPlayer
                style={styles.player}
                onTogglePlayback={togglePlayback}
            />
            <Text style={styles.state}>{getStateName(playbackState)}</Text>
            <Text style={styles.description}>{episode.description}</Text>
        </View>
    );
};
function getStateName(state) {
    switch (state) {
        case TrackPlayer.STATE_NONE:
            return 'None';
        case TrackPlayer.STATE_PLAYING:
            return 'Playing';
        case TrackPlayer.STATE_PAUSED:
            return 'Paused';
        case TrackPlayer.STATE_STOPPED:
            return 'Stopped';
        case TrackPlayer.STATE_BUFFERING:
            return 'Buffering';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    description: {
        width: '80%',
        marginTop: 20,
        textAlign: 'center',
    },
    player: {
        marginTop: 40,
    },
    state: {
        marginTop: 20,
    },
});
export default EpisodeScreen;
