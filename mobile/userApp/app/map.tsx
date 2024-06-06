import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

type POIType = 'restroom' | 'stage' | 'concessions';

interface POI {
  id: string;
  name: string;
  description: string;
  type: POIType;
  x: number; // X coordinate on the map
  y: number; // Y coordinate on the map
}

type Event = {
  id: string;
  title: string;
  date: string;
  image: ImageSourcePropType;
  map: ImageSourcePropType;
  status: 'mine' | 'all';
};

type RootStackParamList = {
  Map: { event: string };
  EventDetails: { event: string };
};

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const MapScreen = () => {
  const route = useRoute<MapScreenRouteProp>();
  const event = route.params?.event ? JSON.parse(route.params.event) : null;
  const navigation = useNavigation();

  console.log('Received event:', event);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No event data available</Text>
      </SafeAreaView>
    );
  }

  const mapImage = event.map;

  const POIs: POI[] = [
    { id: '1', name: 'Main Stage', description: 'Main stage where the headline acts perform', type: 'stage', x: 100, y: 200 },
    { id: '2', name: 'Food Court', description: 'Various food stands and trucks', type: 'concessions', x: 300, y: 400 },
    { id: '3', name: 'Restrooms', description: 'Public restrooms', type: 'restroom', x: 150, y: 600 },
    // Customize POIs based on the event
  ];

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      scale.value = withTiming(1);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handlePOIPress = (poi: POI) => {
    // Handle POI press, show details
    alert(`${poi.name}\n${poi.description}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
        <Animated.View style={[styles.mapContainer, animatedStyle]}>
          <Image source={mapImage} style={styles.map} resizeMode="contain" />
          <View style={styles.overlay}>
            {POIs.map((poi) => (
              <TouchableOpacity key={poi.id} onPress={() => handlePOIPress(poi)} style={[styles.poiContainer, { top: poi.y, left: poi.x }]}>
                <View style={[styles.poi, poiStyles[poi.type] as any]} />
                <Text style={styles.poiLabel}>{poi.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const poiStyles = StyleSheet.create({
  stage: {
    backgroundColor: 'blue',
    borderRadius: 10,
    width: 20,
    height: 20,
  },
  concessions: {
    backgroundColor: 'green',
    width: 20,
    height: 20,
  },
  restroom: {
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    zIndex: 1,
    padding: 10,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  poiContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  poi: {
    width: 20,
    height: 20,
  },
  poiLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default MapScreen;
