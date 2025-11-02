// src/components/main/AboutSection.jsx (이미지 주소 수정)

import { useNavigate } from 'react-router-dom'; // useNavigate 훅을 임포트
import { handleStartChat } from '../../utils/chatUtils'; // 공통 함수 임포트
import '../../assets/AboutSection.css';

function AboutSection() {
    const navigate = useNavigate(); // navigate 함수를 사용하여 페이지 이동

    return (
        <section className="about-section">
            <div className="about-image">
                <img
                    // --- 이미지 수정 ---
                    src="https://dummyimage.com/500x400/f3f1ef/8d6e63.png&text=RAG+Technology"
                    alt="RAG 기술 스택"
                />
            </div>
            <div className="about-content">
                <h2>'전봉준'은 어떻게 다른가요?</h2>
                <p>
                    '전봉준'은 단순한 챗봇이 아닙니다.
                    최신 LangChain 및 RAG(Retrieval-Augmented Generation) 기술을 기반으로,
                    방대한 실시간 시장 데이터를 검색하고 분석하여
                    가장 정확하고 맥락에 맞는 투자 조언을 생성합니다.
                </p>
                <button onClick={() => handleStartChat(navigate)} className="about-button">
                    AI 분석 경험하기
                </button>
            </div>
        </section>
    );
}

export default AboutSection;