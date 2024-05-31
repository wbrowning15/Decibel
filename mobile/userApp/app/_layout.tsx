import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from "expo-router";

const loadFonts  = async() => {
  await Font.loadAsync({
    'Figtree-Regular' : require('../assets/fonts/Figtree-Regular.ttf')
  });
};

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function fetchFonts() {
      await loadFonts();
      setFontsLoaded(true);
    }

    fetchFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator/>
      </View>
    )
  }
  
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }}/>
        <Stack.Screen name="eventList" options={{ headerShown: false }}/>
        <Stack.Screen name="profile" options={{ headerShown: false }}/>
      </Stack>
    </SafeAreaProvider>  
  );
}
