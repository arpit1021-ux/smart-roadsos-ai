import { useEffect, useRef, useCallback, useState } from 'react';
import { initSocket, joinAccidentRoom, onAccidentUpdate, offAccidentUpdate } from '../services/socket';

const useSocket = (accidentId = null) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = initSocket();

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && accidentId) {
      joinAccidentRoom(accidentId);
      return () => {
        leaveAccidentRoom(accidentId);
      };
    }
  }, [accidentId]);

  const onUpdate = useCallback((callback) => {
    if (socketRef.current) {
      onAccidentUpdate(callback);
    }
  }, []);

  const offUpdate = useCallback((callback) => {
    if (socketRef.current) {
      offAccidentUpdate(callback);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    onUpdate,
    offUpdate
  };
};

export default useSocket;
