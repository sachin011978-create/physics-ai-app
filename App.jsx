import { useState, useEffect, useRef } from 'react';
import './App.css';

const physicsPairs = [
    { term: "Force", dim: "[M¹ L¹ T⁻²]" },
    { term: "Velocity", dim: "[M⁰ L¹ T⁻¹]" },
    { term: "Work", dim: "[M¹ L² T⁻²]" },
    { term: "Pressure", dim: "[M¹ L⁻¹ T⁻²]" },
    { term: "Area", dim: "[M⁰ L² T⁰]" }
];

function DimensionGame() {
    const [terms, setTerms] = useState([]);
    const [dims, setDims] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        setTerms([...physicsPairs].sort(() => Math.random() - 0.5).map(p => p.term));
        setDims([...physicsPairs].sort(() => Math.random() - 0.5).map(p => p.dim));
    }, []);

    const handleTermClick = (term) => {
        if (!matchedPairs.includes(term)) {
            setSelectedTerm(term);
            setErrorMsg("");
        }
    };

    const handleDimClick = (dim) => {
        if (!selectedTerm || matchedPairs.includes(dim)) return;

        const correctPair = physicsPairs.find(p => p.term === selectedTerm);
        if (correctPair.dim === dim) {
            setMatchedPairs(prev => [...prev, selectedTerm, dim]);
            setSelectedTerm(null);
            setErrorMsg("");
        } else {
            setErrorMsg("Wrong match! Try again.");
            setTimeout(() => setErrorMsg(""), 2000);
        }
    };

    return (
        <div className="game-container">
            <h2 className="section-title">🎮 Dimension Matcher</h2>
            <div className="game-grid">
                <div className="game-col">
                    {terms.map(term => (
                        <button key={term} className={`game-btn ${selectedTerm === term ? 'active' : ''} ${matchedPairs.includes(term) ? 'matched' : ''}`} onClick={() => handleTermClick(term)}>{term}</button>
                    ))}
                </div>
                <div className="game-col">
                    {dims.map(dim => (
                        <button key={dim} className={`game-btn dim-btn ${matchedPairs.includes(dim) ? 'matched' : ''}`} onClick={() => handleDimClick(dim)}>{dim}</button>
                    ))}
                </div>
            </div>
            {errorMsg && <div className="game-error">{errorMsg}</div>}
            {matchedPairs.length === physicsPairs.length * 2 && <div className="game-success">🎉 Perfect Match! 🎉</div>}
        </div>
    );
}

function ConceptsBoard() {
    const conceptData = [
        { chapter: "Units & Measurements", concepts: [{ title: "SI Units", desc: "The standard metric system." }, { title: "Dimensions", desc: "Base quantities of physics." }] },
        { chapter: "Laws of Motion", concepts: [{ title: "Newton's 1st Law", desc: "Inertia stays constant." }, { title: "Momentum", desc: "Mass × Velocity." }] },
        { chapter: "Gravitation", concepts: [{ title: "Universal Gravity", desc: "F = G(m1·m2)/r²" }] }
    ];

    return (
        <div className="concepts-container">
            <h2 className="section-title">📚 Concepts Board</h2>
            <div className="concepts-list">
                {conceptData.map((ch, i) => (
                    <div key={i} className="concept-card">
                        <h3>{ch.chapter}</h3>
                        {ch.concepts.map((con, j) => (
                            <div key={j} className="concept-item">
                                <strong>{con.title}</strong>
                                <p>{con.desc}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function App() {
    const [messages, setMessages] = useState([{ role: 'ai', text: "Hello Vivan! I'm your Cyber-Physics Teacher. Select a difficulty and ask me anything!" }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [level, setLevel] = useState('Medium');
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'concepts' | 'game'
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const API_BASE = "https://physics-backend.onrender.com";
            // const API_BASE = "http://localhost:3000"; // For local testing if needed
            
            const response = await fetch(`${API_BASE}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: currentInput, level })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Network Error: Unable to reach the physics mainframe." }]);
        }
        setLoading(false);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>⚡ Physics.AI</h1>
                <div className="difficulty-pills">
                    <button className={`diff-pill ${level === 'Easy' ? 'active easy' : ''}`} onClick={() => setLevel('Easy')}>Easy</button>
                    <button className={`diff-pill ${level === 'Medium' ? 'active medium' : ''}`} onClick={() => setLevel('Medium')}>Medium</button>
                    <button className={`diff-pill ${level === 'Hard' ? 'active hard' : ''}`} onClick={() => setLevel('Hard')}>Hard</button>
                </div>
            </header>

            <main className="main-layout">
                {/* Desktop: 3-Column Grid. Mobile: Only visible if activeTab matches */}
                <aside className={`side-panel left ${activeTab === 'concepts' ? 'mobile-visible' : ''}`}>
                    <ConceptsBoard />
                </aside>

                <section className={`chat-section ${activeTab === 'chat' ? 'mobile-visible' : ''}`}>
                    <div className="chat-window">
                        {messages.map((m, i) => (
                            <div key={i} className={`message-row ${m.role}`}>
                                <div className={`message-bubble ${m.role}`}>{m.text}</div>
                            </div>
                        ))}
                        {loading && <div className="message-row ai"><div className="message-bubble loading">Thinking...</div></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-area">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Vivan's Teacher..."
                            autoComplete="off"
                        />
                        <button onClick={handleSend} disabled={loading || !input.trim()}>SEND</button>
                    </div>
                </section>

                <aside className={`side-panel right ${activeTab === 'game' ? 'mobile-visible' : ''}`}>
                    <DimensionGame />
                </aside>
            </main>

            <nav className="mobile-nav">
                <button className={activeTab === 'concepts' ? 'active' : ''} onClick={() => setActiveTab('concepts')}>📚 Concepts</button>
                <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>💬 Chat</button>
                <button className={activeTab === 'game' ? 'active' : ''} onClick={() => setActiveTab('game')}>🎮 Game</button>
            </nav>
        </div>
    );
}

export default App;