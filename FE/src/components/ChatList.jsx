// src/components/ChatList.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import '../assets/ChatList.css';
import { handleStartChat } from '../utils/chatUtils';

const sortSessionsById = (sessions) => {
    return sessions.slice().sort((a, b) => {
        const idA = parseInt(a.sessionId, 10) || 0;
        const idB = parseInt(b.sessionId, 10) || 0;
        return idB - idA;
    });
};

// 최근 메시지 요약 함수 (길이를 제한)
const getMessageSummary = (message) => {
    if (!message) return "";
    const maxLength = 10; 
    return message.length > maxLength ? message.slice(0, maxLength) + "..." : message;
};

// ⭐️ 리스트에 표시할 최종 제목을 결정하는 함수 ⭐️
const getDisplayTitle = (session) => {
    // 1. 서버에서 생성된 유효한 제목이 있으면 사용
    if (session.title && session.title.trim() !== '' && session.title !== '새 대화') {
        return session.title;
    }
    
    // 2. 제목이 없거나 '새 대화'인 경우, 요약된 메시지를 임시 제목으로 사용
    if (session.lastMessage && session.lastMessage.trim() !== '') {
        // 이미 fetchChatSessions에서 요약되어 있으므로 그대로 사용하거나,
        // 원본 메시지를 저장했다면 다시 요약 (여기서는 저장된 lastMessage를 사용)
        return session.lastMessage; 
    }
    
    // 3. 아무 메시지도 없다면 '새 대화'를 표시
    return "새 대화";
};

function ChatList({ isOpen, onToggle }) {
    const [chatSessions, setChatSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchChatSessions = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError("사용자 ID를 찾을 수 없습니다.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get(`/api/users/${userId}/chat/sessions`);
            const sortedSessions = sortSessionsById(response.data);


            // 각 세션의 마지막 메시지를 가져와서 요약
            for (let session of sortedSessions) {
                const messageResponse = await api.get(`/api/users/${userId}/chat/sessions/${session.sessionId}/messages`);
                const lastMessage = messageResponse.data[messageResponse.data.length - 1];
                
                // 💡 session.lastMessage에 메시지 요약을 저장
                session.lastMessage = getMessageSummary(lastMessage ? lastMessage.content : "");
            }

            setChatSessions(sortedSessions);
            setError(null);
        } catch (err) {
            console.error("채팅 목록 로딩 실패:", err);
            setError("채팅 목록을 불러오는 중 오류가 발생했습니다.");
            setChatSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        await handleStartChat(navigate);
        await fetchChatSessions();
    };

    useEffect(() => {
        fetchChatSessions();
    }, []); // 💡 Context 관련 의존성 제거

    if (isLoading) {
        return (
            <aside className={`chat-list-sidebar ${isOpen ? 'open' : ''}`}>
                <h3>로딩 중...</h3>
            </aside>
        );
    }

    if (error) {
        return (
            <aside className={`chat-list-sidebar ${isOpen ? 'open' : ''}`}>
                <h3>오류</h3>
                <p>{error}</p>
            </aside>
        );
    }

    

//     return (
//         <aside className={`chat-list-sidebar ${isOpen ? 'open' : ''}`}>
//             <div className="chat-list-header">
//                 <button
//                     className="sidebar-close-btn"
//                     onClick={onToggle}
//                     title="목록 닫기"
//                 >
//                     ❮
//                 </button>
//                 <h3>대화 목록</h3>
//                 <button
//                     onClick={handleNewChat}
//                     className="new-chat-button"
//                     title="새 대화"
//                 >
//                     +
//                 </button>
//             </div>
//             <nav className="chat-session-nav">
//                 <ul>
//                     {chatSessions.length > 0 ? (
//                         chatSessions.map(session => (
//                             <li key={session.sessionId}>
//                                 <NavLink
//                                     to={`/chat/${session.sessionId}`}
//                                     className={({ isActive }) => isActive ? 'active' : ''}
//                                 >
//                                     {/* ⭐️ 수정된 부분: getDisplayTitle 함수를 사용하여 제목을 표시 ⭐️ */}
//                                     {getDisplayTitle(session)}
                                    
//                                     {/* <span> 태그는 제거했습니다. 제목 자체가 요약 메시지 역할을 하므로 중복을 피하기 위함입니다. */}
//                                 </NavLink>
//                             </li>
//                         ))
//                     ) : (
//                         <li className="no-chats">대화 기록이 없습니다.</li>
//                     )}
//                 </ul>
//             </nav>
//         </aside>
//     );
// }

    return (
        // chat-list-sidebar는 항상 존재하며, open 상태에 따라 CSS가 레일/전체 목록을 결정
        <aside className={`chat-list-sidebar ${isOpen ? 'open' : ''}`}>
            
            {/* ⭐️⭐️⭐️ 1. Rail/Toggle Button 영역 ⭐️⭐️⭐️ */}
            {/* 이 버튼은 사이드바의 첫 번째 요소로 위치하며, 레일이 닫혔을 때는 햄버거 메뉴 역할 */}
            
            {!isOpen && (
                 // 💡 닫힌 상태: 햄버거 메뉴 버튼만 중앙에 표시
                 <button
                    className="rail-toggle-btn" 
                    onClick={onToggle}
                    title="대화 목록 열기"
                 >
                    ☰
                 </button>
            )}
            
            {isOpen && (
                <>
                    {/* ⭐️⭐️⭐️ 2. Open Header 영역 (닫기 버튼, 제목, + 버튼) ⭐️⭐️⭐️ */}
                    <div className="sidebar-header">
                        <button
                            className="sidebar-close-btn" // 닫기 버튼 역할
                            onClick={onToggle}
                            title="목록 닫기"
                        >
                            ❮
                        </button>
                        <h3>대화 목록</h3>
                        <button
                            onClick={handleNewChat}
                            className="new-chat-button"
                            title="새 대화"
                        >
                            +
                        </button>
                    </div>
                
                    {/* ⭐️⭐️⭐️ 3. Open Navigation 영역 (대화 목록) ⭐️⭐️⭐️ */}
                    <nav className="chat-session-nav">
                        <ul>
                            {chatSessions.length > 0 ? (
                                chatSessions.map(session => (
                                    <li key={session.sessionId}>
                                        <NavLink
                                            to={`/chat/${session.sessionId}`}
                                            className={({ isActive }) => isActive ? 'active' : ''}
                                        >
                                            {getDisplayTitle(session)}
                                        </NavLink>
                                    </li>
                                ))
                            ) : (
                                <li className="no-chats">대화 기록이 없습니다.</li>
                            )}
                        </ul>
                    </nav>
                </>
            )}
        </aside>
    );
}

export default ChatList;