import { Routes, Route, Navigate } from "react-router-dom";

import MainPage from "./pages/MainPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import StockDetail from "./pages/StockDetail.jsx";
import WatchlistPage from "./pages/Watchlist.jsx";
import LatestNews from "./pages/LatestNews.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />

      <Route path="/chat" element={<ChatPage />}>
        <Route index element={<Navigate to="1" replace />} />
        <Route path=":chatId" element={<ChatWindow />} />
      </Route>
        <Route
            path='/news'
            element={<LatestNews />}
        />
      <Route path="/stock/:stockId" element={<StockDetail />} />
      <Route path="/watchlist" element={<WatchlistPage />} />

      {/* 404 진단용 */}
      <Route path="*" element={<div style={{ padding: 24 }}>No match</div>} />
    </Routes>
  );
}
