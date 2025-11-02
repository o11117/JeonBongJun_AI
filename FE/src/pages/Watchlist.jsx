import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api"; // 백엔드 API
import "../assets/Watchlist.css";
import InlineLoader from "../components/InlineLoader.jsx";

// (AI 서버 fetch 함수는 기존과 동일)
const fetchPriceFromAI = async (stockId) => {
  try {
    const res = await fetch(`ai/api/stock/${stockId}`);
    if (!res.ok) {
      throw new Error(`AI server request failed for ${stockId}`);
    }
    const data = await res.json();
    return {
      price: data.price,
      changePct: data.changePct,
      gainLossPct: data.changePct
    };
  } catch (err) {
    console.error(err);
    return { price: 0, changePct: 0.0, gainLossPct: 0.0 };
  }
};


export default function Watchlist() {
  const [tab, setTab] = useState("own");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [realOwnList, setRealOwnList] = useState([]);
  const [realWatchList, setRealWatchList] = useState([]);

  // (수정 State는 기존과 동일)
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [editAvgPrice, setEditAvgPrice] = useState("");

  // (1. 데이터 로드 useEffect - 기존과 동일)
  useEffect(() => {
    const fetchLists = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        console.error("userId 없음");
        return;
      }

      setLoading(true);
      try {
        const [portfolioRes, watchlistRes] = await Promise.all([
          api.get(`/api/users/${userId}/portfolio`),
          api.get(`/api/users/${userId}/watchlist`)
        ]);

        const portfolioWithPrices = await Promise.all(
            portfolioRes.data.map(async (item) => {
              const aiData = await fetchPriceFromAI(item.stockId);
              return {
                ...item,
                currentPrice: aiData.price,
                gainLossPct: aiData.changePct,
              };
            })
        );
        const watchlistWithPrices = await Promise.all(
            watchlistRes.data.map(async (item) => {
              const aiData = await fetchPriceFromAI(item.stockId);
              return {
                ...item,
                price: aiData.price,
                changePct: aiData.changePct,
              };
            })
        );

        setRealOwnList(portfolioWithPrices);
        setRealWatchList(watchlistWithPrices);

      } catch (err) {
        console.error("내 주식 정보 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, []);

  // 3. 탭 변경 / 데이터 변경 시 -> 화면 렌더링용 'rows' 업데이트
  useEffect(() => {
    if (loading) return;

    if (tab === "own") {
      // --- [수정] 평가액(totalValue) 계산 로직 추가 ---
      const mappedOwnList = realOwnList.map(item => {
        const avgPrice = item.avgPurchasePrice || 0;
        const currentPrice = item.currentPrice || 0;
        const quantity = item.quantity || 0;

        const profitAmt = (currentPrice - avgPrice) * quantity;
        const totalValue = currentPrice * quantity; // [신규] 평가액 계산

        // [수정] 보유 수익률은 사용자의 평균 매수가 기준으로 계산
        const profitPct = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

        return {
          id: item.stockId,
          name: item.stockName,
          price: currentPrice,
          quantity: quantity,
          profit: profitPct, // [변경] 포트폴리오 기준 수익률
          profitAmt: profitAmt,
          avgPurchasePrice: avgPrice,
          totalValue: totalValue // [신규] 평가액 state에 추가
        };
      });
      setRows(mappedOwnList);
    } else {
      // (관심 종목 탭은 기존과 동일)
      const mappedWatchList = realWatchList.map(item => ({
        id: item.stockId,
        name: item.stockName,
        price: item.price,
        changePct: item.changePct,
      }));
      setRows(mappedWatchList);
    }
  }, [tab, realOwnList, realWatchList, loading]);

  // (핸들러 함수들은 기존과 동일)
  const handleStockClick = (id) => {
    if (editingId) return;
    navigate(`/stock/${id}`);
  };

  const handleUnwatch = async (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      await api.delete(`/api/users/${userId}/watchlist/${id}`);
      setRealWatchList((prev) => prev.filter((r) => r.stockId !== id));
    } catch (err) {
      console.error("관심 종목 삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleRemoveOwn = async (id) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    if (window.confirm("정말 이 종목을 보유목록에서 제거할까요?")) {
      try {
        await api.delete(`/api/users/${userId}/portfolio/${id}`);
        setRealOwnList((prev) => prev.filter((r) => r.stockId !== id));
      } catch (err) {
        console.error("보유 종목 삭제 실패:", err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditQty(row.quantity);
    setEditAvgPrice(row.avgPurchasePrice);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateOwn = async (id) => {
    const userId = localStorage.getItem('userId');
    const numQty = parseInt(editQty, 10);
    const numAvgPrice = parseInt(editAvgPrice, 10);

    if (!numQty || numQty <= 0) return alert("수량을 올바르게 입력하세요.");
    if (!numAvgPrice || numAvgPrice <= 0) return alert("평균 매수 단가를 올바르게 입력하세요.");

    const payload = {
      quantity: numQty,
      avgPurchasePrice: numAvgPrice
    };

    try {
      const res = await api.put(`/api/users/${userId}/portfolio/${id}`, payload);
      const updatedItem = res.data;

      setRealOwnList(prevList =>
          prevList.map(item =>
              item.stockId === id
                  ? {
                    ...item,
                    quantity: updatedItem.quantity,
                    avgPurchasePrice: updatedItem.avgPurchasePrice
                  }
                  : item
          )
      );
      setEditingId(null);

    } catch (err) {
      console.error("보유 종목 수정 실패:", err);
      alert("수정에 실패했습니다.");
    }
  };


  return (
      <div className="wl-page">
        {/* (헤더, 탭바는 기존과 동일) */}
        <div className="wl-header">
          <h1 className="wl-h1">내 주식</h1>
          <div className="wl-tabbar">
            <button
                className={`wl-pill ${tab === "own" ? "active" : ""}`}
                onClick={() => setTab("own")}
            >
              보유 종목
            </button>
            <button
                className={`wl-pill ${tab === "watch" ? "active" : ""}`}
                onClick={() => setTab("watch")}
            >
              관심 종목
            </button>
            <div className={`wl-underline ${tab}`} />
          </div>
        </div>

        <div className="wl-card">
          {loading ? ( <InlineLoader /> )
              : rows.length === 0 ? (
                  <div className="wl-empty">
                    {tab === "watch"
                        ? "💡 아직 관심등록한 종목이 없습니다."
                        : "💡 보유 중인 종목이 없습니다."}
                  </div>
              ) : (
                  <>
                    {/* --- [수정] 헤더에 '평가액' 추가 --- */}
                    <div className="wl-row wl-head">
                      <div className="c-name">종목명</div>
                      <div className="c-price">현재가</div>
                      {tab === "own" && <div className="c-value">평가액</div>} {/* [신규] 평가액 헤더 */}
                      {tab === "own" && <div className="c-qty">{editingId ? "평단" : "보유수량"}</div>}
                      <div className="c-change">{tab === "own" ? (editingId ? "수량" : "수익(률)") : "등락률"}</div>
                    </div>

                    {rows.map((r) => (
                        <div className={`wl-row ${editingId === r.id ? 'editing' : ''}`} key={r.id}>

                          {/* 종목명 */}
                          <div className="c-name">
                      <span className={`wl-link ${editingId ? 'disabled' : ''}`} onClick={() => handleStockClick(r.id)}>
                        {r.name}
                      </span>
                            <span className="wl-ticker">{r.id}</span>
                          </div>

                          {/* 현재가 */}
                          <div className="c-price">₩{Number(r.price).toLocaleString("ko-KR")}</div>

                          {/* --- [신규] 평가액 --- */}
                          {tab === "own" && (
                              <div className="c-value">
                                ₩{Number(r.totalValue).toLocaleString("ko-KR")}
                              </div>
                          )}

                          {/* 보유수량 (수정 모드 시 평단 입력) */}
                          {tab === "own" && (
                              <div className="c-qty">
                                {editingId === r.id ? (
                                    <input
                                        type="number"
                                        className="wl-edit-input"
                                        value={editAvgPrice}
                                        onChange={(e) => setEditAvgPrice(e.target.value)}
                                        placeholder="평균 매수 단가"
                                    />
                                ) : (
                                    r.quantity
                                )}
                              </div>
                          )}

                          {/* 수익/등락률 (수정 모드 시 수량 입력) */}
                          <div className={`c-change ${ (r.profit ?? r.changePct ?? 0) >= 0 ? "up" : "down" }`}>
                            {tab === "own" ? (
                                editingId === r.id ? (
                                    <input
                                        type="number"
                                        className="wl-edit-input"
                                        value={editQty}
                                        onChange={(e) => setEditQty(e.target.value)}
                                        placeholder="보유 수량"
                                    />
                                ) : (
                                    <>
                            <span className="wl-profit-amt">
                              {r.profitAmt >= 0 ? "+" : ""}
                              {Number(r.profitAmt).toLocaleString("ko-KR")}
                            </span>
                                      <span>
                              ({(r.profit ?? 0) >= 0 ? "+" : ""}
                                        {(r.profit ?? 0).toFixed(2)}%)
                            </span>
                                    </>
                                )
                            ) : (
                                <>
                                  {(r.changePct ?? 0) >= 0 ? "+" : ""}
                                  {(r.changePct ?? 0).toFixed(2)}%
                                </>
                            )}
                          </div>

                          {/* 액션 버튼 (수정 모드 핸들링) */}
                          <div className="c-actions">
                            {tab === "watch" ? (
                                <button className="wl-btn ghost" onClick={() => handleUnwatch(r.id)}>
                                  관심 해제
                                </button>
                            ) : editingId === r.id ? (
                                <>
                                  <button className="wl-btn save" onClick={() => handleUpdateOwn(r.id)}>
                                    저장
                                  </button>
                                  <button className="wl-btn ghost" onClick={handleCancelEdit}>
                                    취소
                                  </button>
                                </>
                            ) : (
                                <>
                                  <button className="wl-btn" onClick={() => handleEditClick(r)}>
                                    수정
                                  </button>
                                  <button className="wl-btn ghost danger" onClick={() => handleRemoveOwn(r.id)}>
                                    삭제
                                  </button>
                                </>
                            )}
                          </div>
                        </div>
                    ))}
                  </>
              )}
        </div>
      </div>
  );
}