import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';

interface Message {
  userID: string;
  username: string;
  content: string;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const { event } = useLocalSearchParams();
  let eventObj = null;

  try {
    eventObj = JSON.parse(event as string);
  } catch (error) {
    console.error('Error parsing event JSON:', error);
    // Handle error (e.g., show an error message to the user)
  }

  if (!eventObj) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error: Invalid event data</Text>
      </SafeAreaView>
    );
  }

  const eventID = eventObj.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const initWebSocket = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        console.log('Firebase ID Token:', token);
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername);
        const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}&eventID=${eventID}`);

        ws.onopen = () => {
          console.log('WebSocket connection established');
          fetchMessages();
        };

        ws.onmessage = (event) => {
          console.log('Message received from server:', event.data);
          const newMessage: Message = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          flatListRef.current?.scrollToEnd({ animated: true });
        };

        ws.onerror = (error) => {
          console.log('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };

        setWs(ws);

        return () => {
          ws.close();
        };
      } else {
        console.log('No user is currently signed in');
      }
    };

    initWebSocket();
  }, [eventID]);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for event ID:', eventID);
      const messagesCollection = collection(db, 'events', eventID, 'messages');
      const q = query(messagesCollection, orderBy('timestamp'));
      const querySnapshot = await getDocs(q);
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        ...doc.data()
      })) as Message[];
      console.log('Fetched messages:', fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages: ', error);
    }
  };

  const sendMessage = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    const storedUsername = await AsyncStorage.getItem('username');
    if (message.trim() && ws && storedUsername && userId) {
      const msg = {
        UserID: userId,
        Username: storedUsername,
        Content: message,
        Timestamp: new Date().toISOString(),
      };
      console.log('Sending message:', JSON.stringify(msg));
      ws.send(JSON.stringify(msg));
      setMessage('');
    } else {
      console.log('Message is empty, WebSocket is not connected, username or userId is missing');
      console.log('userId:', userId, 'username:', storedUsername);
    }
  }, [message, ws, username]);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.message}>{item.content}</Text>
    </View>
  ), []);

  if (!auth.currentUser) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.signInText}>Sign in to use chat!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  signInText: {
    fontSize: 18,
    color: '#333',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatScreen;
