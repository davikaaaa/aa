import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getMessagesBetweenUsers, sendMessage, markMessagesAsRead } from '../../services/messageService';
import { getUserById } from '../../services/userService';
import { Message, User } from '../../types';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import Avatar from '../../components/ui/Avatar';
import { WifiOff } from 'lucide-react';

const UserChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentUser } = useAuth();
  
  // Admin UID is hardcoded based on requirements
  const adminId = '1j4aAYaEgIXrV7L8tm0vtIpobrx1';

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [adminData, messagesData] = await Promise.all([
          getUserById(adminId),
          getMessagesBetweenUsers(currentUser.uid, adminId)
        ]);
        
        if (adminData) {
          setAdmin(adminData);
        }
        setMessages(messagesData);
        
        // Mark incoming messages as read
        if (isOnline) {
          await markMessagesAsRead(currentUser.uid, adminId);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        if (!isOnline) {
          toast.info('You are offline. Showing cached messages.');
        } else {
          toast.error('Failed to load chat');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for new messages only when online
    const interval = setInterval(async () => {
      if (!isOnline) return;
      
      try {
        const messagesData = await getMessagesBetweenUsers(currentUser.uid, adminId);
        setMessages(messagesData);
        await markMessagesAsRead(currentUser.uid, adminId);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, isOnline]);

  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!currentUser) return;
    
    if (!isOnline) {
      toast.warning('Cannot send messages while offline');
      return;
    }
    
    try {
      await sendMessage(currentUser.uid, adminId, text, imageFile);
      
      // Refresh messages
      const messagesData = await getMessagesBetweenUsers(currentUser.uid, adminId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Users cannot delete messages, so this is a no-op
  const handleDeleteMessage = () => {};

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-100">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar
            src={admin?.photoURL}
            alt={admin?.displayName || 'Admin'}
            size="md"
          />
          
          <div className="ml-3">
            <h3 className="font-medium">{admin?.displayName || 'Admin'}</h3>
            <p className="text-xs text-gray-500">
              {currentUser?.isApproved 
                ? 'You can chat with the admin' 
                : 'Waiting for admin approval'}
            </p>
          </div>
        </div>

        {!isOnline && (
          <div className="flex items-center text-yellow-600">
            <WifiOff className="w-4 h-4 mr-2" />
            <span className="text-sm">Offline Mode</span>
          </div>
        )}
      </div>
      
      {/* Chat messages */}
      <MessageList
        messages={messages}
        onDeleteMessage={handleDeleteMessage}
      />
      
      {/* Message input - disabled if user is not approved or offline */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={!currentUser?.isApproved || !isOnline}
      />
      
      {/* Status messages */}
      {!currentUser?.isApproved && (
        <div className="bg-yellow-50 p-3 text-sm text-yellow-800 border-t border-yellow-200">
          Your account is pending approval. You will be able to send messages once an admin approves your account.
        </div>
      )}
      
      {!isOnline && (
        <div className="bg-yellow-50 p-3 text-sm text-yellow-800 border-t border-yellow-200">
          You are currently offline. Messages will be available when you reconnect.
        </div>
      )}
    </div>
  );
};

export default UserChat;