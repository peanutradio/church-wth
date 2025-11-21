import React, { useState } from 'react';
import { X } from 'lucide-react';

const Footer = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const openModal = (type) => {
        setModalContent(type);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalContent('');
    };

    return (
        <>
            <footer className="bg-gradient-to-r from-church-purple/20 to-church-pink/20 text-gray-600 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">We, the Church | 위더처치교회</h3>
                            <p className="mb-2">서울 성동구 서울숲2길 32-14</p>
                            <p className="mb-2">갤러리아포레몰 B1 101호 드림센터</p>
                            <p className="text-sm text-gray-500 mt-4">
                                CopyRight 2025. 대한예수교장로회 We, the Church. All Rights Reserved.
                            </p>
                        </div>

                        <div className="flex gap-6 text-sm">
                            <button
                                onClick={() => openModal('terms')}
                                className="hover:text-church-accent transition-colors cursor-pointer"
                            >
                                이용약관
                            </button>
                            <button
                                onClick={() => openModal('privacy')}
                                className="font-bold hover:text-church-accent transition-colors cursor-pointer"
                            >
                                개인정보처리방침
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {modalContent === 'terms' ? '이용약관' : '개인정보처리방침'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] text-sm text-gray-700 leading-relaxed">
                            {modalContent === 'terms' ? <TermsContent /> : <PrivacyContent />}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const TermsContent = () => (
    <div className="space-y-6">
        <section>
            <h3 className="text-lg font-bold mb-3">제1조 목적</h3>
            <p>본 이용약관은 "사이트명"(이하 "사이트")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제2조 용어의 정의</h3>
            <p className="mb-2">본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
                <li>회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.</li>
                <li>이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.</li>
                <li>회원 아이디(이하 "ID") : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.</li>
                <li>비밀번호 : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.</li>
                <li>운영자 : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.</li>
                <li>해지 : 회원이 이용계약을 해약하는 것을 말합니다.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제3조 약관 외 준칙</h3>
            <p>운영자는 필요한 경우 별도로 운영정책을 공지 안내할 수 있으며, 본 약관과 운영정책이 중첩될 경우 운영정책이 우선 적용됩니다.</p>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제4조 이용계약 체결</h3>
            <p className="mb-2">① 이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 운영자의 이용승낙으로 성립합니다.</p>
            <p>② 회원으로 등록하여 서비스를 이용하려는 자는 사이트 가입신청 시 본 약관을 읽고 아래에 있는 "동의합니다"를 선택하는 것으로 본 약관에 대한 동의 의사 표시를 합니다.</p>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제5조 서비스 이용 신청</h3>
            <p className="mb-2">① 회원으로 등록하여 사이트를 이용하려는 이용자는 사이트에서 요청하는 제반정보(이용자ID,비밀번호, 닉네임 등)를 제공해야 합니다.</p>
            <p>② 타인의 정보를 도용하거나 허위의 정보를 등록하는 등 본인의 진정한 정보를 등록하지 않은 회원은 사이트 이용과 관련하여 아무런 권리를 주장할 수 없으며, 관계 법령에 따라 처벌받을 수 있습니다.</p>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제6조 개인정보처리방침</h3>
            <p className="mb-2">사이트 및 운영자는 회원가입 시 제공한 개인정보 중 비밀번호를 가지고 있지 않으며 이와 관련된 부분은 사이트의 개인정보처리방침을 따릅니다.</p>
            <p className="mb-2">운영자는 관계 법령이 정하는 바에 따라 회원등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력합니다.</p>
            <p className="mb-2">회원의 개인정보보호에 관하여 관계법령 및 사이트가 정하는 개인정보처리방침에 정한 바에 따릅니다.</p>
            <p className="mb-2">단, 회원의 귀책 사유로 인해 노출된 정보에 대해 운영자는 일체의 책임을 지지 않습니다.</p>
            <p>운영자는 회원이 미풍양속에 저해되거나 국가안보에 위배되는 게시물 등 위법한 게시물을 등록 · 배포할 경우 관련 기관의 요청이 있을 시 회원의 자료를 열람 및 해당 자료를 관련 기관에 제출할 수 있습니다.</p>
        </section>

        {/* 나머지 조항들... */}
        <p className="mt-8 text-xs text-gray-500 italic">이 약관은 사이트 개설일부터 시행합니다.</p>
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-6">
        <section>
            <h3 className="text-lg font-bold mb-3">제1조 (개인정보의 처리목적)</h3>
            <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>

            <div className="ml-4 space-y-3">
                <div>
                    <p className="font-semibold">1. 홈페이지 회원 가입 및 관리</p>
                    <p className="text-sm">회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별․인증, 회원자격 유지․관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정 이용 방지, 만 14세 미만 아동의 개인정보처리 시 법정대리인의 동의 여부 확인, 각종 고지․통지, 고충 처리 등을 목적으로 개인정보를 처리합니다.</p>
                </div>

                <div>
                    <p className="font-semibold">2. 재화 또는 서비스 제공</p>
                    <p className="text-sm">물품 배송, 서비스 제공, 계약서 및 청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금 결제 및 정산, 채권추심 등을 목적으로 개인정보를 처리합니다.</p>
                </div>

                <div>
                    <p className="font-semibold">3. 고충 처리</p>
                    <p className="text-sm">민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락․통지, 처리 결과 통보 등의 목적으로 개인정보를 처리합니다.</p>
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제2조 (개인정보의 처리 및 보유기간)</h3>
            <p className="mb-2">① 회사는 법령에 따른 개인정보 보유, 이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용 기간 내에서 개인정보를 처리, 보유합니다.</p>
            <p className="mb-2">② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>

            <div className="ml-4 space-y-2">
                <p className="font-semibold">1. 홈페이지 회원 가입 및 관리 : 사업자/단체 홈페이지 탈퇴 시까지</p>
                <p className="text-sm ml-4">다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</p>
                <ul className="list-disc list-inside ml-8 text-sm">
                    <li>관계 법령 위반에 따른 수사, 조사 등이 진행 중인 경우에는 해당 수사, 조사 종료 시까지</li>
                    <li>홈페이지 이용에 따른 채권 및 채무관계 잔존 시에는 해당 채권, 채무 관계 정산 시까지</li>
                </ul>

                <p className="font-semibold mt-3">2. 재화 또는 서비스 제공 : 재화․서비스 공급완료 및 요금결제․정산 완료 시까지</p>
            </div>
        </section>

        <section>
            <h3 className="text-lg font-bold mb-3">제10조 (개인정보 보호책임자)</h3>
            <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
        </section>

        <p className="mt-8 text-xs text-gray-500 italic">이 개인정보 처리방침은 2025년부터 적용됩니다.</p>
    </div>
);

export default Footer;
