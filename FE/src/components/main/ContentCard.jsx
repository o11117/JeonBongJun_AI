// src/components/main/ContentCard.jsx (신규)

import React from 'react';
import '../../assets/ContentCard.css';

function ContentCard({ item }) {
    return (
        <div className="content-card">
            <div className="card-image-wrapper">
                <img src={item.imageUrl} alt={item.title} className="card-image" />
                {item.tag && <span className="card-tag">{item.tag}</span>}
            </div>
            <div className="card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

export default ContentCard;