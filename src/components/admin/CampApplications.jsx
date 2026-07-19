import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

// 관리자 전용: 2026 패밀리 캠프 참가 신청 내역
// - DB는 "참가자 1명 = 1행" 구조. 화면에서는 application_id로 가족 단위로 묶어 보여줍니다.

const AGE_GROUPS = ['성인', '중고등', '초등', '미취학'];

const CampApplications = () => {
    const [rows, setRows] = useState([]);
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
            setRows(data || []);
        } catch (err) {
            console.error('캠프 신청 조회 실패:', err);
            setError('신청 내역을 불러오지 못했습니다. (테이블 생성 및 관리자 권한을 확인하세요)');
        } finally {
            setLoading(false);
        }
    };

    // 같은 신청(가족)끼리 묶기
    const families = useMemo(() => {
        const map = new Map();
        rows.forEach((r) => {
            if (!map.has(r.application_id)) {
                map.set(r.application_id, {
                    application_id: r.application_id,
                    applicant_name: r.applicant_name,
                    phone: r.phone,
                    transport: r.transport,
                    pickup_needed: r.pickup_needed,
                    allergy: r.allergy,
                    request: r.request,
                    created_at: r.created_at,
                    participants: [],
                });
            }
            map.get(r.application_id).participants.push(r);
        });
        return Array.from(map.values());
    }, [rows]);

    const today = () => new Date().toISOString().split('T')[0];

    // 참가자 명부 = DB 구조 그대로 (전처리 불필요)
    const buildRows = () =>
        rows.map((r) => ({
            신청자명: r.applicant_name,
            참가자명: r.participant_name,
            구분: r.relation,
            연령대: r.age_group,
            참가비: r.fee,
            연락처: r.phone,
            교통편: r.transport,
            가평역픽업: r.pickup_needed ? 'O' : '',
            알레르기: r.allergy || '',
            요청사항: r.request || '',
            신청일: new Date(r.created_at).toLocaleDateString('ko-KR'),
        }));

    const downloadCSV = () => {
        if (rows.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(buildRows());
        const csv = XLSX.utils.sheet_to_csv(ws);
        // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 추가
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `패밀리캠프_참가자명부_${today()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadExcel = () => {
        if (rows.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(buildRows());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '참가자명부');
        XLSX.writeFile(wb, `패밀리캠프_참가자명부_${today()}.xlsx`);
    };

    // 전체 집계
    const stats = useMemo(() => {
        const byAge = {};
        AGE_GROUPS.forEach((g) => (byAge[g] = 0));
        rows.forEach((r) => {
            byAge[r.age_group] = (byAge[r.age_group] || 0) + 1;
        });
        return {
            people: rows.length,
            fee: rows.reduce((s, r) => s + (r.fee || 0), 0),
            byAge,
            pickup: families.filter((f) => f.pickup_needed).length,
        };
    }, [rows, families]);

    if (loading) return <div className="text-center py-10 text-gray-600">불러오는 중...</div>;
    if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>;

    return (
        <div className="space-y-4">
            {/* 집계 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">신청 가정</p>
                    <p className="text-2xl font-bold text-gray-900">{families.length}가정</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">총 참가 인원</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.people}명</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                        {AGE_GROUPS.map((g) => `${g} ${stats.byAge[g] || 0}`).join(' · ')}
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">총 참가비</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.fee.toLocaleString()}원</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">가평역 픽업</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pickup}가정</p>
                </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
                <button onClick={load} className="text-sm text-gray-500 hover:text-gray-800">
                    새로고침
                </button>
                {rows.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={downloadCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                            참가자 명부 CSV
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

            {families.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">신청 내역이 없습니다.</div>
            ) : (
                <div className="space-y-3">
                    {families.map((f) => (
                        <div key={f.application_id} className="border border-gray-200 rounded-xl p-4 bg-white">
                            <div className="flex justify-between items-start mb-3 gap-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-gray-900">{f.applicant_name}</h4>
                                        <span className="text-xs text-gray-500">{f.phone}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {f.participants.length}명 ·{' '}
                                        {f.participants.reduce((s, p) => s + (p.fee || 0), 0).toLocaleString()}원
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                    {new Date(f.created_at).toLocaleDateString('ko-KR')}
                                </span>
                            </div>

                            {/* 참가자 명단 */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {f.participants.map((p) => (
                                    <span
                                        key={p.id}
                                        className={`text-xs px-2 py-1 rounded-lg border ${p.relation === '본인'
                                            ? 'bg-gray-100 border-gray-300 text-gray-800 font-medium'
                                            : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {p.participant_name}
                                        <span className="text-gray-400"> · {p.age_group}</span>
                                    </span>
                                ))}
                            </div>

                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                <div>
                                    <dt className="inline text-gray-500">교통편: </dt>
                                    <dd className="inline text-gray-900">
                                        {f.transport}
                                        {f.pickup_needed && <span className="text-blue-600"> (가평역 픽업 요청)</span>}
                                    </dd>
                                </div>
                                {f.allergy && (
                                    <div className="sm:col-span-2">
                                        <dt className="inline text-gray-500">알레르기: </dt>
                                        <dd className="inline text-red-600 font-medium">{f.allergy}</dd>
                                    </div>
                                )}
                                {f.request && (
                                    <div className="sm:col-span-2">
                                        <dt className="inline text-gray-500">요청사항: </dt>
                                        <dd className="inline text-gray-900">{f.request}</dd>
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
