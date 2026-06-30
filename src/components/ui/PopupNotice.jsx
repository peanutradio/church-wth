import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PopupNotice.css';

const PopupNotice = () => {
    const [showMemberReg, setShowMemberReg] = useState(false);
    const [showChristmas, setShowChristmas] = useState(false);
    const [showEndDay, setShowEndDay] = useState(false);
    const [showTax, setShowTax] = useState(false);
    const [showBibleStudy, setShowBibleStudy] = useState(false);

    // Storage keys
    const STORAGE_KEY_MEMBER_REG = 'popup_member_reg_hidden_until';
    const STORAGE_KEY_CHRISTMAS = 'popup_christmas_hidden_until';
    const STORAGE_KEY_ENDDAY = 'popup_endday_hidden_until';
    const STORAGE_KEY_TAX = 'popup_tax_hidden_until';
    const STORAGE_KEY_BIBLE_STUDY = 'popup_bible_study_hidden_until';

    // Hide dates
    const MEMBER_REG_HIDE_DATE = new Date('2026-08-01T00:00:00');
    const CHRISTMAS_HIDE_DATE = new Date('2025-12-26T00:00:00');
    const ENDDAY_HIDE_DATE = new Date('2026-01-01T00:00:00');
    const TAX_HIDE_DATE = new Date('2026-01-16T00:00:00');
    const BIBLE_STUDY_HIDE_DATE = new Date('2026-03-09T00:00:00');

    const navigate = useNavigate();

    const handleNavigate = (path) => {
        // Close all popups
        setShowMemberReg(false);
        setShowChristmas(false);
        setShowEndDay(false);
        setShowTax(false);
        setShowBibleStudy(false);
        navigate(path);
    };

    useEffect(() => {
        checkPopupVisibility();
    }, []);

    const checkPopupVisibility = () => {
        const now = new Date();

        if (shouldShowPopup(STORAGE_KEY_MEMBER_REG, MEMBER_REG_HIDE_DATE, now)) setShowMemberReg(true);
        if (shouldShowPopup(STORAGE_KEY_CHRISTMAS, CHRISTMAS_HIDE_DATE, now)) setShowChristmas(true);
        if (shouldShowPopup(STORAGE_KEY_ENDDAY, ENDDAY_HIDE_DATE, now)) setShowEndDay(true);
        if (shouldShowPopup(STORAGE_KEY_TAX, TAX_HIDE_DATE, now)) setShowTax(true);
        if (shouldShowPopup(STORAGE_KEY_BIBLE_STUDY, BIBLE_STUDY_HIDE_DATE, now)) setShowBibleStudy(true);
    };

    const shouldShowPopup = (storageKey, hideAfterDate, currentDate) => {
        if (currentDate >= hideAfterDate) return false;
        const hiddenUntil = localStorage.getItem(storageKey);
        if (hiddenUntil && currentDate < new Date(hiddenUntil)) return false;
        return true;
    };

    const handleClose = (popupType) => {
        if (popupType === 'member_reg') setShowMemberReg(false);
        if (popupType === 'christmas') setShowChristmas(false);
        if (popupType === 'endday') setShowEndDay(false);
        if (popupType === 'tax') setShowTax(false);
        if (popupType === 'bible_study') setShowBibleStudy(false);
    };

    const handleDontShowToday = (storageKey, popupType) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        localStorage.setItem(storageKey, tomorrow.toISOString());
        handleClose(popupType);
    };

    if (!showMemberReg && !showChristmas && !showEndDay && !showTax && !showBibleStudy) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                {/* 새가족 등록 QR Popup (Priority) — 디자인: 딥 플럼 + 골드 */}
                {showMemberReg && (
                    <div className="popup-card popup-fade-in mreg-card">
                        <button className="popup-close-x mreg-close" onClick={() => handleClose('member_reg')}>×</button>
                        <div className="mreg-body">
                            <div className="mreg-eyebrow">New Family</div>
                            <span className="mreg-divider"></span>
                            <h2 className="mreg-title">7월 새가족 등록</h2>
                            <p className="mreg-sub">위더처치에 오신 것을 환영합니다.<br />아래 QR 코드로 새가족 등록을 해주세요.</p>
                            <div className="mreg-qr">
                                <img src="/images/popups/QR_register.jpg" alt="교인등록 QR" />
                            </div>
                            <p className="mreg-foot">We The Church</p>
                        </div>
                        <div className="mreg-footer">
                            <label className="mreg-check">
                                <input type="checkbox" onChange={(e) => e.target.checked && handleDontShowToday(STORAGE_KEY_MEMBER_REG, 'member_reg')} />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button className="mreg-btn" onClick={() => handleClose('member_reg')}>닫기</button>
                        </div>
                    </div>
                )}

                {/* Bible Study Popup (New) */}
                {showBibleStudy && (
                    <div className="popup-card popup-fade-in">
                        <button className="popup-close-x" onClick={() => handleClose('bible_study')}>×</button>
                        <a
                            href="https://forms.gle/iT2ApdjnMQhoLjJp8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="popup-image-container block cursor-pointer"
                            onClick={() => handleClose('bible_study')}
                        >
                            <img src="/images/popups/bible_study_2025_v3.png" alt="위더처치 말씀공방 1기 심화반" className="popup-image" />
                        </a>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input type="checkbox" onChange={(e) => e.target.checked && handleDontShowToday(STORAGE_KEY_BIBLE_STUDY, 'bible_study')} />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button className="popup-close-btn" onClick={() => handleClose('bible_study')}>닫기</button>
                        </div>
                    </div>
                )}

                {/* Tax Popup (Priority) */}
                {showTax && (
                    <div className="popup-card popup-fade-in">
                        <button className="popup-close-x" onClick={() => handleClose('tax')}>×</button>
                        <div onClick={() => handleNavigate('/tax-adjustment')} className="popup-image-container block cursor-pointer">
                            <img src="/images/popups/2025_tax_popup_dark.png?v=3" alt="기부금 영수증 신청" className="popup-image" />
                        </div>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input type="checkbox" onChange={(e) => e.target.checked && handleDontShowToday(STORAGE_KEY_TAX, 'tax')} />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button className="popup-close-btn" onClick={() => handleClose('tax')}>닫기</button>
                        </div>
                    </div>
                )}

                {/* Other Popups... */}
                {showChristmas && (
                    <div className="popup-card popup-fade-in">
                        <button className="popup-close-x" onClick={() => handleClose('christmas')}>×</button>
                        <div className="popup-image-container">
                            <img src="/images/popups/251225_christmas.png" alt="크리스마스 공지" className="popup-image" />
                        </div>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input type="checkbox" onChange={(e) => e.target.checked && handleDontShowToday(STORAGE_KEY_CHRISTMAS, 'christmas')} />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button className="popup-close-btn" onClick={() => handleClose('christmas')}>닫기</button>
                        </div>
                    </div>
                )}

                {showEndDay && (
                    <div className="popup-card popup-fade-in">
                        <button className="popup-close-x" onClick={() => handleClose('endday')}>×</button>
                        <div className="popup-image-container">
                            <img src="/images/popups/251231_endday.png" alt="송구영신 공지" className="popup-image" />
                        </div>
                        <div className="popup-footer">
                            <label className="popup-checkbox-label">
                                <input type="checkbox" onChange={(e) => e.target.checked && handleDontShowToday(STORAGE_KEY_ENDDAY, 'endday')} />
                                <span>오늘 더 이상 보지 않기</span>
                            </label>
                            <button className="popup-close-btn" onClick={() => handleClose('endday')}>닫기</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopupNotice;
