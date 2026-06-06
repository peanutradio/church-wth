import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

// 관리자 전용: 연말정산(기부금 영수증) 신청 내역 조회
// - 주민번호는 서버 RPC(get_tax_applications)에서 복호화되어 내려옵니다.
// - 사업자등록증은 비공개 버킷이므로 60초 임시 서명 URL로 엽니다.
const TaxApplications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revealed, setRevealed] = useState({}); // id -> 주민번호 표시 여부

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.rpc('get_tax_applications');
            if (error) throw error;
            setApps(data || []);
        } catch (err) {
            console.error('연말정산 신청 조회 실패:', err);
            setError('신청 내역을 불러오지 못했습니다. (관리자 권한 또는 Vault 암호화 키 설정을 확인하세요)');
        } finally {
            setLoading(false);
        }
    };

    const toggleReveal = (id) => {
        setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const viewLicense = async (path) => {
        if (!path) return;
        const { data, error } = await supabase.storage
            .from('tax-documents')
            .createSignedUrl(path, 60); // 60초간 유효한 임시 링크
        if (error || !data?.signedUrl) {
            alert('파일을 여는 데 실패했습니다.');
            return;
        }
        window.open(data.signedUrl, '_blank', 'noopener');
    };

    const maskResidentId = (rid) => {
        if (!rid) return '-';
        const digits = rid.replace(/[^0-9]/g, '');
        if (digits.length < 7) return '******';
        return `${digits.slice(0, 6)}-*******`;
    };

    const downloadExcel = () => {
        if (apps.length === 0) return;
        if (!window.confirm('주민등록번호 등 민감정보가 포함됩니다. 다운로드하시겠습니까?')) return;
        const rows = apps.map((a) => ({
            '유형': a.type === 'personal' ? '개인' : '법인',
            '성함': a.name,
            '연락처': a.phone,
            '이메일': a.email,
            '주민등록번호': a.resident_id || '',
            '주소': a.address || '',
            '법인명': a.corporate_name || '',
            '신청일': new Date(a.created_at).toLocaleDateString('ko-KR'),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '연말정산신청');
        XLSX.writeFile(wb, `연말정산신청_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) return <div className="text-center py-10 text-gray-600">불러오는 중...</div>;
    if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-600">총 <span className="font-bold text-gray-900">{apps.length}</span>건</p>
                {apps.length > 0 && (
                    <button
                        onClick={downloadExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                        엑셀 다운로드
                    </button>
                )}
            </div>

            {apps.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">신청 내역이 없습니다.</div>
            ) : (
                <div className="space-y-3">
                    {apps.map((a) => (
                        <div key={a.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.type === 'personal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {a.type === 'personal' ? '개인' : '법인'}
                                    </span>
                                    <h4 className="font-bold text-gray-900 mt-1">{a.name}</h4>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {new Date(a.created_at).toLocaleDateString('ko-KR')}
                                </span>
                            </div>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                                <div><dt className="inline text-gray-500">연락처: </dt><dd className="inline text-gray-900">{a.phone}</dd></div>
                                <div><dt className="inline text-gray-500">이메일: </dt><dd className="inline text-gray-900 break-all">{a.email}</dd></div>
                                {a.type === 'personal' && (
                                    <>
                                        <div>
                                            <dt className="inline text-gray-500">주민번호: </dt>
                                            <dd className="inline text-gray-900 font-mono">
                                                {revealed[a.id] ? (a.resident_id || '-') : maskResidentId(a.resident_id)}
                                            </dd>
                                            <button
                                                onClick={() => toggleReveal(a.id)}
                                                className="ml-2 text-xs text-blue-600 hover:underline"
                                            >
                                                {revealed[a.id] ? '가리기' : '보기'}
                                            </button>
                                        </div>
                                        <div><dt className="inline text-gray-500">주소: </dt><dd className="inline text-gray-900">{a.address || '-'}</dd></div>
                                    </>
                                )}
                                {a.type === 'corporate' && (
                                    <>
                                        <div><dt className="inline text-gray-500">법인명: </dt><dd className="inline text-gray-900">{a.corporate_name || '-'}</dd></div>
                                        <div>
                                            <dt className="inline text-gray-500">사업자등록증: </dt>
                                            {a.business_license_url ? (
                                                <button onClick={() => viewLicense(a.business_license_url)} className="text-blue-600 hover:underline">
                                                    파일 보기
                                                </button>
                                            ) : (
                                                <dd className="inline text-gray-400">없음</dd>
                                            )}
                                        </div>
                                    </>
                                )}
                            </dl>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaxApplications;
