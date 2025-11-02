import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function WatchlistSummary() {
    const [watchlist, setWatchlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const watchlistRes = await fetch(`/api/users/${userId}/watchlist`);
                if (!watchlistRes.ok) {
                    if (watchlistRes.status === 404) {
                        setWatchlist([]);
                        return;
                    }
                    throw new Error('관심 종목 목록을 가져오는 데 실패했습니다.');
                }
                const watchlistFromJava = await watchlistRes.json();

                if (watchlistFromJava.length === 0) {
                    setWatchlist([]);
                    return;
                }

                const tickers = watchlistFromJava.map(item => item.stockId);

                const pricesRes = await fetch('/ai/api/stock-details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tickers }),
                });
                if (!pricesRes.ok) {
                    throw new Error('실시간 시세 정보를 가져오는 데 실패했습니다.');
                }
                const pricesFromPython = await pricesRes.json();

                const priceMap = new Map(pricesFromPython.map(item => [item.id, item]));
                const combinedWatchlist = watchlistFromJava.map(item => ({
                    ...item,
                    price: priceMap.get(item.stockId)?.price || 0,
                    changeRate: priceMap.get(item.stockId)?.changePct || 0,
                }));

                setWatchlist(combinedWatchlist);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>불러오는 중...</p>;
    if (error) return <p style={{ color: '#666' }}>{error}</p>;
    if (!watchlist || watchlist.length === 0) return <p style={{ color: '#666' }}>관심 종목이 없습니다.</p>;

    return (
        <div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {watchlist.slice(0, 5).map(stock => {
                    const isUp = stock.changeRate > 0;
                    const isDown = stock.changeRate < 0;
                    const color = isUp ? 'red' : (isDown ? 'blue' : 'black');
                    const sign = isUp ? '+' : '';

                    return (
                        <li key={stock.stockId}>
                            <Link to={`/stock/${stock.stockId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.95em' }}>{stock.stockName}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
                                        <span style={{ minWidth: '60px', textAlign: 'right' }}>
                                            {stock.price.toLocaleString()}
                                        </span>
                                        <span style={{ color: color, fontWeight: '500', minWidth: '50px', textAlign: 'right' }}>
                                            {sign}{stock.changeRate}%
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            {watchlist.length > 5 && (
                 <Link to="/watchlist" style={{ display: 'block', textAlign: 'right', marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                    더보기...
                </Link>
            )}
        </div>
    );
}

export default WatchlistSummary;