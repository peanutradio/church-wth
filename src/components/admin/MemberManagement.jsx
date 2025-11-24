import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Download, Filter, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        admin: 0,
        member: 0,
        guest: 0
    });

    const itemsPerPage = 10;

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        filterAndSearchMembers();
    }, [members, searchTerm, filterRole]);

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMembers(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            alert('회원 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            admin: data.filter(m => m.role === 'admin').length,
            member: data.filter(m => m.role === 'member').length,
            guest: data.filter(m => m.role === 'guest').length
        });
    };

    const filterAndSearchMembers = () => {
        let filtered = members;

        // Role filter
        if (filterRole !== 'all') {
            filtered = filtered.filter(m => m.role === filterRole);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredMembers(filtered);
        setCurrentPage(1);
    };

    const handleRoleChange = (memberId, newRole) => {
        // Mobile fix: Use setTimeout to allow the native select picker to close
        // before showing the alert/confirm dialog.
        setTimeout(async () => {
            if (!window.confirm(`권한을 "${newRole}"로 변경하시겠습니까?`)) {
                // If cancelled, we need to force a re-render to revert the select value
                // because the browser might have visually updated it.
                // Re-fetching is the easiest way to ensure consistency.
                fetchMembers();
                return;
            }

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ role: newRole })
                    .eq('id', memberId);

                if (error) throw error;

                alert('권한이 변경되었습니다.');
                fetchMembers();
            } catch (error) {
                console.error('Error updating role:', error);
                alert('권한 변경에 실패했습니다.');
                fetchMembers(); // Revert on error too
            }
        }, 100);
    };

    const downloadExcel = () => {
        const excelData = filteredMembers.map(member => ({
            '이름': member.name || '-',
            '이메일': member.email || '-',
            '권한': member.role === 'admin' ? '관리자' : member.role === 'member' ? '회원' : '게스트',
            '가입일': new Date(member.created_at).toLocaleDateString('ko-KR')
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '회원 목록');
        XLSX.writeFile(wb, `회원목록_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = filteredMembers.slice(startIndex, endIndex);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'member': return 'bg-blue-100 text-blue-700';
            case 'guest': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return '관리자';
            case 'member': return '회원';
            case 'guest': return '게스트';
            default: return role;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">로딩 중...</div>
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">전체 회원</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <Users className="w-12 h-12 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">관리자</p>
                            <p className="text-3xl font-bold mt-1">{stats.admin}</p>
                        </div>
                        <UserCheck className="w-12 h-12 text-red-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">회원</p>
                            <p className="text-3xl font-bold mt-1">{stats.member}</p>
                        </div>
                        <Users className="w-12 h-12 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-100 text-sm font-medium">게스트</p>
                            <p className="text-3xl font-bold mt-1">{stats.guest}</p>
                        </div>
                        <UserX className="w-12 h-12 text-gray-200" />
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="이름 또는 이메일로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 권한</option>
                            <option value="admin">관리자</option>
                            <option value="member">회원</option>
                            <option value="guest">게스트</option>
                        </select>
                    </div>

                    {/* Excel Download */}
                    <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        엑셀 다운로드
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    총 <span className="font-bold text-gray-900">{filteredMembers.length}</span>명의 회원
                </div>
            </div>

            {/* Members List - Responsive Layout */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop View (Table) - Hidden on Mobile */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    이름
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    이메일
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    권한
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    가입일
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    마지막 로그인
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    관리
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {member.name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {member.email || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                                            {getRoleLabel(member.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(member.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {member.last_login
                                            ? new Date(member.last_login).toLocaleString('ko-KR', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : '로그인 기록 없음'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="guest">게스트</option>
                                            <option value="member">회원</option>
                                            <option value="admin">관리자</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) - Visible only on Mobile */}
                <div className="md:hidden divide-y divide-gray-200">
                    {currentMembers.map((member) => (
                        <div key={member.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-gray-900">{member.name || '-'}</h3>
                                    <p className="text-sm text-gray-500">{member.email || '-'}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                                    {getRoleLabel(member.role)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div>
                                    <span className="block text-xs text-gray-400">가입일</span>
                                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">마지막 로그인</span>
                                    {member.last_login
                                        ? new Date(member.last_login).toLocaleDateString('ko-KR')
                                        : '-'}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">권한 변경</label>
                                <select
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                                >
                                    <option value="guest">게스트</option>
                                    <option value="member">회원</option>
                                    <option value="admin">관리자</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {startIndex + 1} - {Math.min(endIndex, filteredMembers.length)} / {filteredMembers.length}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-300">
                                    <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberManagement;
