import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Header = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check auth state
        checkUser();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            checkUser();
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            authListener.subscription.unsubscribe();
        };
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setIsAdmin(profile?.role === 'admin');
        } else {
            setIsAdmin(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        } else {
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const navItems = [
        { label: '교회 소개', id: 'about' },
        { label: '예배 안내', id: 'worship' },
        { label: '오시는 길', id: 'location' },
        { label: '온라인 헌금', id: 'offering' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link
                    to="/"
                    className={`flex items-center gap-3 text-2xl font-bold font-serif ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img src="/images/logos/logo.png" alt="We, the Church 로고" className="h-24 w-auto object-contain" />
                    <span>We, the Church</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`text-base font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-gray-800'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        to="/news"
                        className={`text-base font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-gray-800'
                            }`}
                    >
                        교회 소식
                    </Link>
                    <Link
                        to="/sermons"
                        className={`text-base font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-gray-700' : 'text-gray-800'
                            }`}
                    >
                        말씀
                    </Link>

                    {isAdmin && (
                        <Link
                            to="/admin"
                            className={`text-base font-bold text-church-accent hover:opacity-70 transition-opacity`}
                        >
                            관리자
                        </Link>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className={`px-4 py-2 rounded-full text-base font-medium transition-colors ${isScrolled
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                : 'bg-white/50 text-gray-900 hover:bg-white/80'
                                }`}
                        >
                            로그아웃
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className={`px-4 py-2 rounded-full text-base font-medium transition-colors ${isScrolled
                                ? 'bg-church-purple text-white hover:bg-purple-400'
                                : 'bg-white/50 text-gray-900 hover:bg-white/80'
                                }`}
                        >
                            로그인
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X className="text-gray-900 w-8 h-8" />
                    ) : (
                        <Menu className="text-gray-900 w-8 h-8" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden p-4 flex flex-col gap-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="text-left text-gray-700 font-medium text-lg py-2"
                        >
                            {item.label}
                        </button>
                    ))}
                    <Link
                        to="/news"
                        className="text-left text-gray-700 font-medium text-lg py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        교회 소식
                    </Link>
                    <Link
                        to="/sermons"
                        className="text-left text-gray-700 font-medium text-lg py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        말씀
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="text-left text-church-accent font-bold text-lg py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            관리자 페이지
                        </Link>
                    )}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="text-center bg-gray-200 text-gray-800 text-lg py-3 rounded-lg"
                        >
                            로그아웃
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="text-center bg-church-purple text-white text-lg py-3 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            로그인
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
