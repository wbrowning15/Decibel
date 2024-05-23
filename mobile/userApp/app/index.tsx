import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const LandingPage = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'your_logo_url_here' }} style={styles.logo} />
      <Text style={styles.welcomeText}>Welcome to EventSphere</Text>
      <Text style={styles.blurb}>Little Blurb Here</Text>
      
      <TouchableOpacity style={styles.continueButton}>
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
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blurb: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#800080',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 5,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    marginLeft: 10,
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

