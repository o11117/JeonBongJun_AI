// src/components/main/Hero.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅을 임포트
import { handleStartChat } from '../../utils/chatUtils'; // 공통 함수 임포트
import { Link } from 'react-router-dom';
import '../../assets/Hero.css';

function Hero() {
    const navigate = useNavigate(); // navigate 함수를 사용하여 페이지 이동

    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>AI 로보 어드바이저, 전봉준</h1>
                <p>LangChain과 RAG로 구동되는 당신만의 투자 비서</p>
                <button onClick={() => handleStartChat(navigate)} className="hero-button">
                    지금 바로 상담 시작하기
                </button>
            </div>
        </section>
    );
}

export default Hero;