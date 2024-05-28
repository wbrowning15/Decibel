import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, FlatList, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

type Friend = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
};

const friends: Friend[] = [
  { id: '1', name: 'Anush', avatar: require('../assets/images/avatar1.png') },
  { id: '2', name: 'Kyle', avatar: require('../assets/images/avatar2.png') },
  { id: '3', name: 'Rajvir', avatar: require('../assets/images/avatar3.png') },
  // Add more friends here
];

const ProfileScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Image source={require('../assets/images/userAvatar.png')} style={styles.profilePic} />
          <Text style={styles.username}>Username: johndoe</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Email: johndoe@example.com</Text>
          <Text style={styles.infoText}>Password: ••••••••</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>123</Text>
            <Text style={styles.statLabel}>Contributions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>456</Text>
            <Text style={styles.statLabel}>Upvotes</Text>
          </View>
        </View>
        <Text style={styles.friendsTitle}>Friends</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friend}>
              <Image source={item.avatar} style={styles.friendAvatar} />
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  friendsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendsList: {
    paddingHorizontal: 16,
  },
  friend: {
    alignItems: 'center',
    marginRight: 20,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  friendName: {
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 16,
  },
});

export default ProfileScreen;

