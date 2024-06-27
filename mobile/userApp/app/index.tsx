import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth, db } from './firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const generateRandomUsername = (): string => {
  const adjectives = ["cool", "smart", "funny", "brave", "happy"];
  const nouns = ["panda", "tiger", "eagle", "lion", "fox"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}_${randomNoun}_${randomNumber}`;
};

const LandingPage: React.FC = () => {
  const router = useRouter();

  //Continue without signing in will still create firebase auth user, store random username and uid, registered = false
  const handleContinue = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Generate a random username
        const username = generateRandomUsername();

        // Store user in Firestore
        await setDoc(userDocRef, {
          uid: user.uid,
          username: username,
          registered: false,
        });

        // Store username locally
        await AsyncStorage.setItem('username', username);
      } else {
        const userData = userDoc.data();
        await AsyncStorage.setItem('username', userData.username);
      }

      router.push('/eventList');
    } catch (error) {
      console.error('Error continuing to event list:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Image source={require('../assets/images/logo_sample.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome to EventSphere</Text>
        <Text style={styles.blurb}>Little Blurb Here</Text>
        
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Event List</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signInButton}>
          <FontAwesome name="apple" size={24} color="black" />
          <Text style={styles.signInButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.signInButton}>
          <FontAwesome name="google" size={24} color="black" />
          <Text style={styles.signInButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/signIn')}>
          <FontAwesome name="envelope" size={24} color="black" />
          <Text style={styles.signInButtonText}>Sign in with Email</Text>
        </TouchableOpacity>
        
        <Text style={styles.signUpText}>
          Don't have an account? 
          <Text style={styles.signUpLink} onPress={() => router.push('/signUp')}> Sign Up</Text>
        </Text>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 218.65,
    height: 220.93,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'regular',
    marginBottom: 10,
    fontFamily: 'Figtree-Regular',
  },
  blurb: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
    fontFamily: 'Figtree-Regular',
  },
  continueButton: {
    width: 345,
    height: 56,
    backgroundColor: '#511644',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Figtree-Regular',
  },
  signInButton: {
    width: 345,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Figtree-Regular',
  },
  signUpText: {
    marginTop: 20,
    color: 'gray',
  },
  signUpLink: {
    color: '#800080',
  },
});

export default LandingPage;
