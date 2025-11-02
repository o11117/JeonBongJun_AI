
import { useEffect } from 'react';
import Router from './Routes.jsx';
import api from './lib/api';
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {

    useEffect(() => {

        const initializeApp = async () => {
            try {
                console.log("세션 초기화를 시도합니다...");

                const response = await api.get('/api/session/init');

                const { userId, isNewSession } = response.data;

                localStorage.setItem('userId', userId);

                if (isNewSession) {
                    console.log(`새로운 세션이 시작되었습니다. (UserID: ${userId})`);
                } else {
                    console.log(`기존 세션에 연결되었습니다. (UserID: ${userId})`);
                }

            } catch (error) {
                console.error("세션 초기화 중 오류 발생:", error);
            }
        };

        initializeApp();

    }, []); // [] : 앱이 처음 마운트될 때 1회만 실행

    return (
        <>
            <Nav />
            <Router />
            <Footer />
        </>
    )
}
