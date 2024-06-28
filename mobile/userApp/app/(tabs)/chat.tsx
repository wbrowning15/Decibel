import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { auth, db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface Message {
  userID: string;
  username: string;
  content: string;
  timestamp: any;
}

const ChatScreen: React.FC = () => {
  const { event } = useLocalSearchParams();
  let eventObj = null;

  try {
    eventObj = JSON.parse(event as string);
  } catch (error) {
    console.error('Error parsing event JSON:', error);
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
      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
        } as Message;
      });
      console.log('Fetched messages:', fetchedMessages);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    const storedUsername = await AsyncStorage.getItem('username');
    if (message.trim() && ws && storedUsername && userId) {
      const msg = {
        userID: userId,
        username: storedUsername,
        content: message,
        timestamp: new Date().toISOString(),
      };
      console.log('Sending message:', JSON.stringify(msg));
      ws.send(JSON.stringify(msg));
      setMessage('');
    } else {
      console.log('Message is empty, WebSocket is not connected, username or userId is missing');
      console.log('userId:', userId, 'username:', storedUsername);
    }
  }, [message, ws, username]);

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={[styles.messageContainer, item.userID === auth.currentUser?.uid ? styles.sentMessage : styles.receivedMessage]}>
        <View style={styles.messageHeader}>
          <Image source={{ uri: 'https://via.placeholder.com/40' }} style={styles.avatar} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <Text style={styles.message}>{item.content}</Text>
        <Text style={styles.timestamp}>{date.toLocaleTimeString()}</Text>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#1a1a1a"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <FontAwesome name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c2b1f0',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
  },
  signInText: {
    fontSize: 18,
    color: '#fff',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  sentMessage: {
    backgroundColor: '#4f72f1',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#2a2a2a',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    color: '#fff',
  },
  message: {
    fontSize: 16,
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#bbb',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#c2b1f0',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    color: '#000000',
    marginRight: 10,
    backgroundColor: '#f5a4d5',
  },
  sendButton: {
    backgroundColor: '#4f72f1',
    padding: 10,
    borderRadius: 25,
  },
});

export default ChatScreen;
