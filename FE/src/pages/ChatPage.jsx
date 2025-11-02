// src/pages/ChatPage.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ChatList from '../components/ChatList.jsx';
import '../assets/ChatPage.css';

function ChatPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`chat-layout-container ${isSidebarOpen ? 'shifted' : ''}`} style={{ margin: '1rem auto', maxWidth: '1200px' }}>            <ChatList isOpen={isSidebarOpen} onToggle={toggleSidebar} />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default ChatPage;