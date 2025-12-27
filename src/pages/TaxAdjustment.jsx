import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TaxAdjustment = () => {
    const [type, setType] = useState('personal'); // personal, corporate
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            let fileUrl = null;

            // Handle file upload for corporate
            if (type === 'corporate' && file) {
                const fileExt = file.name.split('.').pop();
                // Sanitize corporate name for filename (remove special chars, spaces to underscore)
                const safeName = data.corporate_name.replace(/[^a-zA-Z0-9가-힣]/g, '_');
                const timestamp = Date.now();
                const fileName = `${safeName}_${timestamp}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('tax-documents')
                    .upload(filePath, file, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('tax-documents')
                    .getPublicUrl(filePath);

                fileUrl = publicUrl;
            }

            // Insert into database
            const payload = {
                type,
                name: data.name,
                phone: data.phone,
                email: data.email,
                resident_id: type === 'personal' ? data.resident_id : null,
                address: type === 'personal' ? data.address : null,
                corporate_name: type === 'corporate' ? data.corporate_name : null,
                business_license_url: fileUrl,
            };

            const { error } = await supabase
                .from('tax_applications')
                .insert([payload]);

            if (error) throw error;

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setSubmitted(false);
        // Optional: Reset form or redirect
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 relative">
            {submitted && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform scale-100 animate-scale-up text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h2>
                        <p className="text-gray-600 mb-8">
                            담당자가 확인 후<br />연락드리겠습니다.
                        </p>
                        <button
                            onClick={handleCloseSuccess}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            확인 완료
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 font-serif">기부금 영수증 신청(연말정산)</h1>
                        <p className="text-gray-500">
                            2025년도 기부금 영수증 발급을 위한 정보를 입력해주세요.
                        </p>
                        <div className="w-16 h-1 bg-gray-900 mx-auto mt-6"></div>
                    </div>

                    <div className="flex gap-4 mb-10 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setType('personal')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${type === 'personal'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            개인 발급
                        </button>
                        <button
                            onClick={() => setType('corporate')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${type === 'corporate'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            법인 발급
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                성함 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                연락처 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="010-0000-0000"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                이메일 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {type === 'personal' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        주민등록번호 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="resident_id"
                                        placeholder="000000-0000000"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        * 국세청 간소화 서비스 등록을 위해 필요합니다. 암호화되어 관리자만 열람 가능합니다.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        주소 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </>
                        )}

                        {type === 'corporate' && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        법인명 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="corporate_name"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        사업자등록증 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                        <p className="text-sm text-gray-500 mb-3">
                                            사업자등록증 파일을 업로드해주세요. (이미지 또는 PDF)
                                        </p>
                                        <input
                                            type="file"
                                            id="business_license"
                                            accept="image/*,.pdf"
                                            required
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="business_license"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded text-blue-600 font-medium text-sm cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            파일 추가
                                        </label>
                                        {file && (
                                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 rounded border border-gray-200">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="truncate flex-1">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFile(null);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all disabled:bg-gray-400"
                            >
                                {loading ? '제출 중...' : '신청하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaxAdjustment;
