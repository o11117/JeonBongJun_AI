// src/components/NewsModal.jsx

import React from 'react';
import '../assets/NewsModal.css';

function NewsModal({ news, onClose }) {
    if (!news) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{news.title}</h2>
                    <span className="modal-press">{news.press}</span>
                </div>

                <div className="modal-body modal-iframe-body">
                    <iframe
                        src={news.url} // 백엔드에서 받은 원문 URL
                        title={news.title}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                    ></iframe>
                </div>
                {/* --- [수정 완료] --- */}

                <div className="modal-footer">
                    <button className="modal-close-button" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NewsModal;