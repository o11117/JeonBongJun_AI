// src/components/ChatWindowjsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api'; // api 임포트
import '../assets/ChatWindow.css';
import Chatloader from "./ChatLoader.jsx";

// ⭐️⭐️⭐️ 1. 전체 추천 질문 목록 정의 (함수 외부에 위치) ⭐️⭐️⭐️
const ALL_SUGGESTIONS = [
    // 기존 질문
    '**삼성전자**의 최근 5년 주가 흐름 분석해 줘.',
    '**가치 투자**와 **성장 투자**의 차이점을 설명해 줘.',
    '금리 인상 시기에 유망한 **섹터**는 어디야?',
    
    // 추가 질문 예시
    '**기술적 분석**에서 **MACD** 지표를 어떻게 활용해야 해?',
    '지금 **원/달러 환율**이 주식 시장에 미치는 영향은?',
    '내 포트폴리오의 **베타** 값을 계산해 줘.',
    '**ROE**와 **PBR** 지표를 활용한 종목 추천 기준은?',
    '**공매도**가 주가에 미치는 단기적, 장기적 영향은?',
    '다가오는 실적 시즌에 주목해야 할 **종목 3가지** 알려줘.',
];

// 배열에서 무작위로 N개의 요소를 선택하는 함수
const getRandomSuggestions = (arr, num) => {
    // 배열 복사 후 셔플
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    // 앞에서부터 N개 반환
    return shuffled.slice(0, num);
};

