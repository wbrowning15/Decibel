import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

interface Chatroom {
  chatroomId: string;
  chatroomType: string;
  name: string;
}

const ChatList: React.FC = () => {
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const { event } = useLocalSearchParams();
  let eventObj = null;
  const router = useRouter();

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

  useEffect(() => {
    const fetchChatrooms = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData && userData.chatrooms) {
              const chatroomIds = userData.chatrooms as string[];
              const chatroomsData = await Promise.all(
                chatroomIds.map(async (chatroomId) => {
                  const chatroomDoc = await getDoc(doc(db, 'chatrooms', chatroomId));
                  if (chatroomDoc.exists()) {
                    const chatroomData = chatroomDoc.data();
                    return {
                      chatroomId: chatroomId,
                      chatroomType: chatroomData?.chatroomType || 'unknown',
                      name: chatroomData?.name || 'Unnamed',
                    };
                  }
                  return null;
                })
              );
              setChatrooms(chatroomsData.filter((chatroom): chatroom is Chatroom => chatroom !== null));
            }
          }
        } catch (error) {
          console.error('Error fetching chatrooms:', error);
        }
      }
    };

    fetchChatrooms();
  }, []);

  const navigateToChat = (chatroomId: string, chatroomType: string) => {
    if (chatroomType === 'general') {
      router.push({
        pathname: '/generalChat',
        params: { id: chatroomId },
      });
    } else if (chatroomType === 'direct') {
      router.push({
        pathname: '/directMessageChat',
        params: { id: chatroomId },
      });
    } else if (chatroomType === 'group') {
      fetchGroupMembers(chatroomId).then((members) => {
        router.push({
          pathname: '/groupChat',
          params: { chatroomId: chatroomId, members: members },
        });
      });
    }
  };

  const fetchGroupMembers = async (chatroomId: string): Promise<string[]> => {
    try {
      const chatroomDoc = await getDoc(doc(db, 'chatrooms', chatroomId));
      if (chatroomDoc.exists()) {
        const chatroomData = chatroomDoc.data();
        if (chatroomData && chatroomData.members) {
          const memberIds = chatroomData.members as string[];
          return memberIds;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  const renderChatroom = ({ item }: { item: Chatroom }) => (
    <TouchableOpacity style={styles.chatroomContainer} onPress={() => navigateToChat(item.chatroomId, item.chatroomType)}>
      <Text style={styles.chatroomName}>{item.name}</Text>
      <Text style={styles.chatroomType}>{item.chatroomType}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chatrooms}
        keyExtractor={item => item.chatroomId}
        renderItem={renderChatroom}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatList: {
    padding: 10,
  },
  chatroomContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  chatroomName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatroomType: {
    fontSize: 14,
    color: '#888',
  },
});

export default ChatList;
