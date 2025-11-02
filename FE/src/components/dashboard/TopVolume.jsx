import React from 'react'; 
import StockListItem from './StockListItem';

function TopVolume({ data }) {
    if (!Array.isArray(data)) {
        return <p>데이터를 기다리는 중...</p>;
    }
    
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.map((stock, index) => (
                <StockListItem
                    key={stock.code}
                    rank={index + 1}
                    name={stock.name}
                    value={
                        <span>
                            <span style={{ fontSize: '0.85em', color: '#9ca3af', marginRight: '5px' }}>
                                거래량
                            </span>
                            {stock.volume.toLocaleString()}
                        </span>
                    }
                />
            ))}
        </ul>
    );
}

export default TopVolume;