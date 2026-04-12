import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Segitsegkeres = () => {
    const API_URL = 'http://localhost:5000/api';
    
    // --- Állapotok ---
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const chatMessagesRef = useRef(null);

    // Felhasználó betöltése és automatikus frissítés indítása
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        setCurrentUser(user);
        
        if (user?.id) {
            loadMessages(user.id);
            const interval = setInterval(() => loadMessages(user.id), 5000); // 5 másodpercenként frissít
            return () => clearInterval(interval);
        }
    }, []);

    // Automatikus görgetés az utolsó üzenethez
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = async (userId) => {
        try {
            // A backend nem vár paramétert, az összes üzenetet visszaadja
            const res = await axios.get(`${API_URL}/chat`);
            
            // Az eredeti backend közvetlenül a tömböt adja vissza (nincs res.data.success)
            if (Array.isArray(res.data)) {
                const formattedMessages = [];
                
                // 1. Szűrjük ki csak az aktuális felhasználó üzeneteit a nagy listából
                const userMessages = res.data.filter(row => row.userId === userId);
                
                // 2. A backend a legújabbakat adja előre (OrderByDescending), de a chatben 
                // a legújabbnak alul kell lennie. Ezért megfordítjuk a sorrendet (.reverse())
                userMessages.reverse().forEach(row => {
                    // Felhasználó üzenete
                    if (row.uzenet) {
                        formattedMessages.push({
                            sender_type: 'user',
                            message: row.uzenet,
                            created_at: row.letrehozva
                        });
                    }
                    // Admin válasza (A C# adminValasz néven adja vissza, nem admin_valasz!)
                    if (row.adminValasz) {
                        formattedMessages.push({
                            sender_type: 'admin',
                            message: row.adminValasz,
                            created_at: row.valaszolva || row.letrehozva
                        });
                    }
                });
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Chat betöltési hiba:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !currentUser || isSending) return;

        setIsSending(true);
        try {
            // A POST kérésnél az ORM miatt pontosan camelCase (userId) neveket kell küldenünk
            const res = await axios.post(`${API_URL}/chat`, {
                userId: currentUser.id,
                uzenet: input.trim() 
            });

            // A backend POST metódusa már küld { success: true } választ, így ez maradhat
            if (res.data.success) {
                setInput('');
                loadMessages(currentUser.id);
            } else {
                alert("Hiba a szervertől: " + (res.data.error || "Ismeretlen hiba"));
            }
        } catch (error) {
            console.error("Üzenetküldési hiba:", error);
            alert("Nem sikerült elküldeni az üzenetet.");
        } finally {
            setIsSending(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 inline-block">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Segítségre van szüksége?</h2>
                    <p className="text-gray-500 mb-6">A chat funkció használatához kérjük, jelentkezzen be.</p>
                    <a href="/bejelentkezes" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition">Bejelentkezés</a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[70vh]">
                    
                    {/* CHAT HEADER */}
                    <div className="bg-gray-900 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-black text-xl">?</div>
                            <div>
                                <h2 className="font-bold text-lg leading-none">Szakértői Segítség</h2>
                                <span className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Ügyfélszolgálat online
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* MESSAGES AREA */}
                    <div 
                        ref={chatMessagesRef}
                        className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50"
                    >
                        {messages.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-400 italic">Még nincs üzenetváltás. Írjon nekünk bizalommal!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                                        msg.sender_type === 'user' 
                                        ? 'bg-red-600 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                        <span className={`text-[10px] block mt-2 opacity-70 ${msg.sender_type === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* INPUT AREA */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Írja meg kérdését..."
                            className="flex-grow px-5 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl transition-all disabled:opacity-50 active:scale-90"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* INFO TILES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="text-red-600 bg-red-50 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="text-xs font-bold text-gray-600 uppercase">Gyors válaszidő</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="text-red-600 bg-red-50 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="text-xs font-bold text-gray-600 uppercase">Szakértő kollégák</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                        <div className="text-red-600 bg-red-50 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div className="text-xs font-bold text-gray-600 uppercase">Telefonos ügyelet</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Segitsegkeres;
