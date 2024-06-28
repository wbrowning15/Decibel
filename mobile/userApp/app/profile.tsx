import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Image, ScrollView, FlatList, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

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

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setIsAnonymous(user.isAnonymous); // Check if the user is anonymous
        try {
          console.log('Fetching user data for UID:', user.uid);
          const docRef = doc(db, 'users', user.uid);
          console.log('Document reference:', docRef.path);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('User data:', data);
            setUserData(data);
            setUsername(data.username);
            setEmail(data.email);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No authenticated user found');
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateUsername = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, { username });
        alert('Username updated!');
      } catch (error) {
        console.error('Error updating username:', error);
      }
    }
  };
  const handleRegister = async() => {
    const user = auth.currentUser;//should be anonymous
    try {
      await signOut(auth);
      router.push('/signUp');
    }catch (error){
      console.error('Error registering w/email & pass:', error);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Assuming you have a login screen to navigate to
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Image source={require('../assets/images/userAvatar.png')} style={styles.profilePic} />
        </View>
        <View style={styles.usernameContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdateUsername}>
            <Text style={styles.buttonText}>Update Username</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Email: {email}</Text>
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
        {!isAnonymous && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
        {isAnonymous && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register w/ email</Text>
        </TouchableOpacity>
        )}
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
    width: '100%', // Add this line to make sure header takes full width
  },
  usernameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '80%',
  },
  button: {
    backgroundColor: '#511644',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
  signOutButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ProfileScreen;
