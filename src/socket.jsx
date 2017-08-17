import io from 'socket.io-client';
const socket = io('http://localhost:6280');

export default socket;