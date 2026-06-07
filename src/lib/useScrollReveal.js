import { useEffect } from 'react';

// 스크롤 시 화면에 들어오는 .reveal 요소를 부드럽게 등장시킵니다 (한 번만).
// 페이지/섹션 컴포넌트에서 호출하면 그 시점의 .reveal 요소들을 관찰합니다.
// deps 를 넘기면(예: [loading]) 비동기 콘텐츠가 그려진 뒤 다시 스캔합니다.
export function useScrollReveal(deps = []) {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal:not(.is-visible)');
        if (!els.length) return;

        // IntersectionObserver 미지원 환경에서는 즉시 보이게 처리
        if (typeof IntersectionObserver === 'undefined') {
            els.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
