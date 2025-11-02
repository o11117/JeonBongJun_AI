// src/components/InlineLoader.jsx
import React from 'react';
import Lottie from 'lottie-react';
// 2단계에서 추가했던 그 loading-animation.json 파일을 재사용합니다.
import animationData from '../assets/BrushLoader.json';

const style = {
    height: 150, // 풀페이지 로더(300px)보다 작게
    width: 150,
};

export default function Chatloader() {
    return (
        // .wl-skel, .wl-empty와 비슷한 스타일을 갖도록 div로 감쌉니다.
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0' // 위아래 여백
        }}>
            <Lottie animationData={animationData} style={style} loop={true} />
        </div>
    );
}