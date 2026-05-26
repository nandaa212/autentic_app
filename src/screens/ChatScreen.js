import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { sendLocalNotification } from '../utils/notifications';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Kirim notifikasi lokal saat ada pesan baru dari orang lain
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const msg = change.doc.data();
          if (msg.senderId !== user.uid) {
            sendLocalNotification(
              msg.senderEmail?.split('@')[0] || 'Seseorang',
              msg.text
            );
          }
        }
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      senderId: user.uid,
      senderEmail: user.email,
      timestamp: serverTimestamp(),
    });

    setText('');
    flatListRef.current?.scrollToEnd();
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === user.uid;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!isMe && (
          <Text style={styles.senderName}>{item.senderEmail?.split('@')[0]}</Text>
        )}
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          placeholderTextColor="#f9a8d4"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2d0a1e' },
  bgCircle1: {
    position: 'absolute', width: 250, height: 250,
    borderRadius: 125, backgroundColor: '#831843',
    top: -60, right: -60, opacity: 0.4,
  },
  bgCircle2: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, backgroundColor: '#9d174d',
    bottom: 80, left: -50, opacity: 0.3,
  },
  bubbleThem: {
    backgroundColor: '#4a1030',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#be185d',
  },
  bubbleMe: {
    backgroundColor: '#be185d',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubble: {
    maxWidth: '75%', padding: 12,
    borderRadius: 16, marginBottom: 8,
  },
  senderName: { fontSize: 11, color: '#f9a8d4', marginBottom: 4, fontWeight: '600' },
  messageText: { fontSize: 14, color: '#fce7f3' },
  messageTextMe: { color: '#fff' },
  inputRow: {
    flexDirection: 'row', padding: 12,
    backgroundColor: '#3d0b25', alignItems: 'center',
    borderTopWidth: 1, borderColor: '#be185d',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#be185d',
    borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, marginRight: 8,
    fontSize: 14, color: '#fce7f3', backgroundColor: '#4a1030',
  },
  sendBtn: {
    backgroundColor: '#be185d', paddingHorizontal: 18,
    paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#f472b6',
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});