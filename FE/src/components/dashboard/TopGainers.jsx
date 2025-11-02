import React from 'react';

function TopGainers({ data }) {
    if (!Array.isArray(data)) {
        return <p>데이터를 기다리는 중...</p>;
    }
    
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.map((stock, index) => (
                <li key={stock.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.95em' }}>
                    {/* 왼쪽: 순위와 종목명 */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '25px', textAlign: 'left', marginRight: '8px', color: '#333' }}>{index + 1}.</span>
                        <span>{stock.name}</span>
                    </div>
                    {/* 오른쪽: 현재가와 등락률 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontWeight: '500', minWidth: '70px', textAlign: 'right' }}>
                            {stock.price.toLocaleString()}
                        </span>
                        <span style={{ color: 'red', fontWeight: '500', minWidth: '60px', textAlign: 'right' }}>
                            +{stock.change_rate}%
                        </span>
                    </div>
                </li>
            ))}
        </ul>
    );
}
export default TopGainers;