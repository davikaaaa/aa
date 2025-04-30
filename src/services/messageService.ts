import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc,
  or,
  and,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '../firebase/config';
import { Message } from '../types';

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  imageFile?: File
): Promise<Message> => {
  try {
    let imageUrl = undefined;
    
    // If there's an image file, upload it to storage first
    if (imageFile) {
      const imageId = uuidv4();
      const storageRef = ref(storage, `chat-images/${imageId}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    const messageData: Omit<Message, 'id'> = {
      senderId,
      receiverId,
      text,
      imageUrl,
      createdAt: Date.now(),
      isRead: false
    };
    
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    return {
      id: docRef.id,
      ...messageData
    };
    
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages between two users
export const getMessagesBetweenUsers = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'messages'),
      or(
        and(
          where('senderId', '==', userId1),
          where('receiverId', '==', userId2)
        ),
        and(
          where('senderId', '==', userId2),
          where('receiverId', '==', userId1)
        )
      ),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Delete a message (admin only)
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    // Get the message to check if it has an image
    const messageDoc = await getDoc(doc(db, 'messages', messageId));
    
    if (messageDoc.exists()) {
      const messageData = messageDoc.data() as Message;
      
      // Delete the message document
      await deleteDoc(doc(db, 'messages', messageId));
      
      // Note: In a production app, you might want to delete the image from storage as well
      // if (messageData.imageUrl) {
      //   const imageRef = ref(storage, messageData.imageUrl);
      //   await deleteObject(imageRef);
      // }
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  receiverId: string,
  senderId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', receiverId),
      where('senderId', '==', senderId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Update each unread message
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (
  receiverId: string,
  senderId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', receiverId),
      where('senderId', '==', senderId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
    
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};