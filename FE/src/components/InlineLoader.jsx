// src/components/InlineLoader.jsx
import React from 'react';
import Lottie from 'lottie-react';
// 2단계에서 추가했던 그 loading-animation.json 파일을 재사용합니다.
import animationData from '../assets/Taegeukgi.json';

const style = {
    height: 200, // 풀페이지 로더(300px)보다 작게
    width: 200,
};

export default function InlineLoader() {
    return (
        // .wl-skel, .wl-empty와 비슷한 스타일을 갖도록 div로 감쌉니다.
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '150px 0' // 위아래 여백
        }}>
            <Lottie animationData={animationData} style={style} loop={true} />
        </div>
    );
}