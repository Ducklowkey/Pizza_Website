import React, { useState } from 'react'
import './ChatWidget.css'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
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
                    <div className="message bot-message">
                        <div className="message-content">
                            <p>Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?</p>
                        </div>
                        <span className="message-time">Bây giờ</span>
                    </div>
                </div>
                <div className="chat-input-container">
                    <input 
                        type="text" 
                        placeholder="Nhập tin nhắn của bạn..." 
                        className="chat-input"
                    />
                    <button className="send-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatWidget

