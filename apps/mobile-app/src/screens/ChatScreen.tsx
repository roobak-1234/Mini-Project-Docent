import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, User, ArrowLeft } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';

interface Props {
    navigation: NavigationProp<any>;
}

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    isSelf: boolean;
}

export default function ChatScreen({ navigation }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'Dr. Smith', text: 'Patient #2024-001 showing irregular heart rhythm.', timestamp: new Date(Date.now() - 1000 * 60 * 5), isSelf: true },
        { id: '2', sender: 'Dr. Jones', text: 'I see it. SpO2 is stable though. Let\'s monitor for another hour.', timestamp: new Date(Date.now() - 1000 * 60 * 2), isSelf: false },
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'Dr. Smith',
            text: inputText,
            timestamp: new Date(),
            isSelf: true
        };
        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#64748B" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.headerIcon}>
                        <User size={20} color="#66BB6A" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Cardiology Team Chat</Text>
                        <View style={styles.onlineStatus}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                        <Text style={styles.headerSubtitle}>Secure D2D Encrypted Channel</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                style={styles.chatContainer} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((msg) => (
                        <View key={msg.id} style={[
                            styles.messageContainer,
                            msg.isSelf ? styles.messageContainerSelf : styles.messageContainerOther
                        ]}>
                            <View style={[
                                styles.messageBubble,
                                msg.isSelf ? styles.messageBubbleSelf : styles.messageBubbleOther
                            ]}>
                                {!msg.isSelf && (
                                    <Text style={styles.senderName}>{msg.sender}</Text>
                                )}
                                <Text style={[
                                    styles.messageText,
                                    msg.isSelf ? styles.messageTextSelf : styles.messageTextOther
                                ]}>
                                    {msg.text}
                                </Text>
                                <Text style={[
                                    styles.messageTime,
                                    msg.isSelf ? styles.messageTimeSelf : styles.messageTimeOther
                                ]}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a secure message..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Send size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#66BB6A',
        marginRight: 6,
    },
    onlineText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#66BB6A',
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    messagesContent: {
        padding: 20,
    },
    messageContainer: {
        marginBottom: 16,
    },
    messageContainerSelf: {
        alignItems: 'flex-end',
    },
    messageContainerOther: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    messageBubbleSelf: {
        backgroundColor: '#3B82F6',
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    senderName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#66BB6A',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    messageTextSelf: {
        color: 'white',
    },
    messageTextOther: {
        color: '#475569',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 8,
        textAlign: 'right',
    },
    messageTimeSelf: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    messageTimeOther: {
        color: '#94A3B8',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 12,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#475569',
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
});