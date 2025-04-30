import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRegistrationRequests, updateRegistrationStatus, getUserConversations } from '../../services/userService';
import { RegistrationRequest, ConversationInfo } from '../../types';
import RegistrationRequestCard from '../../components/admin/RegistrationRequestCard';
import UserCard from '../../components/admin/UserCard';

const AdminDashboard: React.FC = () => {
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requests, convos] = await Promise.all([
          getRegistrationRequests(),
          getUserConversations()
        ]);
        
        setRegistrationRequests(requests);
        setConversations(convos);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (uid: string) => {
    setProcessingId(uid);
    try {
      await updateRegistrationStatus(uid, 'approved');
      setRegistrationRequests(prev => prev.filter(req => req.uid !== uid));
      toast.success('User approved successfully');
      
      // Refresh conversations to include the new user
      const updatedConversations = await getUserConversations();
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (uid: string) => {
    setProcessingId(uid);
    try {
      await updateRegistrationStatus(uid, 'rejected');
      setRegistrationRequests(prev => prev.filter(req => req.uid !== uid));
      toast.success('User rejected');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleChatWithUser = (userId: string) => {
    navigate(`/admin/chat/${userId}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Requests Section */}
        <div>
          <div className="flex items-center mb-4">
            <Users className="mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">Registration Requests</h2>
          </div>
          
          {registrationRequests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
              No pending registration requests
            </div>
          ) : (
            <div className="space-y-4">
              {registrationRequests.map(request => (
                <RegistrationRequestCard
                  key={request.uid}
                  user={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={processingId === request.uid}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* User Conversations Section */}
        <div>
          <div className="flex items-center mb-4">
            <MessageSquare className="mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold">User Conversations</h2>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No conversations with users yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                {conversations.map(convo => (
                  <UserCard
                    key={convo.userId}
                    id={convo.userId}
                    name={convo.displayName}
                    photoURL={convo.photoURL}
                    lastMessage={convo.lastMessage}
                    unreadCount={convo.unreadCount}
                    onClick={() => handleChatWithUser(convo.userId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;