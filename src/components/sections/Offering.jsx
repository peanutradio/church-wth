import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const Offering = () => {
    const [copied, setCopied] = useState(false);
    const accountInfo = "신한은행 140-015-516800 위더처치교회";

    const handleCopy = () => {
        navigator.clipboard.writeText(accountInfo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="offering" className="py-20 bg-gradient-to-br from-church-purple/90 to-church-pink/90 text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">온라인 헌금</h2>
                <p className="text-white/90 mb-12 max-w-2xl mx-auto text-lg">
                    성도님들의 헌금은 교회 사역과<br />
                    이웃을 섬기는 일에 귀하게 사용됩니다.
                </p>

                <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                    <p className="text-sm text-gray-400 mb-2">계좌번호</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <span className="text-xl md:text-2xl font-mono font-bold tracking-wide">
                            {accountInfo}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-church-accent hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    복사완료
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    복사하기
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offering;
