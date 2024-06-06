import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function EventLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="map" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="attractions"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="star" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
