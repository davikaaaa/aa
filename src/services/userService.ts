import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  orderBy,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, RegistrationRequest, ConversationInfo } from '../types';
import { toast } from 'react-toastify';

// Enable offline persistence with unlimited cache size
try {
  await enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  });
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    toast.warning('Offline mode is only available in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    toast.warning('Your browser doesn\'t support offline mode.');
  }
}

// Get user by id
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as User;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.warn('Offline mode: Using cached user data if available');
    } else {
      console.error('Error getting user:', error);
    }
    return null;
  }
};

// Create admin user if it doesn't exist
export const initializeAdminUser = async (currentUser: User): Promise<void> => {
  try {
    const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!adminDoc.exists()) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        email: currentUser.email,
        displayName: 'Admin',
        photoURL: currentUser.photoURL,
        isAdmin: true,
        isApproved: true,
        createdAt: Date.now()
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
    throw new Error('Failed to initialize admin user. Please check your permissions.');
  }
};

// Get registration requests
export const getRegistrationRequests = async (): Promise<RegistrationRequest[]> => {
  try {
    const q = query(
      collection(db, 'registrationRequests'), 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data()
    } as RegistrationRequest));
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.warn('Offline mode: Using cached registration requests if available');
      return [];
    }
    console.error('Error getting registration requests:', error);
    return [];
  }
};

// Update registration request status
export const updateRegistrationStatus = async (
  uid: string, 
  status: 'approved' | 'rejected'
): Promise<void> => {
  try {
    // Update request status
    await updateDoc(doc(db, 'registrationRequests', uid), {
      status
    });
    
    // If approved, update user approval status
    if (status === 'approved') {
      await updateDoc(doc(db, 'users', uid), {
        isApproved: true
      });
    }
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
};

// Get all approved users (for admin)
export const getApprovedUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('isApproved', '==', true),
      where('isAdmin', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as User));
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.warn('Offline mode: Using cached approved users if available');
      return [];
    }
    console.error('Error getting approved users:', error);
    return [];
  }
};

// Get user conversations (for admin)
export const getUserConversations = async (): Promise<ConversationInfo[]> => {
  try {
    const users = await getApprovedUsers();
    
    return users.map(user => ({
      userId: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      unreadCount: 0 // This would be calculated from messages in a real app
    }));
  } catch (error: any) {
    if (error.message?.includes('offline')) {
      console.warn('Offline mode: Using cached conversations if available');
      return [];
    }
    console.error('Error getting user conversations:', error);
    return [];
  }
};