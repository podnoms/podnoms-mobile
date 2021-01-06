import React from 'react';
import {useTheme} from '@react-navigation/native';
import {View, StyleSheet, StatusBar, ScrollView} from 'react-native';

import {Avatar, Banner, Card, IconButton, List, Text} from 'react-native-paper';

const EpisodeListScreen = ({route, navigation}) => {
    const [visible, setVisible] = React.useState<boolean>(true);
    const {
        colors: {background},
    } = useTheme();

    const {episodes} = route.params;

    const theme = useTheme();

    const switchView = (episodeId: string) => {
        console.log('EpisodeList', 'Switching View', episodeId);
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
            />
            <ScrollView style={{flex: 1, width: '100%', height: '100%'}}>
                {episodes && episodes.length !== 0 ? (
                    episodes.map((e) => (
                        <List.Item
                            key={e.id}
                            title={e.title}
                            description={`${e.strippedDescription || ''}\n${
                                e.createDate
                            }`}
                            onPress={() => switchView(e.id)}
                            left={() => (
                                <Avatar.Image source={{uri: e.thumbnailUrl}} />
                            )}
                        />
                    ))
                ) : (
                    <Card style={styles.card}>
                        <Card.Cover
                            style={styles.coverCardStyle}
                            source={require('../../../assets/logo.png')}
                        />
                        <Card.Title
                            title="No episodes found"
                            subtitle="... make sure to add some!!"
                            right={(props: any) => (
                                <IconButton
                                    {...props}
                                    icon="arrow-left-circle"
                                    onPress={() => {
                                        navigation.goBack();
                                    }}
                                />
                            )}
                        />
                    </Card>
                )}
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        margin: 4,
    },
    coverCardStyle: {
        height: 320,
    },
});

export default EpisodeListScreen;
