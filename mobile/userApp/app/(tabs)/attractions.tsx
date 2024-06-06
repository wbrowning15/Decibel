import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
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
  image: any;
  map: any;
  status: 'mine' | 'all';
};

const AttractionsScreen = () => {
  const { event } = useLocalSearchParams();
  console.log(event);
  const eventParsed: Event = event ? JSON.parse(event as string) : null;
  const navigation = useNavigation();

  if (!eventParsed) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No event data available</Text>
      </SafeAreaView>
    );
  }

  const POIs: POI[] = [
    { id: '1', name: 'Main Stage', description: 'Main stage where the headline acts perform', type: 'stage', x: 100, y: 200 },
    { id: '2', name: 'Food Court', description: 'Various food stands and trucks', type: 'concessions', x: 300, y: 400 },
    { id: '3', name: 'Restrooms', description: 'Public restrooms', type: 'restroom', x: 150, y: 600 },
    // Add more POIs based on the event
  ];

  // Group POIs by type
  const groupedPOIs = POIs.reduce((groups: { [key in POIType]: POI[] }, poi) => {
    if (!groups[poi.type]) {
      groups[poi.type] = [];
    }
    groups[poi.type].push(poi);
    return groups;
  }, { restroom: [], stage: [], concessions: [] });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        data={Object.entries(groupedPOIs)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [type, pois] = item;
          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              {pois.map(poi => (
                <View key={poi.id} style={styles.card}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                  <Text style={styles.poiDescription}>{poi.description}</Text>
                </View>
              ))}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

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
  list: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  poiName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AttractionsScreen;
