// src/pages/LatestNews.jsx

import React, { useState, useEffect } from 'react';
import NewsModal from '../components/NewsModal.jsx'; // 1. 모달 컴포넌트 import
import api from '../lib/api.js';
import '../assets/LatestNews.css';
import InlineLoader from "../components/InlineLoader.jsx";

function LatestNews() {
    const [newsList, setNewsList] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null); // 2. 모달 상태(state) 추가
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/api/news/latest');
                setNewsList(response.data);
            } catch (error) {
                console.error("뉴스 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNews();
    }, []);

    // 3. 모달 열기/닫기 핸들러 추가
    const handleOpenModal = (newsItem) => {
        setSelectedNews(newsItem);
    };

    const handleCloseModal = () => {
        setSelectedNews(null);
    };

    if (isLoading) {
        return <InlineLoader/>;
    }

    return (
        <section className="news-container">
            <h2 className="section-title">최신 마켓 뉴스</h2>
            <div className="news-list">
                {newsList.map((news) => (
                    <div key={news.id} className="news-item-card">
                        <div className="news-card-header">
                            <span className="news-press">{news.press}</span>
                        </div>
                        <h3 className="news-title">{news.title}</h3>

                        {/* 백엔드가
                          Postman 응답 [User-provided JSON]에 맞춰
                          요약본(highlight)을 summary 필드로
                          전달합니다.
                        */}
                        <p
                            className="news-summary"
                            dangerouslySetInnerHTML={{ __html: news.summary }}
                        />

                        {/* 4. <a> 태그 대신 <button>으로 변경 */}
                        <button
                            className="read-more-button"
                            onClick={() => handleOpenModal(news)}
                        >
                            더보기
                        </button>
                    </div>
                ))}
            </div>

            {/* 5. 모달 렌더링 로직 */}
            {selectedNews && (
                <NewsModal news={selectedNews} onClose={handleCloseModal} />
            )}
        </section>
    );
}

export default LatestNews;