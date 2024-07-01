// (tabs)/_layout.tsx
import React from 'react';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function EventLayout() {
  const { event } = useLocalSearchParams();

  return (
    <Tabs>
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" color={color} size={size} />
          ),
        }}
        initialParams={{ event }}
      />
      <Tabs.Screen
        name="attractions"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" color={color} size={size} />
          ),
        }}
        initialParams={{ event }}
      />
      <Tabs.Screen
        name="chatList"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" color={color} size={size} />
          ),
        }}
        initialParams={{ event }}
      />
      {/* <Tabs.Screen
        name="generalChat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" color={color} size={size} />
          ),
        }}
        initialParams={{ event }}
      /> */}
    </Tabs>
  );
}
