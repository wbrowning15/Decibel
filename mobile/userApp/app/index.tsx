import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const LandingPage = () => {
  const router = useRouter();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <Image source={require('../assets/images/logo_sample.png')} style={styles.logo} />
          <Text style={styles.welcomeText}>Welcome to EventSphere</Text>
          <Text style={styles.blurb}>Little Blurb Here</Text>
          
          <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/eventList')}>
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
          
          <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
    fontFamily: 'Figtree-Regular'
  },
  blurb: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
    fontFamily: 'Figtree-Regular'
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
    justifyContent: 'center'
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Figtree-Regular'
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
    fontFamily: 'Figtree-Regular'
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

