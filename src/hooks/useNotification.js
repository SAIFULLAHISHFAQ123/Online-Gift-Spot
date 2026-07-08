import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

// Mock hook to demonstrate socket.io integration
const useNotification = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to a mock backend or real backend if available
    const newSocket = io('http://localhost:5000', {
      autoConnect: false // Don't actually connect to avoid errors without a backend
    });

    setSocket(newSocket);

    // Mock receiving a notification after 5 seconds
    const timer = setTimeout(() => {
      const mockNotification = {
        id: Date.now(),
        message: 'A friend contributed to your wishlist!',
        type: 'success'
      };
      
      setNotifications(prev => [mockNotification, ...prev]);
      toast.success(mockNotification.message);
      
    }, 5000);

    return () => {
      newSocket.disconnect();
      clearTimeout(timer);
    };
  }, [userId]);

  return { notifications, socket };
};

export default useNotification;
