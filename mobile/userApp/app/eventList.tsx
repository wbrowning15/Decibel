import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { db } from './firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

type Event = {
  id: string;
  title: string;
  dateString: string;
  image: string;
  map: string;
  status: 'mine' | 'all';
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const router = useRouter();

  const handleViewPress = () => {
    const eventStr = JSON.stringify(event);
    console.log('Navigating to event tabs with event:', event);
    router.push({
      pathname: '/(tabs)/map',
      params: { event: eventStr },
    });
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: event.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <View style={styles.textWrapper}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{event.dateString}</Text>
          </View>
          <TouchableOpacity onPress={handleViewPress} style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const EventListScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedTab, setSelectedTab] = useState<'mine' | 'all'>('mine');
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const q = query(eventsCollection, orderBy('id'));
        const eventSnapshot = await getDocs(q);
        const eventList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setEvents(eventList);
      } catch (error) {
        console.error('Error fetching events: ', error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => event.status === selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {selectedTab === 'all' && (
          <FontAwesome name="search" size={24} color="black" style={styles.searchIcon} />
        )}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, selectedTab === 'mine' && styles.activeTab]} onPress={() => setSelectedTab('mine')}>
              <Text style={[styles.tabText, selectedTab === 'mine' && styles.activeTabText]}>My Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, selectedTab === 'all' && styles.activeTab]} onPress={() => setSelectedTab('all')}>
              <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>All Events</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.userIconContainer}>
          <FontAwesome name="user-circle" size={32} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.eventList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
  },
  tabsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabs: {
    flexDirection: 'row',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Figtree-Regular'
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Figtree-bold'
  },
  eventList: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    padding: 16
  },
  cardImage: {
    width: '100%',
    height: 310,
    borderRadius: 12
  },
  cardContent: {
    padding: 16,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -14,
  },
  textWrapper: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Figtree-Regular'
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Figtree-regular'
  },
  viewButton: {
    backgroundColor: '#511644',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginRight: -14,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Figtree-Regular'
  },
  userIconContainer: {
    position: 'absolute',
    right: 16
  }
});

export default EventListScreen;
