import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
const ROOM = 'global';

function App() {
  const [displayName, setDisplayName] = useState(localStorage.getItem('hiveName') || '');
  const [draftName, setDraftName] = useState(displayName);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  const connected = useMemo(() => Boolean(displayName), [displayName]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', ROOM);
    });

    socket.on('new-message', (incoming) => {
      setMessages((previous) => [...previous, incoming]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    const loadMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/messages`, {
          params: { room: ROOM }
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [connected]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleJoin = (event) => {
    event.preventDefault();
    if (!draftName.trim()) {
      return;
    }
    const trimmed = draftName.trim();
    setDisplayName(trimmed);
    localStorage.setItem('hiveName', trimmed);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!messageInput.trim() || !displayName.trim()) {
      return;
    }

    try {
      await axios.post(`${API_URL}/api/messages`, {
        room: ROOM,
        senderName: displayName,
        content: messageInput.trim()
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!connected) {
    return (
      <main className="page">
        <section className="card">
          <h1>The Hive</h1>
          <p>Google Chat-like team room for fast updates.</p>
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              placeholder="Pick your display name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={32}
              required
            />
            <button type="submit">Enter Hive</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="chat-shell">
        <header>
          <div>
            <h1>The Hive</h1>
            <p>#global</p>
          </div>
          <span>Signed in as {displayName}</span>
        </header>

        <div className="messages" ref={listRef}>
          {loading ? (
            <p className="hint">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="hint">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((message) => (
              <article className="message" key={message._id}>
                <div>
                  <strong>{message.senderName}</strong>
                  <time>{new Date(message.createdAt).toLocaleTimeString()}</time>
                </div>
                <p>{message.content}</p>
              </article>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="composer">
          <input
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            type="text"
            placeholder="Message #global"
            maxLength={500}
            required
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  );
}

export default App;
