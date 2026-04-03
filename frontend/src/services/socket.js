import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;

  const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const joinAccidentRoom = (accidentId) => {
  if (socket) {
    socket.emit('join_accident_room', accidentId);
  }
};

export const leaveAccidentRoom = (accidentId) => {
  if (socket) {
    socket.emit('leave_accident_room', accidentId);
  }
};

export const onAccidentUpdate = (callback) => {
  if (socket) {
    socket.on('status_update', (data) => callback(data));
    socket.on('new_accident', (data) => callback(data));
  }
};

export const offAccidentUpdate = (callback) => {
  if (socket) {
    socket.off('status_update', callback);
    socket.off('new_accident', callback);
  }
};

export default { initSocket, getSocket, joinAccidentRoom, leaveAccidentRoom, onAccidentUpdate };
