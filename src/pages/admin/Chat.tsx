import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/userService';
import { getMessagesBetweenUsers, sendMessage, deleteMessage, markMessagesAsRead } from '../../services/messageService';
import { User, Message } from '../../types';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

const AdminChat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, messagesData] = await Promise.all([
          getUserById(userId),
          getMessagesBetweenUsers(currentUser.uid, userId)
        ]);
        
        setUser(userData);
        setMessages(messagesData);
        
        // Mark incoming messages as read
        await markMessagesAsRead(currentUser.uid, userId);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(async () => {
      try {
        const messagesData = await getMessagesBetweenUsers(currentUser.uid, userId);
        setMessages(messagesData);
        await markMessagesAsRead(currentUser.uid, userId);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, currentUser]);

  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!currentUser || !userId) return;
    
    try {
      await sendMessage(currentUser.uid, userId, text, imageFile);
      
      // Refresh messages
      const messagesData = await getMessagesBetweenUsers(currentUser.uid, userId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(message => message.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">User not found or not approved</p>
        <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft size={16} />
        </Button>
        
        <Avatar
          src={user.photoURL}
          alt={user.displayName || user.email}
          size="md"
        />
        
        <div className="ml-3">
          <h3 className="font-medium">{user.displayName || 'Unnamed User'}</h3>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      
      {/* Chat messages */}
      <MessageList
        messages={messages}
        onDeleteMessage={handleDeleteMessage}
      />
      
      {/* Message input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default AdminChat;