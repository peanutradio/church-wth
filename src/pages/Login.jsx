import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState(null);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Show welcome message and redirect
                setMessage({
                    type: 'success',
                    text: '회원가입을 축하합니다! 환영합니다. (잠시 후 메인 페이지로 이동합니다)'
                });
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            setMessage({ type: 'error', text: '로그인/회원가입에 실패했습니다. 이메일과 비밀번호를 확인해주세요.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });
            if (error) throw error;
        } catch (error) {
            setMessage({ type: 'error', text: '소셜 로그인 중 오류가 발생했습니다.' });
            console.error('Error logging in:', error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-20">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">환영합니다</h2>
                    <p className="text-gray-600">We, the Church에 오신 것을 환영합니다.</p>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Email Login Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    <div>
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-church-purple focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-church-purple focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-lg bg-church-purple text-white font-bold hover:bg-purple-400 transition-colors disabled:opacity-50"
                    >
                        {loading ? '처리 중...' : (isSignUp ? '이메일로 회원가입' : '이메일로 로그인')}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage(null);
                            }}
                            className="text-church-purple hover:underline font-medium"
                        >
                            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
                        </button>
                    </div>
                </form>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">또는 소셜 계정으로 계속하기</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Kakao Login */}
                    <button
                        onClick={() => handleSocialLogin('kakao')}
                        className="w-full py-3.5 px-4 rounded-lg bg-[#FEE500] text-[#000000] font-medium hover:bg-[#FDD835] transition-colors flex items-center justify-center gap-3 relative"
                    >
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C5.925 3 1 6.925 1 11.75c0 2.925 1.85 5.5 4.775 7.05-.15.55-.55 2-1.175 4.225 0 0-.1.2.075.275.175.1.375.05.375.05l4.85-3.225c.7.1 1.425.15 2.1.15 6.075 0 11-3.925 11-8.75S18.075 3 12 3z" />
                        </svg>
                        카카오톡으로 시작하기
                    </button>



                    {/* Google Login */}
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full py-3.5 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 relative"
                    >
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google로 시작하기
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-400 text-center">
                    로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
};

export default Login;
