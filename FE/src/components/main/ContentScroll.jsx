// src/components/main/ContentScroll.jsx (신규)

import React from 'react';
import ContentCard from './ContentCard.jsx';
import '../../assets/ContentScroll.css';

function ContentScroll({ title, items }) {
    return (
        <section className="content-scroll-section">
            <h2 className="section-title">{title}</h2>
            <div className="scroll-container">
                {items.map(item => (
                    <ContentCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

export default ContentScroll;