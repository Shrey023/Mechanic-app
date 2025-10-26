import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';


export default function ChatScreen({ route }) {
  const { bookingId, customerId } = route.params;
  const scheme = useColorScheme();

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi, mechanic here!', sender: 'mechanic' },
    { id: '2', text: 'Hello! My car broke down', sender: 'customer' },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'mechanic',
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'mechanic'
          ? styles.mechanicBubble
          : styles.customerBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          {
            color:
              item.sender === 'mechanic'
                ? '#fff'
                : scheme === 'dark'
                ? '#eee'
                : '#000',
          },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  const isDark = scheme === 'dark';

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#f2f2f2' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: isDark ? '#1E1E1E' : '#fff' },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#2c2c2c' : '#f9f9f9',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#444' : '#ddd',
            },
          ]}
          placeholder="Type a message"
          placeholderTextColor={isDark ? '#aaa' : '#888'}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: {
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '75%',
  },
  mechanicBubble: {
    backgroundColor: '#007BFF',
    alignSelf: 'flex-end',
  },
  customerBubble: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    borderRadius: 25,
    height: 40,
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 25,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
