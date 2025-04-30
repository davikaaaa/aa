import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <span className="ml-2 font-semibold text-xl text-gray-800">
              Chat App
            </span>
          </div>
          
          {currentUser ? (
            <div className="flex items-center">
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mr-4"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Admin Dashboard
                </Button>
              )}
              
              <div className="flex items-center mr-4">
                <Avatar 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || currentUser.email || 'User'} 
                  size="sm"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;