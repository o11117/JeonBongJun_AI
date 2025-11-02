// src/lib/api.js

import axios from 'axios';
/**
 * 백엔드 API에 주식 검색을 요청합니다.
 * @param {string} query - 사용자가 입력한 검색어
 * @returns {Promise<Array<Object>>} - 검색된 주식 객체 배열 (예: [{ stockCode: "005930", stockName: "삼성전자" }, ...])
 */
export const searchStocksByQuery = async (query) => {
    try {
        // 백엔드 컨트롤러에 정의한 엔드포인트: /api/stocks/search?query=검색어
        const response = await fetch(`/api/stocks/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Spring Boot에서 반환된 List<Stock>
    } catch (error) {
        console.error("Failed to search stocks:", error);
        return []; // 에러 발생 시 빈 배열 반환
    }
};

const api = axios.create({
    baseURL: '/',
    withCredentials: true
});

export default api;