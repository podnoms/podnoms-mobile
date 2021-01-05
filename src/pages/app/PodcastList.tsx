import React from 'react';
import {useSelector} from 'react-redux';
import {useTheme} from '@react-navigation/native';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import {List} from 'react-native-paper';
import {Avatar} from 'react-native-paper';

const PodcastListScreen = () => {
  const theme = useTheme();
  const podcasts = useSelector((state) => state.podcastState.podcasts);
  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      {podcasts !== [] && Array.isArray(podcasts) ? (
        podcasts.map((p) => (
          <List.Item
            key={p.id}
            title={p.publicTitle}
            description={`${p.strippedDescription}\n${p.createDate}`}
            left={() => <Avatar.Image source={{uri: p.thumbnailUrl}} />}
          />
        ))
      ) : (
        <Text>No Podcasts Found</Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PodcastListScreen;
