import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useTheme} from '@react-navigation/native';
import {View, Text, StyleSheet, StatusBar, ScrollView} from 'react-native';
import {Avatar, Dialog} from 'react-native-paper';
// import {Button} from 'react-native-paper';
// import {Card} from 'react-native-paper';
// import {Title} from 'react-native-paper';
// import {Paragraph} from 'react-native-paper';

import {useDispatch} from 'react-redux';

import {List} from 'react-native-paper';
import {podcastActions} from '../../store/actions/podcastActions';
import {Podcast} from '../../model/Podcast';

const PodcastListScreen = ({navigation}) => {
    const theme = useTheme();
    const podcasts: Podcast[] = useSelector(
        (state) => state.podcastState.podcasts,
    );
    const dispatch = useDispatch();

    const switchView = (podcast: Podcast) => {
        navigation.navigate('EpisodeList', {episodes: podcast.episodes});
    };

    useEffect(() => {
        dispatch(podcastActions.getPodcasts());
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
            <ScrollView style={{flex: 1, width: '100%', height: '100%'}}>
                {podcasts !== [] && Array.isArray(podcasts) ? (
                    podcasts.map((p) => (
                        <List.Item
                            key={p.id}
                            title={p.title}
                            description={`${p.strippedDescription || ''}\n${
                                p.createDate
                            }`}
                            onPress={() => switchView(p)}
                            left={() => (
                                <Avatar.Image source={{uri: p.thumbnailUrl}} />
                            )}
                        />
                    ))
                ) : (
                    <Text>No Podcasts Found</Text>
                )}
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PodcastListScreen;
