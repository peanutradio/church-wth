import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// 2026 위더처치 패밀리 캠프 참가 신청 페이지
// - 포스터 톤(크림/테라코타/네이비)에 맞춘 디자인
// - 참가자 명단을 연령대와 함께 받아 참가비를 자동 계산합니다.

// DB에 한글 그대로 저장합니다 (명부를 전처리 없이 바로 쓰기 위해)
const AGE_GROUPS = [
    { value: '성인', fee: 30000 },
    { value: '중고등', fee: 20000 },
    { value: '초등', fee: 10000 },
    { value: '미취학', fee: 10000 },
];

const FEE_OF = AGE_GROUPS.reduce((acc, g) => ({ ...acc, [g.value]: g.fee }), {});

// 한 가족의 신청을 묶는 키 (구형 브라우저 대비 fallback 포함)
const makeUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
};
const ACCOUNT = '신한은행 140-015-516800 위더처치교회';
const BRICKS = ['#C0622E', '#E8CBA8', '#4A6B52', '#9C5B33', '#D89A63', '#7A4B2A', '#C0622E', '#E8CBA8'];

// 포스터의 모자이크 집을 딴 벽돌 구분선 ("함께 지어져가네")
const BrickRow = () => (
    <div className="flex gap-1 justify-center my-8" aria-hidden="true">
        {BRICKS.map((c, i) => (
            <span key={i} className="w-4 h-4 rounded-[3px]" style={{ background: c }} />
        ))}
    </div>
);

const SectionTitle = ({ num, title, desc }) => (
    <div className="mb-5">
        <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-md bg-[#C0622E] text-white text-sm font-bold flex items-center justify-center shrink-0">
                {num}
            </span>
            <h2 className="text-lg font-bold text-[#22355B]">{title}</h2>
        </div>
        {desc && <p className="text-sm text-[#7A6E5F] mt-2 pl-10">{desc}</p>}
    </div>
);

const inputClass =
    'w-full px-4 py-3 bg-white border border-[#DED5C6] rounded-lg text-[#22355B] placeholder-[#C3B8A5] focus:border-[#C0622E] focus:ring-2 focus:ring-[#C0622E]/20 outline-none transition-colors';

const FamilyCamp = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [members, setMembers] = useState([{ key: 1, name: '', age_group: '성인' }]);
    const [transport, setTransport] = useState('');
    const [pickup, setPickup] = useState(false);
    const [allergy, setAllergy] = useState('');
    const [request, setRequest] = useState('');
    const [agreed, setAgreed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        if (formatted.length <= 13) setPhone(formatted);
    };

    // ── 참가자 명단 ──
    const addMember = () =>
        setMembers((prev) => [...prev, { key: Date.now(), name: '', age_group: '성인' }]);

    const removeMember = (key) =>
        setMembers((prev) => (prev.length > 1 ? prev.filter((m) => m.key !== key) : prev));

    const updateMember = (key, field, value) =>
        setMembers((prev) => prev.map((m) => (m.key === key ? { ...m, [field]: value } : m)));

    // ── 자동 집계 ──
    const counts = members.reduce(
        (acc, m) => ({ ...acc, [m.age_group]: (acc[m.age_group] || 0) + 1 }),
        {}
    );
    const totalFee = members.reduce((sum, m) => sum + (FEE_OF[m.age_group] || 0), 0);

    const copyAccount = () => {
        navigator.clipboard.writeText(ACCOUNT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (members.some((m) => !m.name.trim())) {
            alert('참가자 명단의 성함을 모두 입력해주세요.');
            return;
        }
        if (!transport) {
            alert('이동 방법을 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 참가자 1명당 1행으로 저장 (같은 가족은 application_id로 묶임)
            const applicationId = makeUUID();
            const rows = members.map((m, idx) => ({
                application_id: applicationId,
                applicant_name: name.trim(),
                participant_name: m.name.trim(),
                relation: idx === 0 ? '본인' : '가족',
                age_group: m.age_group,
                fee: FEE_OF[m.age_group] || 0,
                phone,
                transport: transport === 'car' ? '개인차량' : '대중교통',
                pickup_needed: transport === 'public' ? pickup : false,
                allergy: allergy.trim() || null,
                request: request.trim() || null,
                privacy_agreed: true,
            }));

            const { error } = await supabase.from('camp_applications').insert(rows);

            if (error) throw error;
            setSubmitted(true);
        } catch (err) {
            console.error('캠프 신청 오류:', err);
            alert('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F2EA] pt-32 pb-20 px-4">
            {/* 신청 완료 모달 */}
            {submitted && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scale-up text-center">
                        <div className="w-16 h-16 bg-[#4A6B52]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-[#4A6B52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#22355B] mb-2">신청이 완료되었습니다!</h2>
                        <p className="text-[#6B6255] mb-2 leading-relaxed">
                            아래 계좌로 참가비를 입금해주시면<br />신청이 최종 확정됩니다.
                        </p>
                        <div className="bg-[#F6F2EA] rounded-xl p-4 my-5 text-left">
                            <p className="text-xs text-[#7A6E5F] mb-1">입금하실 금액</p>
                            <p className="text-2xl font-bold text-[#C0622E] mb-3">{totalFee.toLocaleString()}원</p>
                            <p className="text-xs text-[#7A6E5F] mb-1">입금 계좌</p>
                            <p className="text-sm text-[#22355B]">{ACCOUNT}</p>
                        </div>
                        <button
                            onClick={() => (window.location.href = '/')}
                            className="w-full bg-[#22355B] text-white font-bold py-3 rounded-xl hover:bg-[#1a2947] transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* 포스터 헤더 */}
                <header className="text-center mb-10">
                    <p className="text-xs tracking-[0.25em] text-[#C0622E] font-semibold mb-3">
                        WE, THE CHURCH FAMILY CAMP
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#22355B] font-serif mb-4">함께 지어져가네</h1>
                    <p className="text-sm text-[#7A6E5F] leading-relaxed">
                        너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여<br />
                        그리스도 예수 안에서 함께 지어져 가느니라 <span className="text-[#C0622E]">(엡 2:22)</span>
                    </p>

                    <BrickRow />

                    <dl className="inline-grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-left">
                        <dt className="text-[#7A6E5F]">일시</dt>
                        <dd className="text-[#22355B] font-medium">2026.10.30 ~ 2026.11.01</dd>
                        <dt className="text-[#7A6E5F]">장소</dt>
                        <dd className="text-[#22355B] font-medium">가평 오륜비전빌리지</dd>
                        <dt className="text-[#7A6E5F]">대상</dt>
                        <dd className="text-[#22355B] font-medium">전교인</dd>
                    </dl>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. 신청자 정보 */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DCCC]">
                        <SectionTitle num="1" title="신청자(대표자) 기본 정보" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#22355B] mb-1.5">
                                    성명 <span className="text-[#C0622E]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="홍길동"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#22355B] mb-1.5">
                                    연락처 <span className="text-[#C0622E]">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    required
                                    placeholder="010-0000-0000"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    {/* 2. 참가 인원 */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DCCC]">
                        <SectionTitle
                            num="2"
                            title="참가 인원 및 동반 가족"
                            desc="본인을 포함해 참가하는 모든 분의 성함과 연령대를 입력해주세요. 참가비가 자동으로 계산됩니다."
                        />

                        <div className="space-y-3">
                            {members.map((m, idx) => (
                                <div key={m.key} className="flex gap-2 items-center">
                                    <span className="w-6 text-sm text-[#B0A491] shrink-0">{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={m.name}
                                        onChange={(e) => updateMember(m.key, 'name', e.target.value)}
                                        placeholder={idx === 0 ? '본인 성함' : '가족 성함'}
                                        className={`${inputClass} flex-1 py-2.5`}
                                    />
                                    <select
                                        value={m.age_group}
                                        onChange={(e) => updateMember(m.key, 'age_group', e.target.value)}
                                        className="px-3 py-2.5 bg-white border border-[#DED5C6] rounded-lg text-[#22355B] text-sm focus:border-[#C0622E] outline-none cursor-pointer"
                                    >
                                        {AGE_GROUPS.map((g) => (
                                            <option key={g.value} value={g.value}>
                                                {g.value}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeMember(m.key)}
                                        disabled={members.length === 1}
                                        aria-label="참가자 삭제"
                                        className="w-9 h-9 shrink-0 rounded-lg text-[#B0A491] hover:text-[#C0622E] hover:bg-[#F6F2EA] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#B0A491] transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addMember}
                            className="mt-4 w-full py-2.5 border border-dashed border-[#C0622E]/50 text-[#C0622E] rounded-lg text-sm font-medium hover:bg-[#C0622E]/5 transition-colors"
                        >
                            + 가족 추가
                        </button>

                        <div className="mt-5 pt-5 border-t border-[#EDE5D8] flex items-center justify-between">
                            <span className="text-sm text-[#7A6E5F]">
                                총 <strong className="text-[#22355B]">{members.length}</strong>명
                                <span className="text-[#B0A491]">
                                    {' '}
                                    ({AGE_GROUPS.map((g) => `${g.value} ${counts[g.value] || 0}`).join(' · ')})
                                </span>
                            </span>
                        </div>
                    </section>

                    {/* 3. 교통편 */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DCCC]">
                        <SectionTitle num="3" title="교통편 및 이동" desc="캠프 장소(가평 오륜비전빌리지) 이동 방법을 선택해주세요." />
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'car', label: '개인 차량 이용' },
                                { value: 'public', label: '대중교통 이용' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setTransport(opt.value)}
                                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${transport === opt.value
                                        ? 'bg-[#22355B] text-white border-[#22355B]'
                                        : 'bg-white text-[#6B6255] border-[#DED5C6] hover:border-[#22355B]/40'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {transport === 'public' && (
                            <label className="mt-4 flex items-center gap-3 p-4 bg-[#F6F2EA] rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={pickup}
                                    onChange={(e) => setPickup(e.target.checked)}
                                    className="w-5 h-5 accent-[#C0622E] cursor-pointer"
                                />
                                <span className="text-sm text-[#22355B]">가평역 픽업을 요청합니다</span>
                            </label>
                        )}
                    </section>

                    {/* 4. 사전 고지 */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DCCC]">
                        <SectionTitle num="4" title="안전 및 편의를 위한 사전 고지" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#22355B] mb-1.5">
                                    식사 관련 알레르기 및 특이 체질
                                </label>
                                <textarea
                                    value={allergy}
                                    onChange={(e) => setAllergy(e.target.value)}
                                    rows={2}
                                    placeholder="예: 땅콩, 갑각류 알레르기"
                                    className={`${inputClass} resize-none`}
                                />
                                <p className="text-xs text-[#B0A491] mt-1.5">
                                    단체 식사 및 간식 준비를 위해 예민한 음식이나 알레르기가 있다면 적어주세요.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#22355B] mb-1.5">기타 요청 사항</label>
                                <textarea
                                    value={request}
                                    onChange={(e) => setRequest(e.target.value)}
                                    rows={2}
                                    placeholder="자유롭게 적어주세요"
                                    className={`${inputClass} resize-none`}
                                />
                                <p className="text-xs text-[#B0A491] mt-1.5">
                                    교회 스태프가 미리 파악하고 배려해야 할 부분이 있다면 적어주세요.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. 참가비 */}
                    <section className="bg-white rounded-2xl p-6 md:p-8 border border-[#E5DCCC]">
                        <SectionTitle num="5" title="참가비 안내" desc="성인 3만원 / 중고등 2만원 / 초등·미취학 1만원" />

                        <div className="bg-[#F6F2EA] rounded-xl p-5">
                            <div className="space-y-1.5 text-sm">
                                {AGE_GROUPS.filter((g) => counts[g.value] > 0).map((g) => (
                                    <div key={g.value} className="flex justify-between text-[#6B6255]">
                                        <span>
                                            {g.value} {counts[g.value]}명 × {g.fee.toLocaleString()}원
                                        </span>
                                        <span>{(counts[g.value] * g.fee).toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#DED5C6]">
                                <span className="font-semibold text-[#22355B]">총 참가비</span>
                                <span className="text-2xl font-bold text-[#C0622E]">{totalFee.toLocaleString()}원</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <p className="text-xs text-[#7A6E5F] mb-0.5">입금 계좌</p>
                                <p className="text-sm text-[#22355B]">{ACCOUNT}</p>
                            </div>
                            <button
                                type="button"
                                onClick={copyAccount}
                                className="px-4 py-2 bg-[#C0622E] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                {copied ? '복사완료' : '계좌 복사'}
                            </button>
                        </div>
                        <p className="text-xs text-[#B0A491] mt-3">
                            신청 후 위 계좌로 입금해주시면 신청이 최종 확정됩니다.
                        </p>
                    </section>

                    {/* 개인정보 동의 */}
                    <label className="flex items-center gap-3 bg-white border border-[#E5DCCC] rounded-xl p-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="w-5 h-5 accent-[#C0622E] cursor-pointer shrink-0"
                        />
                        <span className="text-sm text-[#22355B]">
                            캠프 운영을 위한 개인정보(성명·연락처·건강 정보) 수집 및 이용에 동의합니다.
                            <span className="block text-xs text-[#B0A491] mt-0.5">
                                수집된 정보는 캠프 운영 목적으로만 사용되며 종료 후 파기됩니다.
                            </span>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        className="w-full bg-[#22355B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1a2947] transition-colors disabled:bg-[#B0A491] disabled:cursor-not-allowed"
                    >
                        {loading ? '제출 중...' : '신청하기'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FamilyCamp;
