import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import Icon from 'react-native-vector-icons/Ionicons';
import PodcastListScreen from './PodcastList';
import DebugScreen from '../Debug';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const PodcastListStack = createStackNavigator();
const DetailsStack = createStackNavigator();

const Tab = createBottomTabNavigator();

const MainTabScreen = () => (
    <Tab.Navigator
        screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
                let iconName;
                if (route.name === 'Podcasts') {
                    iconName = focused ? 'ios-menu' : 'ios-menu';
                } else if (route.name === 'Debug') {
                    iconName = focused ? 'ios-menu' : 'ios-menu';
                }
                return <Icon name={iconName} size={size} color={color} />;
            },
        })}
        tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
        }}>
        <Tab.Screen name="Podcasts" component={PodcastListStackScreen} />
        <Tab.Screen name="Debug" component={DebugStackScreen} />
    </Tab.Navigator>
);

const PodcastListStackScreen = ({navigation}) => (
    <PodcastListStack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: '#009387',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>
        <PodcastListStack.Screen
            name="PodcastList"
            component={PodcastListScreen}
            options={{
                title: 'Podcasts',
                headerLeft: () => (
                    <Icon.Button
                        name="ios-menu"
                        size={25}
                        backgroundColor="#009387"
                        onPress={() => navigation.openDrawer()}></Icon.Button>
                ),
            }}
        />
    </PodcastListStack.Navigator>
);

const DebugStackScreen = ({navigation}) => (
    <DetailsStack.Navigator
        screenOptions={{
            headerStyle: {
                backgroundColor: '#1f65ff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }}>
        <DetailsStack.Screen
            name="Debug"
            component={DebugScreen}
            options={{
                headerLeft: () => (
                    <Icon.Button
                        name="bug-outline"
                        size={25}
                        backgroundColor="#009387"
                        onPress={() => navigation.openDrawer()}></Icon.Button>
                ),
            }}
        />
    </DetailsStack.Navigator>
);
export default MainTabScreen;
