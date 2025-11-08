import { useState, useEffect, useCallback, Fragment } from 'react'
import './Messages.css'
import { url } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Messages = () => {
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmails, setSelectedEmails] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [messages, setMessages] = useState([])
  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    starred: 0,
    sent: 0,
    draft: 0,
    spam: 0,
    important: 0,
    bin: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyInput, setReplyInput] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const emailsPerPage = 12

  // Email folders data
  const emailFolders = [
    { id: 'inbox', name: 'Inbox', icon: 'mail', count: folderCounts.inbox },
    { id: 'starred', name: 'Starred', icon: 'star', count: folderCounts.starred },
    { id: 'sent', name: 'Sent', icon: 'send', count: folderCounts.sent },
    { id: 'draft', name: 'Draft', icon: 'edit', count: folderCounts.draft },
    { id: 'spam', name: 'Spam', icon: 'warning', count: folderCounts.spam },
    { id: 'important', name: 'Important', icon: 'notifications', count: folderCounts.important },
    { id: 'bin', name: 'Bin', icon: 'delete', count: folderCounts.bin }
  ]

  // Fetch messages from backend
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
      }
      const response = await axios.get(`${url}/api/message/list`, {
        params: {
          folder: selectedFolder,
          search: searchQuery
        }
      })
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      if (!silent) {
        toast.error('Không thể tải messages')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [selectedFolder, searchQuery])

  // Fetch folder counts
  const fetchFolderCounts = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/message/counts`)
      if (response.data.success) {
        setFolderCounts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }, [])

  // Fetch single message with replies
  const fetchMessage = useCallback(async (messageId) => {
    try {
      const response = await axios.get(`${url}/api/message/${messageId}`)
      if (response.data.success) {
        setSelectedMessage(response.data.data)
        fetchFolderCounts() // Update counts after marking as read
      }
    } catch (error) {
      console.error('Error fetching message:', error)
      toast.error('Không thể tải message')
    }
  }, [fetchFolderCounts])

  // Fetch all messages from a user (conversation view)
  const fetchUserConversation = useCallback(async (email, name) => {
    try {
      const response = await axios.get(`${url}/api/message/user/conversation`, {
        params: email ? { email } : { name }
      })
      if (response.data.success) {
        // Set the most recent message as selectedMessage for header info
        const messages = response.data.data
        if (messages.length > 0) {
          const latestMessage = messages[messages.length - 1]
          setSelectedMessage({
            ...latestMessage,
            conversationMessages: messages // Store all messages for conversation view
          })
        }
        fetchFolderCounts()
      }
    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast.error('Không thể tải conversation')
    }
  }, [fetchFolderCounts])

  useEffect(() => {
    fetchMessages()
    fetchFolderCounts()
  }, [fetchMessages, fetchFolderCounts])

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refresh - don't show loading
      fetchMessages(true)
      fetchFolderCounts()
      
      // If a conversation is open, refresh it to get new messages from the same user
      if (selectedMessage) {
        const email = selectedMessage.email
        const name = selectedMessage.name
        if (email || name) {
          fetchUserConversation(email, name)
        } else if (selectedMessage._id) {
          // Fallback to single message if no email/name
          fetchMessage(selectedMessage._id)
        }
      }
    }, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMessages, fetchFolderCounts, fetchUserConversation, fetchMessage, selectedMessage?.email, selectedMessage?.name, selectedMessage?._id])

  // Format time from date
  const formatTime = (dateString) => {
    if (!dateString) return ''
    try {
      // Parse date string to Date object
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return ''
      }
      // Format according to Vietnam timezone (UTC+7)
      // MongoDB stores dates in UTC, so we need to convert to Vietnam time
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      })
    } catch (error) {
      console.error('Error formatting time:', error, dateString)
      return ''
    }
  }

  // Get label color class
  const getLabelColor = (label) => {
    const labelMap = {
      'Primary': 'primary',
      'Work': 'work',
      'Friends': 'friends',
      'Social': 'social'
    }
    return labelMap[label] || 'primary'
  }

  // Filter messages to show only the latest message from each user
  const getLatestMessagesFromUsers = (messagesList) => {
    if (selectedFolder !== 'inbox') {
      // For other folders, return all messages
      return messagesList
    }
    
    // For inbox, group by user (email or name) and get latest message
    const userMessagesMap = new Map()
    
    messagesList.forEach(msg => {
      // Use email as key if available, otherwise use name
      const userKey = msg.email || msg.name || 'anonymous'
      
      if (!userMessagesMap.has(userKey)) {
        userMessagesMap.set(userKey, msg)
      } else {
        // Compare dates and keep the latest one
        const existingMsg = userMessagesMap.get(userKey)
        const existingDate = new Date(existingMsg.date)
        const currentDate = new Date(msg.date)
        
        if (currentDate > existingDate) {
          userMessagesMap.set(userKey, msg)
        }
      }
    })
    
    // Convert map back to array and sort by date (newest first)
    return Array.from(userMessagesMap.values()).sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })
  }

  // Get filtered messages (only latest from each user for inbox)
  const filteredMessages = getLatestMessagesFromUsers(messages)

  // Paginated emails
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  )
  const totalPages = Math.ceil(filteredMessages.length / emailsPerPage)

  const handleSelectEmail = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmails.length === paginatedMessages.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(paginatedMessages.map(msg => msg._id))
    }
  }

  const toggleStar = async (messageId, currentStarred) => {
    try {
      const response = await axios.post(`${url}/api/message/updatestarred`, {
        messageId,
        starred: !currentStarred
      })
      if (response.data.success) {
        fetchMessages()
        fetchFolderCounts()
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      toast.error('Không thể cập nhật star')
    }
  }

  const handleDelete = async (messageId) => {
    try {
      const response = await axios.post(`${url}/api/message/delete`, {
        messageId
      })
      if (response.data.success) {
        toast.success('Đã xóa message')
        fetchMessages()
        fetchFolderCounts()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Không thể xóa message')
    }
  }

  // Delete multiple messages
  const handleDeleteMultiple = async () => {
    if (selectedEmails.length === 0) return

    try {
      const response = await axios.post(`${url}/api/message/delete/multiple`, {
        messageIds: selectedEmails
      })
      if (response.data.success) {
        toast.success(`Đã xóa ${response.data.deletedCount} message(s)`)
        setSelectedEmails([])
        fetchMessages()
        fetchFolderCounts()
      } else {
        toast.error('Không thể xóa messages')
      }
    } catch (error) {
      console.error('Error deleting messages:', error)
      toast.error('Có lỗi xảy ra khi xóa messages')
    }
  }

  const handleFolderChange = (folderId) => {
    setSelectedFolder(folderId)
    setCurrentPage(1)
    setSelectedEmails([])
    setSelectedMessage(null)
  }

  // Handle message click
  const handleMessageClick = (message) => {
    // Fetch all messages from this user for conversation view
    if (message.email) {
      fetchUserConversation(message.email, message.name)
    } else {
      fetchUserConversation(null, message.name)
    }
  }

  // Send reply
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyInput.trim() || !selectedMessage) return

    try {
      setSendingReply(true)
      const response = await axios.post(`${url}/api/message/reply`, {
        messageId: selectedMessage._id,
        message: replyInput.trim()
      })

      if (response.data.success) {
        setReplyInput('')
        toast.success('Đã gửi reply')
        
        // Refresh conversation if it exists, otherwise refresh single message
        if (selectedMessage.email || selectedMessage.name) {
          fetchUserConversation(selectedMessage.email, selectedMessage.name)
        } else {
          fetchMessage(selectedMessage._id)
        }
        
        fetchMessages() // Refresh list
        fetchFolderCounts() // Update counts
      } else {
        toast.error('Không thể gửi reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Có lỗi xảy ra khi gửi reply')
    } finally {
      setSendingReply(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      // Parse date string to Date object
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return ''
      }
      // Format according to Vietnam timezone (UTC+7)
      // MongoDB stores dates in UTC, so we need to convert to Vietnam time
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      })
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return ''
    }
  }

  return (
    <div className='messages'>
      {/* Header */}
      <div className="messages-header">
        <h1>Inbox</h1>
        <div className="messages-actions">
          <button className="compose-btn">
            <span className="material-symbols-outlined">add</span>
            Compose
          </button>
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Search mail" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="action-icons">
            <button className="icon-btn">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">info</span>
            </button>
            <button 
              className="icon-btn"
              onClick={handleDeleteMultiple}
              disabled={selectedEmails.length === 0}
              title={selectedEmails.length > 0 ? `Xóa ${selectedEmails.length} message(s)` : 'Chọn messages để xóa'}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`messages-content ${selectedMessage ? 'with-chat' : ''}`}>
        {/* My Email Section */}
        <div className="email-folders">
          <h2>My Email</h2>
          <div className="folders-list">
            {emailFolders.map(folder => (
              <div
                key={folder.id}
                className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                onClick={() => handleFolderChange(folder.id)}
              >
                <span className="material-symbols-outlined">{folder.icon}</span>
                <span className="folder-name">{folder.name}</span>
                <span className="folder-count">{folder.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="email-list-container">
          <div className="email-list">
            {loading ? (
              <div className="loading-message">Đang tải messages...</div>
            ) : (
              <>
                {/* Header Row with Column Names */}
                {paginatedMessages.length > 0 && (
                  <div className="email-item email-header">
                    <input
                      type="checkbox"
                      checked={selectedEmails.length === paginatedMessages.length && paginatedMessages.length > 0}
                      onChange={handleSelectAll}
                      className="email-checkbox"
                    />
                    <div></div> {/* Empty space for star button */}
                    <div className="email-header-name">Name</div>
                    <div className="email-header-message">Messages</div>
                    <div className="email-header-time">Time</div>
                  </div>
                )}

                {/* Email Items */}
                {paginatedMessages.length === 0 ? (
                  <div className="no-messages">Không có messages nào</div>
                ) : (
                  paginatedMessages.map(message => (
                    <div 
                      key={message._id} 
                      className={`email-item ${!message.read ? 'unread' : ''} ${selectedMessage?._id === message._id ? 'selected' : ''}`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(message._id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectEmail(message._id)
                        }}
                        className="email-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className={`star-btn ${message.starred ? 'starred' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(message._id, message.starred)
                        }}
                      >
                        <span className="material-symbols-outlined">
                          {message.starred ? 'star' : 'star_border'}
                        </span>
                      </button>
                      <div className="email-sender">{message.name || 'Anonymous'}</div>
                      <div className="email-subject">{message.message}</div>
                      <div className="email-time">{formatTime(message.date)}</div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination-info">
              Showing {messages.length === 0 ? 0 : ((currentPage - 1) * emailsPerPage) + 1}-{Math.min(currentPage * emailsPerPage, messages.length)} of {messages.length.toLocaleString()}
            </span>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat View - Right Column */}
        {selectedMessage && (
          <div className="chat-view">
            {/* Chat Header */}
            <div className="chat-header-bar">
              <button 
                className="back-btn"
                onClick={() => setSelectedMessage(null)}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="chat-header-info">
                <h3>{selectedMessage.name || 'Anonymous'}</h3>
                {selectedMessage.label && (
                  <span className={`chat-label ${getLabelColor(selectedMessage.label)}`}>
                    {selectedMessage.label}
                  </span>
                )}
              </div>
              <div className="chat-header-actions">
                <button className="chat-action-btn">
                  <span className="material-symbols-outlined">print</span>
                </button>
                <button 
                  className={`chat-action-btn ${selectedMessage.starred ? 'starred' : ''}`}
                  onClick={() => toggleStar(selectedMessage._id, selectedMessage.starred)}
                >
                  <span className="material-symbols-outlined">
                    {selectedMessage.starred ? 'star' : 'star_border'}
                  </span>
                </button>
                <button 
                  className="chat-action-btn"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-container">
              {/* If conversationMessages exists, show all messages from user */}
              {selectedMessage?.conversationMessages ? (
                <>
                  {selectedMessage.conversationMessages.map((msg, index) => (
                    <Fragment key={msg._id || index}>
                      {/* User's original message */}
                      <div className="chat-message incoming">
                        <div className="message-avatar">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="message-bubble">
                          <p>{msg.message}</p>
                          <span className="message-time">{formatDate(msg.date)}</span>
                        </div>
                      </div>

                      {/* Admin replies to this message */}
                      {msg.replies && msg.replies.length > 0 && (
                        <>
                          {msg.replies.map((reply, replyIndex) => (
                            <div 
                              key={reply._id || replyIndex} 
                              className="chat-message outgoing"
                            >
                              <div className="message-bubble">
                                <p>{reply.message}</p>
                                <span className="message-time">{formatDate(reply.date)}</span>
                              </div>
                              <div className="message-avatar admin">
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </Fragment>
                  ))}
                </>
              ) : (
                <>
                  {/* Original Message */}
                  <div className="chat-message incoming">
                    <div className="message-avatar">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="message-bubble">
                      <p>{selectedMessage.message}</p>
                      <span className="message-time">{formatDate(selectedMessage.date)}</span>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                    <>
                      {selectedMessage.replies.map((reply, index) => (
                        <div 
                          key={reply._id || index} 
                          className={`chat-message ${reply.sender === 'Admin' ? 'outgoing' : 'incoming'}`}
                        >
                          {reply.sender !== 'Admin' && (
                            <div className="message-avatar">
                              <span className="material-symbols-outlined">person</span>
                            </div>
                          )}
                          <div className="message-bubble">
                            <p>{reply.message}</p>
                            <span className="message-time">{formatDate(reply.date)}</span>
                          </div>
                          {reply.sender === 'Admin' && (
                            <div className="message-avatar admin">
                              <span className="material-symbols-outlined">admin_panel_settings</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="chat-input-bar">
              <button className="chat-input-icon">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <form onSubmit={handleSendReply} className="chat-input-form">
                <input
                  type="text"
                  placeholder="Write message"
                  className="chat-input-field"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  disabled={sendingReply}
                />
                <button type="button" className="chat-input-icon">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <button type="button" className="chat-input-icon">
                  <span className="material-symbols-outlined">image</span>
                </button>
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!replyInput.trim() || sendingReply}
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages

