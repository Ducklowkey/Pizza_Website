import { useState, useContext, useRef, useEffect, useCallback } from 'react'
import './ChatWidget.css'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { url, token } = useContext(StoreContext);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && token) {
            // Load user messages when opening chat
            loadUserMessages();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load user messages from backend
    const loadUserMessages = useCallback(async () => {
        if (!token) return;

        try {
            // Get user email
            const userResponse = await axios.post(url + '/api/user/userdata', {}, { headers: { token } });
            if (userResponse.data.success && userResponse.data.data) {
                const email = userResponse.data.data.email;

                // Load messages with replies
                const messagesResponse = await axios.get(`${url}/api/message/user/list`, {
                    params: { email }
                });

                if (messagesResponse.data.success) {
                    // Convert to chat format
                    const chatMessages = [];
                    
                    messagesResponse.data.data.forEach(msg => {
                        // Add original message
                        chatMessages.push({
                            type: 'user',
                            content: msg.message,
                            time: new Date(msg.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                            date: new Date(msg.date),
                            messageId: msg._id
                        });

                        // Add replies from admin
                        if (msg.replies && msg.replies.length > 0) {
                            msg.replies.forEach(reply => {
                                if (reply.sender === 'Admin') {
                                    chatMessages.push({
                                        type: 'admin',
                                        content: reply.message,
                                        time: new Date(reply.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                        date: new Date(reply.date),
                                        messageId: msg._id // Link admin reply to the original message
                                    });
                                }
                            });
                        }
                    });

                    // Sort by date
                    chatMessages.sort((a, b) => {
                        return a.date - b.date;
                    });

                    // Remove date property before setting state
                    const formattedMessages = chatMessages.map(msg => {
                        // eslint-disable-next-line no-unused-vars
                        const { date, ...rest } = msg;
                        return rest;
                    });

                    // Check if there are any admin replies
                    const hasAdminReplies = formattedMessages.some(msg => msg.type === 'admin');

                    // Get current messages and remove temporary bot messages if admin has replied
                    setMessages(prev => {
                        // Remove temporary bot messages if admin has replied
                        const filteredPrev = prev.filter(msg => {
                            // Keep temporary bot messages only if there's no admin reply yet
                            if (msg.isTemporary && msg.type === 'bot') {
                                // Check if this message has an admin reply
                                const messageId = msg.messageId;
                                if (messageId) {
                                    const hasReply = formattedMessages.some(fMsg => 
                                        fMsg.messageId === messageId && fMsg.type === 'admin'
                                    );
                                    return !hasReply; // Remove if has reply
                                }
                                return !hasAdminReplies; // Remove if any admin has replied
                            }
                            return true; // Keep all other messages
                        });

                        // Add welcome message if no messages
                        if (formattedMessages.length === 0) {
                            return [{
                                type: 'bot',
                                content: 'Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?',
                                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            }];
                        }

                        // Merge filtered previous messages with new formatted messages
                        // Remove duplicates based on content and type
                        const mergedMessages = [...filteredPrev];
                        
                        formattedMessages.forEach(newMsg => {
                            // Check if message already exists (avoid duplicates)
                            const exists = mergedMessages.some(existingMsg => 
                                existingMsg.type === newMsg.type &&
                                existingMsg.content === newMsg.content &&
                                existingMsg.time === newMsg.time
                            );
                            if (!exists) {
                                mergedMessages.push(newMsg);
                            }
                        });

                        // Sort merged messages by time
                        mergedMessages.sort((a, b) => {
                            const timeA = a.time || '';
                            const timeB = b.time || '';
                            return timeA.localeCompare(timeB);
                        });

                        // Check if welcome message already exists
                        const hasWelcome = mergedMessages.some(msg => 
                            msg.type === 'bot' && msg.content.includes('Xin chào')
                        );
                        
                        if (!hasWelcome) {
                            return [{
                                type: 'bot',
                                content: 'Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?',
                                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            }, ...mergedMessages];
                        }
                        
                        return mergedMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading user messages:', error);
        }
    }, [token, url]);

    // Poll for new replies when chat is open
    useEffect(() => {
        if (!isOpen || !token) return;

        const interval = setInterval(() => {
            loadUserMessages();
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isOpen, token, loadUserMessages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const messageContent = inputMessage.trim();
        const userMessage = {
            type: 'user',
            content: messageContent,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            // Get user info from token if available
            let name = 'Anonymous';
            let email = '';
            let phone = '';
            
            if (token) {
                try {
                    const userResponse = await axios.post(url + '/api/user/userdata', {}, { headers: { token } });
                    if (userResponse.data.success && userResponse.data.data) {
                        name = userResponse.data.data.name || 'Anonymous';
                        email = userResponse.data.data.email || '';
                        phone = userResponse.data.data.phone || '';
                        console.log('User info loaded:', { name, email, phone });
                    }
                } catch (error) {
                    console.log('Error fetching user data:', error);
                    // Continue with Anonymous if error
                }
            } else {
                console.log('No token found, sending as Anonymous');
            }

            // Send message to backend
            const response = await axios.post(url + '/api/message/add', {
                name: name,
                email: email,
                phone: phone,
                message: messageContent
            });
            
            console.log('Message sent with user info:', { name, email, message: messageContent });

            if (response.data.success) {
                // Add temporary bot response (will be replaced when admin replies)
                const botMessage = {
                    type: 'bot',
                    content: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể. 😊',
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    isTemporary: true, // Mark as temporary
                    messageId: response.data.data?._id // Link to the message ID
                };
                setMessages(prev => [...prev, botMessage]);
                
                // Reload messages to get updated list
                if (token) {
                    setTimeout(() => {
                        loadUserMessages();
                    }, 1000);
                }
            } else {
                toast.error('Không thể gửi tin nhắn. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Có lỗi xảy ra khi gửi tin nhắn!');
            
            // Still add temporary bot response for better UX
            const botMessage = {
                type: 'bot',
                content: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể. 😊',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                isTemporary: true // Mark as temporary
            };
            setMessages(prev => [...prev, botMessage]);
        }
    };

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
            {/* Chat Button */}
            <button 
                className="chat-button" 
                onClick={toggleChat}
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10H16M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </button>

            {/* Chat Panel */}
            <div className="chat-panel">
                <div className="chat-header">
                    <h3>Chat với chúng tôi</h3>
                    <button 
                        className="close-chat-button" 
                        onClick={toggleChat}
                        aria-label="Close Chat"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${
                            message.type === 'user' ? 'user-message' : 
                            message.type === 'admin' ? 'admin-message' : 
                            'bot-message'
                        }`}>
                            <div className="message-content">
                                <p>{message.content}</p>
                            </div>
                            <span className="message-time">{message.time}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input-container" onSubmit={sendMessage}>
                    <input 
                        type="text" 
                        placeholder="Nhập tin nhắn của bạn..." 
                        className="chat-input"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatWidget

