import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

// 관리자 전용: 2026 패밀리 캠프 참가 신청 내역
// - 신청 현황 집계 / 입금 확인 / CSV·엑셀 다운로드

const AGE_LABEL = { adult: '성인', youth: '중고등', elementary: '초등', preschool: '미취학' };

const CampApplications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('camp_applications')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setApps(data || []);
        } catch (err) {
            console.error('캠프 신청 조회 실패:', err);
            setError('신청 내역을 불러오지 못했습니다. (테이블 생성 및 관리자 권한을 확인하세요)');
        } finally {
            setLoading(false);
        }
    };

    const togglePaid = async (app) => {
        const next = app.payment_status === 'paid' ? 'pending' : 'paid';
        const { error } = await supabase
            .from('camp_applications')
            .update({ payment_status: next })
            .eq('id', app.id);
        if (error) {
            alert('입금 상태 변경에 실패했습니다.');
            return;
        }
        setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, payment_status: next } : a)));
    };

    const formatMembers = (members) =>
        (members || []).map((m) => `${m.name}(${AGE_LABEL[m.age_group] || m.age_group})`).join(', ');

    // 다운로드용 행 (CSV·엑셀 공통)
    const buildRows = () =>
        apps.map((a) => ({
            신청일: new Date(a.created_at).toLocaleDateString('ko-KR'),
            대표자: a.name,
            연락처: a.phone,
            총인원: a.total_count,
            성인: a.adult_count,
            중고등: a.youth_count,
            초등: a.elementary_count,
            미취학: a.preschool_count,
            참가비: a.total_fee,
            입금상태: a.payment_status === 'paid' ? '입금완료' : '미입금',
            교통편: a.transport === 'car' ? '개인차량' : '대중교통',
            가평역픽업: a.pickup_needed ? 'O' : '',
            참가자명단: formatMembers(a.members),
            알레르기: a.allergy || '',
            요청사항: a.request || '',
        }));

    const today = () => new Date().toISOString().split('T')[0];

    const downloadCSV = () => {
        if (apps.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(buildRows());
        const csv = XLSX.utils.sheet_to_csv(ws);
        // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 추가
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `패밀리캠프신청_${today()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcel = () => {
        if (apps.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(buildRows());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '캠프신청');
        XLSX.writeFile(wb, `패밀리캠프신청_${today()}.xlsx`);
    };

    // 전체 집계
    const stats = apps.reduce(
        (acc, a) => ({
            people: acc.people + (a.total_count || 0),
            adult: acc.adult + (a.adult_count || 0),
            youth: acc.youth + (a.youth_count || 0),
            elementary: acc.elementary + (a.elementary_count || 0),
            preschool: acc.preschool + (a.preschool_count || 0),
            fee: acc.fee + (a.total_fee || 0),
            paid: acc.paid + (a.payment_status === 'paid' ? a.total_fee || 0 : 0),
            pickup: acc.pickup + (a.pickup_needed ? 1 : 0),
        }),
        { people: 0, adult: 0, youth: 0, elementary: 0, preschool: 0, fee: 0, paid: 0, pickup: 0 }
    );

    if (loading) return <div className="text-center py-10 text-gray-600">불러오는 중...</div>;
    if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>;

    return (
        <div className="space-y-4">
            {/* 집계 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">신청 건수</p>
                    <p className="text-2xl font-bold text-gray-900">{apps.length}건</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">총 참가 인원</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.people}명</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                        성인 {stats.adult} · 중고등 {stats.youth} · 초등 {stats.elementary} · 미취학 {stats.preschool}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">총 참가비</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.fee.toLocaleString()}원</p>
                    <p className="text-[11px] text-green-600 mt-1">입금 {stats.paid.toLocaleString()}원</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">가평역 픽업</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pickup}건</p>
                </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
                <button onClick={load} className="text-sm text-gray-500 hover:text-gray-800">새로고침</button>
                {apps.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={downloadCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            CSV 다운로드
                        </button>
                        <button
                            onClick={downloadExcel}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            엑셀 다운로드
                        </button>
                    </div>
                )}
            </div>

            {apps.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">신청 내역이 없습니다.</div>
            ) : (
                <div className="space-y-3">
                    {apps.map((a) => (
                        <div key={a.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                            <div className="flex justify-between items-start mb-3 gap-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-gray-900">{a.name}</h4>
                                        <span className="text-xs text-gray-500">{a.phone}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${a.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}
                                        >
                                            {a.payment_status === 'paid' ? '입금완료' : '미입금'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        총 {a.total_count}명 · {(a.total_fee || 0).toLocaleString()}원
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs text-gray-400 block mb-1.5">
                                        {new Date(a.created_at).toLocaleDateString('ko-KR')}
                                    </span>
                                    <button
                                        onClick={() => togglePaid(a)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${a.payment_status === 'paid'
                                            ? 'border-gray-300 text-gray-500 hover:bg-gray-50'
                                            : 'border-green-600 text-green-700 hover:bg-green-50'
                                            }`}
                                    >
                                        {a.payment_status === 'paid' ? '입금 취소' : '입금 확인'}
                                    </button>
                                </div>
                            </div>

                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                <div className="sm:col-span-2">
                                    <dt className="inline text-gray-500">참가자: </dt>
                                    <dd className="inline text-gray-900">{formatMembers(a.members) || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="inline text-gray-500">교통편: </dt>
                                    <dd className="inline text-gray-900">
                                        {a.transport === 'car' ? '개인차량' : '대중교통'}
                                        {a.pickup_needed && <span className="text-blue-600"> (가평역 픽업 요청)</span>}
                                    </dd>
                                </div>
                                {a.allergy && (
                                    <div className="sm:col-span-2">
                                        <dt className="inline text-gray-500">알레르기: </dt>
                                        <dd className="inline text-red-600 font-medium">{a.allergy}</dd>
                                    </div>
                                )}
                                {a.request && (
                                    <div className="sm:col-span-2">
                                        <dt className="inline text-gray-500">요청사항: </dt>
                                        <dd className="inline text-gray-900">{a.request}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampApplications;
