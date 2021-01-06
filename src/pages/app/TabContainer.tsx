import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import Icon from 'react-native-vector-icons/Ionicons';
import PodcastListScreen from './PodcastList';
import DebugScreen from '../Debug';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {StyleSheet} from 'react-native';
import EpisodeListScreen from './EpisodeList';

const PodcastListStack = createStackNavigator();
const DetailsStack = createStackNavigator();

const Tab = createMaterialBottomTabNavigator();

const MainTabScreen = () => (
    <Tab.Navigator initialRouteName="Podcasts" activeColor="#fff">
        <Tab.Screen
            name="Podcasts"
            component={PodcastListStackScreen}
            options={{
                tabBarLabel: 'Podcasts',
                tabBarColor: '#009387',
                tabBarIcon: ({color}) => (
                    <Icon name="logo-rss" color={color} size={26} />
                ),
            }}
        />
        <Tab.Screen
            name="Debug"
            component={DebugStackScreen}
            options={{
                tabBarLabel: 'Debug',
                tabBarColor: '#009387',
                tabBarIcon: ({color}) => (
                    <Icon name="bug-outline" color={color} size={26} />
                ),
            }}
        />
    </Tab.Navigator>
);

const PodcastListStackScreen = ({navigation}) => (
    <PodcastListStack.Navigator screenOptions={screenOptions}>
        <PodcastListStack.Screen
            name="PodcastList"
            component={PodcastListScreen}
            options={{
                headerLeft: () => (
                    <Icon.Button
                        name="ios-menu"
                        size={25}
                        backgroundColor="#009387"
                        onPress={() => navigation.openDrawer()}
                    />
                ),
            }}
        />
        <PodcastListStack.Screen
            name="EpisodeList"
            component={EpisodeListScreen}
            options={{
                headerLeft: () => (
                    <Icon.Button
                        name="ios-menu"
                        size={25}
                        backgroundColor="#009387"
                        onPress={() => navigation.openDrawer()}
                    />
                ),
            }}
        />
    </PodcastListStack.Navigator>
);

const DebugStackScreen = ({navigation}) => (
    <DetailsStack.Navigator screenOptions={screenOptions}>
        <DetailsStack.Screen
            name="Debug"
            component={DebugScreen}
            options={{
                headerLeft: () => (
                    <Icon.Button
                        name="ios-menu"
                        size={25}
                        backgroundColor="#009387"
                        onPress={() => navigation.openDrawer()}></Icon.Button>
                ),
            }}
        />
    </DetailsStack.Navigator>
);
const screenOptions = {
    headerStyle: {
        backgroundColor: '#009387',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
        fontWeight: 'bold',
    },
};
export default MainTabScreen;
