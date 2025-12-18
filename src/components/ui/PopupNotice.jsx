import React, { useState, useEffect } from 'react';
import './PopupNotice.css';

const PopupNotice = () => {
    const [showChristmas, setShowChristmas] = useState(false);
    const [showEndDay, setShowEndDay] = useState(false);

    // Storage keys for "don't show today" preference
    const STORAGE_KEY_CHRISTMAS = 'popup_christmas_hidden_until';
    const STORAGE_KEY_ENDDAY = 'popup_endday_hidden_until';

    // Hide dates for each popup
    const CHRISTMAS_HIDE_DATE = new Date('2025-12-26T00:00:00');
    const ENDDAY_HIDE_DATE = new Date('2026-01-01T00:00:00');

    useEffect(() => {
        checkPopupVisibility();
    }, []);

    const checkPopupVisibility = () => {
        const now = new Date();

        // Check Christmas popup
        if (shouldShowPopup(STORAGE_KEY_CHRISTMAS, CHRISTMAS_HIDE_DATE, now)) {
            setShowChristmas(true);
        }

        // Check End Day popup
        if (shouldShowPopup(STORAGE_KEY_ENDDAY, ENDDAY_HIDE_DATE, now)) {
            setShowEndDay(true);
        }
    };

    const shouldShowPopup = (storageKey, hideAfterDate, currentDate) => {
        // Check if current date is past the hide date
        if (currentDate >= hideAfterDate) {
            return false;
        }

        // Check "don't show today" preference
        const hiddenUntil = localStorage.getItem(storageKey);
        if (hiddenUntil) {
            const hiddenDate = new Date(hiddenUntil);
            if (currentDate < hiddenDate) {
                return false;
            }
        }

        return true;
    };

    const handleClose = (popupType) => {
        if (popupType === 'christmas') {
            setShowChristmas(false);
        } else if (popupType === 'endday') {
            setShowEndDay(false);
        }
    };

    const handleDontShowToday = (storageKey, popupType) => {
        // Set hidden until tomorrow at midnight
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        localStorage.setItem(storageKey, tomorrow.toISOString());

        // Close the popup
        handleClose(popupType);
    };

    // Don't render anything if both popups are hidden
    if (!showChristmas && !showEndDay) {
        return null;
    }

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                {/* Christmas Popup */}
                {showChristmas && (
                    <div className="popup-card popup-fade-in">
                        <button
                            className="popup-close-x"
                            onClick={() => handleClose('christmas')}
                            aria-label="닫기"
                        >
                            ×
                        </button>
                        <div className="popup-image-container">
                            <img
                                src="/images/popups/251225_christmas.png"
                                alt="크리스마스 공지"
                                className="popup-image"
                            />
                        </div>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            handleDontShowToday(STORAGE_KEY_CHRISTMAS, 'christmas');
                                        }
                                    }}
                                />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button
                                className="popup-close-btn"
                                onClick={() => handleClose('christmas')}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}

                {/* End Day Popup */}
                {showEndDay && (
                    <div className="popup-card popup-fade-in">
                        <button
                            className="popup-close-x"
                            onClick={() => handleClose('endday')}
                            aria-label="닫기"
                        >
                            ×
                        </button>
                        <div className="popup-image-container">
                            <img
                                src="/images/popups/251231_endday.png"
                                alt="송구영신 공지"
                                className="popup-image"
                            />
                        </div>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            handleDontShowToday(STORAGE_KEY_ENDDAY, 'endday');
                                        }
                                    }}
                                />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button
                                className="popup-close-btn"
                                onClick={() => handleClose('endday')}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopupNotice;
