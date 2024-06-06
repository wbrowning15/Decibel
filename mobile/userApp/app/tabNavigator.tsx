import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import MapScreen from './map';
import AttractionsScreen from './attractions';
import ChatScreen from './chat';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="map" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Attractions"
      component={AttractionsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="star" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="comments" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default TabNavigator;
