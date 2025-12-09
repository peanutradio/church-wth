import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminStats = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [memberStats, setMemberStats] = useState({
        totalMembers: 0,
        adminCount: 0,
        memberCount: 0,
        guestCount: 0,
        recentSignups: []
    });

    useEffect(() => {
        checkAdminAndLoadStats();
    }, []);

    const checkAdminAndLoadStats = async () => {
        // Check admin permission
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            alert('관리자 권한이 필요합니다.');
            navigate('/');
            return;
        }

        setIsAdmin(true);
        await loadMemberStats();
        setLoading(false);
    };

    const loadMemberStats = async () => {
        try {
            // Get all profiles
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate stats
            const stats = {
                totalMembers: profiles.length,
                adminCount: profiles.filter(p => p.role === 'admin').length,
                memberCount: profiles.filter(p => p.role === 'member').length,
                guestCount: profiles.filter(p => p.role === 'guest').length,
                recentSignups: profiles.slice(0, 5) // Last 5 signups
            };

            setMemberStats(stats);
        } catch (error) {
            console.error('Error loading member stats:', error);
        }
    };

    if (loading) return <div className="pt-32 text-center">Loading...</div>;
    if (!isAdmin) return null;

    const gaPropertyId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const isGAConfigured = gaPropertyId && gaPropertyId !== 'G-XXXXXXXXXX';

    return (
        <div className="pt-32 pb-20 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif">통계 대시보드</h1>
                    <p className="text-gray-600 mt-2">웹사이트 방문자 및 회원 통계를 확인하세요</p>
                </div>

                {/* Member Statistics Cards */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">회원 통계</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Members */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">총 회원 수</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{memberStats.totalMembers}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Admin Count */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">관리자</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">{memberStats.adminCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Member Count */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">정회원</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{memberStats.memberCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Guest Count */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">게스트</p>
                                    <p className="text-3xl font-bold text-gray-600 mt-2">{memberStats.guestCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Signups */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">최근 가입자</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {memberStats.recentSignups.map((profile) => (
                                    <tr key={profile.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {profile.name || '이름 없음'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {profile.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    profile.role === 'member' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {profile.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Google Analytics Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">방문자 통계 (Google Analytics)</h2>

                    {isGAConfigured ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Google Analytics 대시보드에서 상세한 방문자 통계를 확인하세요.
                                </p>
                            </div>
                            <a
                                href={`https://analytics.google.com/analytics/web/#/p${gaPropertyId.replace('G-', '')}/reports/intelligenthome`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google Analytics 대시보드 열기
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 GA4에서 확인 가능한 통계</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 실시간 방문자 수</li>
                                    <li>• 일일/주간/월간 방문자 추이</li>
                                    <li>• 페이지별 조회수 및 체류 시간</li>
                                    <li>• 모바일 vs 데스크톱 비율</li>
                                    <li>• 지역별 방문자 분포</li>
                                    <li>• 유입 경로 분석</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">Google Analytics 설정 필요</h3>
                                    <p className="text-sm text-yellow-800 mb-4">
                                        방문자 통계를 수집하려면 Google Analytics 4 측정 ID를 설정해야 합니다.
                                    </p>
                                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                                        <p className="text-sm font-medium text-gray-900 mb-2">설정 방법:</p>
                                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                                            <li>
                                                <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    Google Analytics
                                                </a>
                                                에서 계정 생성
                                            </li>
                                            <li>속성 만들기 → 측정 ID (G-XXXXXXXXXX) 발급</li>
                                            <li>.env 파일에 <code className="bg-gray-100 px-2 py-1 rounded text-xs">VITE_GA_MEASUREMENT_ID</code> 추가</li>
                                            <li>서버 재시작</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back to Admin Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        ← 관리자 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
