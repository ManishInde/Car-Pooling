import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';


const socket = io('http://localhost:5000');

const TripDetails = () => {
    const { id } = useParams();
    const { token, user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/trips/${id}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();


        socket.emit('join_trip_room', id);


        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });


        return () => {
            socket.off('receive_message');
        };
    }, [id, token]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        if (!user) {
            alert("Error: User data missing. Please Log out and log back in!");
        }

        socket.emit('send_message', {
            trip_id: id,
            user_id: user.id,
            username: user.name,
            text: newMessage
        });
        setNewMessage('');
    };

    return (
        <div className="page-container">
            <div className="dashboard-header">
                <h2>Trip #{id} Chat Room</h2>
            </div>

            <div className="chat-container" style={{ background: '#111', padding: '20px', borderRadius: '8px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>


                <div className="messages-area" style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.length === 0 ? <p style={{ color: '#666', textAlign: 'center' }}>No messages yet. Say hi!</p> : null}

                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            background: '#222',
                            padding: '10px',
                            borderRadius: '8px',
                            alignSelf: 'flex-start',
                            borderLeft: '4px solid var(--primary-blue)'
                        }}>
                            <strong style={{ color: 'var(--primary-blue)' }}>{msg.username}</strong>
                            <p style={{ margin: '5px 0 0 0' }}>{msg.text}</p>
                        </div>
                    ))}
                </div>


                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        style={{ flexGrow: 1 }}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
};

export default TripDetails;
