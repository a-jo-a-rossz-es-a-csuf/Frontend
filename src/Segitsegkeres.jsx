import React, { useEffect, useRef, useState } from 'react';

export default function Segitsegkeres() {
  const API_URL = 'http://localhost:5000/api';
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
    setShowChat(!!(user && user.id));
    if (user && user.id) {
      loadMessages(user);
      const interval = setInterval(() => loadMessages(user), 10000);
      return () => clearInterval(interval);
    }
  }, []);

  async function loadMessages(user) {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat?action=get_user_messages&user_id=${user.id}`);
      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
        setTimeout(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
          }
        }, 100);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!currentUser || !currentUser.id) return;
    if (!input.trim()) return;
    try {
      const response = await fetch(`${API_URL}/chat?action=send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, uzenet: input.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setInput('');
        loadMessages(currentUser);
      }
    } catch (error) {}
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('hu-HU');
  }

  return (
    <div>
      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Segítségkérés</h1>
        {/* Bejelentkezés szükséges */}
        {!showChat && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Bejelentkezés szükséges</h2>
            <p className="text-gray-600 mb-4">A segítségkéréshez kérjük, jelentkezz be.</p>
            <a href="/bejelentkezes" className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition">Bejelentkezés</a>
          </div>
        )}
        {/* Chat panel */}
        {showChat && (
          <div id="chatPanel">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Chat header */}
              <div className="bg-red-600 text-white px-6 py-4">
                <h2 className="text-lg font-bold">Élő chat támogatás</h2>
                <p className="text-red-100 text-sm">Írj nekünk és hamarosan válaszolunk!</p>
              </div>
              {/* Chat messages */}
              <div ref={chatMessagesRef} className="h-64 sm:h-80 md:h-96 overflow-y-auto p-4 bg-gray-50">
                {loading ? (
                  <div className="text-center text-gray-500 py-8">Töltés...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <p>Még nincsenek üzeneteid. Írj nekünk!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div className="mb-4" key={i}>
                      {/* Felhasználó üzenete */}
                      <div className="flex justify-end mb-2">
                        <div className="bg-red-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                          <p dangerouslySetInnerHTML={{ __html: escapeHtml(msg.uzenet) }} />
                          <p className="text-xs text-red-200 mt-1">{formatDate(msg.letrehozva)}</p>
                        </div>
                      </div>
                      {/* Admin válasz (ha van) */}
                      {msg.admin_valasz ? (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-900 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                            <p className="text-xs text-gray-500 mb-1 font-medium">Admin válasz:</p>
                            <p dangerouslySetInnerHTML={{ __html: escapeHtml(msg.admin_valasz) }} />
                            <p className="text-xs text-gray-500 mt-1">{formatDate(msg.valaszolva)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 text-sm">
                            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                            Válaszra vár...
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {/* Chat input */}
              <div className="p-4 bg-white border-t">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Írd be az üzeneted..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline">Küldés</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
            {/* Info boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <svg className="w-8 h-8 mx-auto text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="font-bold text-gray-900">Gyors válasz</h3>
                <p className="text-sm text-gray-600">Általában 24 órán belül válaszolunk</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <svg className="w-8 h-8 mx-auto text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3 className="font-bold text-gray-900">Szakértő segítség</h3>
                <p className="text-sm text-gray-600">Tapasztalt kollégák válaszolnak</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 text-center">
                <svg className="w-8 h-8 mx-auto text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <h3 className="font-bold text-gray-900">Telefonos elérhetőség</h3>
                <p className="text-sm text-gray-600">+36 1 234 5678</p>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">&copy; 2026 AutoParts Pro. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
}
