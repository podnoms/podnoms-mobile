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

        if (route.name === 'Home') {
          iconName = focused ? 'logo-rss' : 'logo-rss';
        } else if (route.name === 'Debug') {
          iconName = focused ? 'bug-outline' : 'bug-outline';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    }}>
    <Tab.Screen name="Home" component={PodcastListScreen} />
    <Tab.Screen name="Settings" component={DebugScreen} />
  </Tab.Navigator>
);

export default MainTabScreen;

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
