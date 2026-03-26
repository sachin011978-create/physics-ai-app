import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Notice: I removed the "import './index.css'" line 
// because we don't need it for your Physics AI to work!

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)