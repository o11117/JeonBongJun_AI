import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/Taegeukgi.json'; // 2단계에서 추가한 파일
import '../assets/LoadingFallback.css'; // 아래 4단계에서 만들 CSS

const style = {
    height: 300,
    width: 300,
};

// Suspense fallback으로 사용될 컴포넌트
export default function LoadingFallback() {
    return (
        <div className="loading-fallback-container">
            <Lottie animationData={animationData} style={style} loop={true} />
        </div>
    );
}