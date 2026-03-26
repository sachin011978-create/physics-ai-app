import { useState, useEffect } from 'react';
import './App.css';

const physicsPairs = [
    { term: "Force", dim: "[M¹ L¹ T⁻²]" },
    { term: "Velocity", dim: "[M⁰ L¹ T⁻¹]" },
    { term: "Work", dim: "[M¹ L² T⁻²]" },
    { term: "Pressure", dim: "[M¹ L⁻¹ T⁻²]" },
    { term: "Area", dim: "[M⁰ L² T⁰]" }
];

function DimensionGame({ onExit }) {
    const [terms, setTerms] = useState([]);
    const [dims, setDims] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [matchedPairs, setMatchedPairs] = useState([]);

    useEffect(() => {
        const shuffledTerms = [...physicsPairs].sort(() => Math.random() - 0.5).map(p => p.term);
        const shuffledDims = [...physicsPairs].sort(() => Math.random() - 0.5).map(p => p.dim);
        setTerms(shuffledTerms);
        setDims(shuffledDims);
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
        <div className="game-area">
            <h2 className="game-title">Dimension Matcher</h2>
            
            <div className="game-columns">
                <div className="game-col">
                    {terms.map(term => (
                        <button 
                            key={term}
                            className={`game-btn ${selectedTerm === term ? 'selected' : ''} ${matchedPairs.includes(term) ? 'matched' : ''}`}
                            onClick={() => handleTermClick(term)}
                        >
                            {term}
                        </button>
                    ))}
                </div>
                <div className="game-col">
                    {dims.map(dim => (
                        <button 
                            key={dim}
                            className={`game-btn ${matchedPairs.includes(dim) ? 'matched' : ''}`}
                            onClick={() => handleDimClick(dim)}
                        >
                            {dim}
                        </button>
                    ))}
                </div>
            </div>

            <div className="game-error">{errorMsg}</div>
            
            {matchedPairs.length === physicsPairs.length * 2 && (
                <div className="game-success">
                    🎉 All Dimensions Matched! 🎉
                </div>
            )}

            <button className="back-btn" onClick={onExit}>⬅ Back to AI Chat</button>
        </div>
    );
}

function App() {
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello! I am your Cyber-Physics assistant. Upload your databank (PDF) and select a difficulty!' }]);
    const [input, setInput] = useState('');
    const [fileUri, setFileUri] = useState('');
    const [localPdfUrl, setLocalPdfUrl] = useState('/physicsbook.pdf');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [level, setLevel] = useState('Medium');
    const [showGame, setShowGame] = useState(false);
    const [notes, setNotes] = useState(() => localStorage.getItem('studyNotes') || '');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const conceptData = [
        {
            chapter: "Units and Measurements",
            concepts: [
                { id: '1a', title: "SI Units", explanation: "The International System of Units (SI) is the modern metric system used universally in science.", formula: "N/A", example: "Meter (m) for length, Kilogram (kg) for mass.", page: 2 },
                { id: '1b', title: "Dimensions", explanation: "Dimensions represent the nature of a physical quantity in terms of base quantities.", formula: "[M^a L^b T^c]", example: "Velocity = [M^0 L^1 T^-1]", page: 6 }
            ]
        },
        {
            chapter: "Laws of Motion",
            concepts: [
                { id: '4a', title: "Newton's 1st Law", explanation: "An object remains at rest or in uniform motion unless acted upon by an external force.", formula: "ΣF = 0 => a = 0", example: "A book resting on a table.", page: 48 },
                { id: '4b', title: "Momentum", explanation: "The product of an object's mass and its velocity.", formula: "p = m × v", example: "A heavy truck moving fast has high momentum.", page: 50 },
                { id: '4c', title: "Conservation of Momentum", explanation: "In an isolated system, the total momentum remains constant over time.", formula: "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2", example: "Recoil of a gun when fired.", page: 55 }
            ]
        },
        {
            chapter: "Gravitation",
            concepts: [
                { id: '5a', title: "Universal Law of Gravitation", explanation: "Every particle attracts every other particle with a force directly proportional to the product of their masses.", formula: "F = G(m1·m2)/r²", example: "The Earth orbiting the Sun.", page: 79 },
                { id: '5b', title: "Acceleration due to Gravity", explanation: "The acceleration gained by an object due to gravitational force.", formula: "g = GM/R²", example: "Dropping an apple (g ≈ 9.8 m/s²).", page: 82 }
            ]
        }
    ];

    // Classroom Pedagogy States
    const [showClassroom, setShowClassroom] = useState(false);
    const [activeConcept, setActiveConcept] = useState(conceptData[0].concepts[0]);
    const [rating, setRating] = useState(() => parseInt(localStorage.getItem('appRating') || '0'));
    const [feedback, setFeedback] = useState(() => localStorage.getItem('appFeedback') || '');

    useEffect(() => {
        localStorage.setItem('studyNotes', notes);
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('appRating', rating);
        localStorage.setItem('appFeedback', feedback);
    }, [rating, feedback]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.fileUri) {
                setFileUri(data.fileUri);
                setLocalPdfUrl(data.localUrl);
                setMessages(prev => [...prev, { role: 'ai', text: '✅ Neural link established. Physics book securely uploaded!' }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: '❌ Failed to upload databank.' }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', text: '❌ Error connecting to neural network.' }]);
        }
        setUploading(false);
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setLoading(true);

        let systemPrompt = "";
        if (level === "Easy") {
            systemPrompt = "System Instruction: Explain the following physics concept like I am 10 years old. Use very simple language, combining easy Marathi and English. Always include relatable, real-life everyday examples. Avoid complex math. \n\nQuestion: ";
        } else if (level === "Medium") {
            systemPrompt = "System Instruction: Answer the following physics question strictly following the 11th Standard Maharashtra Board textbook definitions and syllabus. Provide clear, standard educational explanations. \n\nQuestion: ";
        } else if (level === "Hard") {
            systemPrompt = "System Instruction: Provide an advanced, highly detailed explanation for the following. Include rigorous mathematical derivations, formulas, advanced scientific terminology, and deep conceptual theories. \n\nQuestion: ";
        }

        const finalPrompt = systemPrompt + input;

        try {
            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
            const result = await fetch(`${API_BASE}/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    fileUri: fileUri || undefined,
                    chapterStartPage: activeConcept ? activeConcept.page : 1,
                    chapterEndPage: activeConcept ? activeConcept.page + 20 : 21
                }),
            });

            const data = await result.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Connection error. Please refresh the mainframe!" }]);
        }

        setInput('');
        setLoading(false);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>⚡ Physics.AI</h1>
                <div className="header-actions">
                    <label className="upload-label">
                        {uploading ? "SYNCING..." : "UPLOAD DATABANK (PDF)"}
                        <input type="file" accept="application/pdf" className="upload-input" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>📝 Notes</button>
                </div>
            </header>

            <div className="difficulty-selector">
                <button 
                    className={`diff-btn easy ${level === 'Easy' && !showGame && !showClassroom ? 'active' : ''}`}
                    onClick={() => { setLevel('Easy'); setShowGame(false); setShowClassroom(false); }}>
                    EASY
                </button>
                <button 
                    className={`diff-btn medium ${level === 'Medium' && !showGame && !showClassroom ? 'active' : ''}`}
                    onClick={() => { setLevel('Medium'); setShowGame(false); setShowClassroom(false); }}>
                    MEDIUM
                </button>
                <button 
                    className={`diff-btn hard ${level === 'Hard' && !showGame && !showClassroom ? 'active' : ''}`}
                    onClick={() => { setLevel('Hard'); setShowGame(false); setShowClassroom(false); }}>
                    HARD
                </button>
                <button 
                    className={`diff-btn game ${showGame ? 'active' : ''}`}
                    style={{ borderColor: showGame ? '#ffaa00' : '#444', color: showGame ? '#ffaa00' : '#888', boxShadow: showGame ? '0 0 15px rgba(255, 170, 0, 0.4)' : 'none' }}
                    onClick={() => { setShowGame(true); setShowClassroom(false); }}>
                    🎮 PLAY GAME
                </button>
                <button 
                    className={`diff-btn classroom ${showClassroom ? 'active' : ''}`}
                    style={{ borderColor: showClassroom ? '#00f3ff' : '#444', color: showClassroom ? '#00f3ff' : '#888', boxShadow: showClassroom ? '0 0 15px rgba(0, 243, 255, 0.4)' : 'none' }}
                    onClick={() => { setShowClassroom(true); setShowGame(false); }}>
                    🏫 CLASSROOM
                </button>
            </div>

            {showClassroom ? (
                <div className="classroom-layout-wb">
                    {/* Left Sidebar: Concept Cards */}
                    <div className="classroom-sidebar left compact">
                        <h3 className="classroom-header">Concept Cards</h3>
                        <div className="concept-list">
                            {conceptData.map((ch, idx) => (
                                <div key={idx} className="concept-card">
                                    <h4 className="card-title">{ch.chapter}</h4>
                                    <div className="concept-chips">
                                        {ch.concepts.map(con => (
                                            <button 
                                                key={con.id} 
                                                className={`concept-pill ${activeConcept?.id === con.id ? 'active' : ''}`}
                                                onClick={() => setActiveConcept(con)}
                                            >
                                                {con.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center: Digital Whiteboard */}
                    <div className="whiteboard-area">
                        <div className="whiteboard-board">
                           <div className="wb-top-bar">
                                <span className="wb-dot"></span>
                                <span className="wb-dot"></span>
                                <span className="wb-dot"></span>
                           </div>
                           {activeConcept ? (
                               <div className="wb-content">
                                   <h2 className="wb-title">{activeConcept.title}</h2>
                                   
                                   <div className="wb-section">
                                       <h4 className="wb-heading">Explanation</h4>
                                       <p className="wb-text">{activeConcept.explanation}</p>
                                   </div>

                                   <div className="wb-section">
                                       <h4 className="wb-heading">Formula</h4>
                                       <div className="wb-formula-box">{activeConcept.formula}</div>
                                   </div>

                                   <div className="wb-section">
                                       <h4 className="wb-heading">Real-life Example</h4>
                                       <p className="wb-text">{activeConcept.example}</p>
                                   </div>
                               </div>
                           ) : (
                               <p className="wb-placeholder">Select a concept to start learning.</p>
                           )}
                        </div>
                    </div>

                    {/* Right: PDF Viewer */}
                    <div className="classroom-center right-pdf">
                        <iframe src={`${localPdfUrl}#page=${activeConcept ? activeConcept.page : 1}`} className="pdf-viewer" title="Textbook PDF"></iframe>
                    </div>
                </div>
            ) : showGame ? (
                <DimensionGame onExit={() => setShowGame(false)} />
            ) : (
                <>
                    <div className="chat-area">
                        {messages.map((m, i) => (
                            <div key={i} className={`message-row ${m.role}`}>
                                <div className={`message-bubble ${m.role}`}>
                                    {m.text}
                                    {m.role === 'ai' && (
                                        <button className="save-note-btn" onClick={() => setNotes(prev => prev + (prev ? '\n\n' : '') + m.text)}>📌 Save to Notes</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <p className="loading-text">Generating response...</p>}
                    </div>

                    <div className="input-area">
                        <div className="quick-actions">
                            <button className="quick-action-btn" onClick={() => setInput('Please provide a 5-point summary of this chapter.')}>📖 Summarize Chapter</button>
                            <button className="quick-action-btn" onClick={() => setInput('Please solve this numerical problem step-by-step.')}>🔢 Solve Numerical</button>
                            <button className="quick-action-btn" onClick={() => setInput('Please explain the key elements of this diagram.')}>🎨 Diagram Guide</button>
                            <button className="quick-action-btn" onClick={() => setInput('Suggest a simple home experiment to understand this concept.')}>🧪 Home Experiment</button>
                        </div>
                        <div className="input-container">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="chat-input"
                                placeholder="Query the physics mainframe..."
                            />
                            <button onClick={handleSend} className="send-btn">SEND</button>
                        </div>
                    </div>
                </>
            )}

            <div className={`notes-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="notes-header">
                    <h2>My Notes 📝</h2>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>❌</button>
                </div>
                <textarea 
                    className="notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write your study points here..."
                ></textarea>
            </div>
        </div>
    );
}

export default App;