function ChatWindow() {
    const { chatId } = useParams();
    const [messages, setMessages] = useState([]);

    // 로딩 상태 분리: 초기 목록 로딩과 전송 대기 상태를 분리
    const [isFetchingList, setIsFetchingList] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const [error, setError] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const messageListRef = useRef(null); // 메시지 리스트 컨테이너 ref 정의

    // ⭐️⭐️⭐️ 2. 추천 질문을 저장할 state 추가 ⭐️⭐️⭐️
    const [currentSuggestions, setCurrentSuggestions] = useState([]);

    // ⭐️⭐️⭐️ 이 함수를 추가합니다 ⭐️⭐️⭐️
    const handleClickSuggestion = (question) => {
        // ** bold 마크다운을 제거하고 실제 텍스트만 추출합니다.
        const plainQuestion = question.replace(/\*\*/g, ''); 
        
        // 1. 입력창에 텍스트를 채워 넣습니다.
        setNewMessage(plainQuestion);

        // 2. (선택 사항) 만약 클릭 즉시 전송을 원한다면, 아래 코드를 사용합니다.
        //     handleSendMessage(null, plainQuestion); 
    };

    // 메시지 목록 가져오기 함수
    const fetchMessages = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId || !chatId) {
            setError("사용자 ID 또는 채팅 ID가 없습니다.");
            setIsFetchingList(false);
            setMessages([]);
            return;
        }

        try {
            // 초기 목록 로딩 상태만 관리
            setIsFetchingList(true);
            const response = await api.get(`/api/users/${userId}/chat/sessions/${chatId}/messages`);
            setMessages(response.data);
            setError(null);
        } catch (err) {
            console.error(`메시지 로딩 실패 (Chat ID: ${chatId}):`, err);
            setError("메시지를 불러오는 중 오류가 발생했습니다.");
            setMessages([]);
        } finally {
            setIsFetchingList(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [chatId]);

    // 🔥 수정: 메시지 리스트 컨테이너 내부에서만 스크롤
    useEffect(() => {
        if (messageListRef.current && messagesEndRef.current) {
            // scrollIntoView 대신 컨테이너의 scrollTop 직접 조작
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    // ⭐️⭐️⭐️ 3. 컴포넌트 로드 시, 랜덤 질문을 설정하는 useEffect 추가 ⭐️⭐️⭐️
    useEffect(() => {
        // 컴포넌트가 마운트될 때 (또는 chatId가 바뀔 때) 랜덤 질문 3개를 설정
        const randomQuestions = getRandomSuggestions(ALL_SUGGESTIONS, 3);
        setCurrentSuggestions(randomQuestions);
    }, [chatId]); // 채팅방이 바뀔 때마다 질문을 새로고침할 수 있도록 chatId 의존성 추가

    // 🟢 메시지 전송 및 AI 응답 처리 함수 (폴링 적용)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("사용자 ID가 없습니다.");
            return;
        }

        const userMessageContent = newMessage;
        setNewMessage("");
        setIsSending(true); // 전송 상태 시작

        // 1. 사용자 메시지 및 임시 AI 메시지 설정 (화면에 즉시 표시)
        const timestamp = Date.now();
        const sentMessage = {
            messageId: `user-${timestamp}`,
            sender: 'USER',
            content: userMessageContent,
            timestamp: new Date().toISOString(),
        };
        const tempAiMessageId = `ai-temp-${timestamp + 1}`;
        const aiWaitingMessage = {
            messageId: tempAiMessageId,
            sender: 'AI',
            content: 'AI가 응답을 생성하는 중입니다...',
            timestamp: new Date().toISOString(),
            isPending: true,
        };

        setMessages(prevMessages => [...prevMessages, sentMessage, aiWaitingMessage]);

        try {
            // 2. 사용자 질문 백엔드로 전송
            await api.post(`/api/users/${userId}/chat/sessions/${chatId}/query`, {
                question: userMessageContent
            });

            // 3. 🟢 [핵심 수정]: 폴링 로직으로 AI 응답이 DB에 저장되기를 기다립니다.
            let foundAiResponse = false;
            const maxAttempts = 30; // 💡 30회 시도 (1.5초 * 30 = 45초 대기)
            const delayMs = 1500;   // 1.5초 간격

            for (let i = 0; i < maxAttempts; i++) {
                const response = await api.get(`/api/users/${userId}/chat/sessions/${chatId}/messages`);
                const latestMessages = response.data;

                // 임시 메시지 다음의 마지막 메시지가 AI 응답인지 확인
                const lastMessage = latestMessages[latestMessages.length - 1];

                // 서버에서 가져온 마지막 메시지가 AI 응답이면 (그리고 임시 메시지가 아니면)
                if (lastMessage && lastMessage.sender === 'AI' && !lastMessage.isPending && lastMessage.content !== aiWaitingMessage.content) {
                    setMessages(latestMessages); // 상태를 최신 목록으로 업데이트
                    foundAiResponse = true;
                    break;
                }

                // AI 응답을 찾지 못했거나, 아직 임시 메시지가 DB에 반영된 상태라면 잠시 기다립니다.
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            if (!foundAiResponse) {
                console.warn("AI 응답을 시간 내에 찾지 못했습니다. 최종 목록을 새로고침합니다.");
                // 최종적으로 한 번 더 fetchMessages 호출 (실제 AI 응답을 확실히 가져옴)
                await fetchMessages();
            }

        } catch (err) {
            console.error("메시지 전송 실패:", err);
            alert("메시지 전송 중 오류가 발생했습니다.");
            // 롤백: 전송 실패 시, 사용자 메시지와 임시 AI 메시지를 제거합니다.
            setMessages(prevMessages => prevMessages.filter(msg =>
                msg.messageId !== sentMessage.messageId && msg.messageId !== tempAiMessageId
            ));
        } finally {
            setIsSending(false); // 전송 상태 종료
        }
    };


    // 로딩 시 UI 분리
    if (error) {
        return <div className="chat-window-container"><h3>오류</h3><p>{error}</p></div>;
    }

    if (isFetchingList) {
        return <div className="chat-window-container"><h3>메시지 목록을 불러오는 중...</h3></div>;
    }


    // src/components/ChatWindow.jsx (ChatWindow 함수 내부)

    // ... (생략: 기존 fetchMessages, useEffect, handleSendMessage 등) ...

    // ... (생략: 기존 isLoading, error 체크 if문) ...


    return (
        <div className="chat-window-container">
            <div className="message-list" ref={messageListRef}>
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg.messageId}
                            className={`message ${msg.sender === 'AI' ? 'message-bot' : 'message-user'}`}
                        >
                            <span className="message-sender">{msg.sender === 'AI' ? 'AI' : '나'}</span>
                            <div className="message-content">

                                {msg.isPending && msg.sender === 'AI' ? (
                                    <>
                                        {/* 로딩 애니메이션 */}
                                        <div className="pending-indicator">
                                            <div className="dot-typing"></div>
                                        </div>
                                        <Chatloader/>
                                        <p style={{ margin: 0, padding: 0 }}>전봉준 AI가 답변을 작성중이오...</p>
                                    </>
                                ) : (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-chat-state">
                        <span className="welcome-icon">👋</span> 
                        <h3>무엇을 분석해 드릴까요?</h3>
                        <p>궁금한 종목이나 투자 전략을 입력해 주시면 AI가 분석해 드립니다.</p>
                        <ul className="suggestion-list">
                            {/* 💡 currentSuggestions state를 맵핑하여 3개의 랜덤 질문 표시 */}
                            {currentSuggestions.map((question, index) => (
                                <li 
                                    key={index}
                                    onClick={() => handleClickSuggestion(question)}
                                >
                                    ✨ {question}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* 스크롤 대상 빈 div */}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="message-input"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                />
                <button type="submit" className="send-button" disabled={isSending}>
                    {isSending ? '전송 중...' : '전송'}
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;
