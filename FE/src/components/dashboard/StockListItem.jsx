import React from 'react';

function StockListItem({ rank, name, value, valueColor = 'black' }) {
    return (
        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '0.95em' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '25px', textAlign: 'center', marginRight: '8px', color: '#666' }}>{rank}.</span>
                <span>{name}</span>
            </div>
            <span style={{ color: valueColor, fontWeight: '500' }}>{value}</span>
        </li>
    );
}

export default StockListItem;