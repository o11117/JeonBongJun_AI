// src/components/Nav.jsx

import React, { useState, useEffect, useRef } from 'react';
import '../assets/Nav.css'; // Nav.css 파일 import
import useDebounce from '../components/hooks/useDebounce'; // 디바운스 훅
import { searchStocksByQuery } from '../lib/api'; // API 호출 함수
import { useNavigate, Link } from 'react-router-dom';
import { handleStartChat, handleGoToLatestChat } from '../utils/chatUtils';

function Nav() {
    const [query, setQuery] = useState(''); // 검색어
    const [results, setResults] = useState([]); // 검색 결과
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태

    const navigate = useNavigate();

    const searchContainerRef = useRef(null); // 검색창+드롭다운 영역 참조

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery) {
                try {
                    const data = await searchStocksByQuery(debouncedQuery);
                    setResults(data);
                    setIsDropdownOpen(data.length > 0);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                    setResults([]);
                    setIsDropdownOpen(false);
                }
            } else {
                setResults([]);
                setIsDropdownOpen(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // 검색 결과 항목 클릭 시
    const handleResultClick = (stockId) => {
        navigate(`/stock/${stockId}`); // 상세 페이지로 이동
        setQuery('');
        setResults([]);
        setIsDropdownOpen(false);
    };

    // 검색창 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [searchContainerRef]);

    return (
        <nav className="navbar">
            <div className="nav-section nav-left">
                <Link to="/" className="nav-logo">전봉준</Link>

                <div className="search-container" ref={searchContainerRef}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="종목명 또는 코드를 검색하시오."
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setIsDropdownOpen(true)}
                    />

                    {isDropdownOpen && results.length > 0 && (
                        <ul className="search-results-dropdown">
                            {results.map((stock) => (
                                <li
                                    // Stock 엔티티의 stockId, stockName 사용
                                    key={stock.stockId}
                                    onClick={() => handleResultClick(stock.stockId)}
                                >
                                    {stock.stockName} ({stock.stockId})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="nav-section nav-right">
                <ul className="nav-links">
                    <li><Link to="/news">최신 뉴스</Link></li>
                    <li><Link to="/watchlist">나의 자산</Link></li>
                    <li>
                        <Link
                            to="/chat"
                            onClick={async (e) => {
                                e.preventDefault();
                                const success = await handleGoToLatestChat(navigate);
                                if (!success) {
                                    // 최신 채팅이 없거나 오류 발생 시 새 채팅을 시작
                                    handleStartChat(navigate);
                                }
                            }}
                        >
                            투자 상담
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Nav;