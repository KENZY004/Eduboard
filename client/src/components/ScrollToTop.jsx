import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const SCROLL_THRESHOLD = 300;
const EXCLUDED_PATHS = [
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-otp',
    '/reset-password',
];

const getScrollTop = target => {
    const pageScrollTop = Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0
    );

    if (target instanceof Element) {
        return Math.max(pageScrollTop, target.scrollTop || 0);
    }

    return pageScrollTop;
};

const scrollElementToTop = (element, behavior = 'auto') => {
    if (!element || element.scrollTop <= 0) {
        return;
    }

    if (typeof element.scrollTo === 'function') {
        element.scrollTo({ top: 0, behavior });
        return;
    }

    element.scrollTop = 0;
};

const scrollEverythingToTop = (behavior = 'auto') => {
    window.scrollTo({ top: 0, behavior });
    scrollElementToTop(document.documentElement, behavior);
    scrollElementToTop(document.body, behavior);

    document.querySelectorAll('*').forEach(element => {
        scrollElementToTop(element, behavior);
    });
};

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const isExcludedPath = EXCLUDED_PATHS.includes(pathname);

    useEffect(() => {
        // Scroll immediately
        scrollEverythingToTop();
        setIsVisible(false);

        // Scroll multiple times with delays
        const delays = [10, 50, 100, 200, 300];
        const timeouts = delays.map(delay =>
            setTimeout(() => scrollEverythingToTop(), delay)
        );

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [pathname]);

    useEffect(() => {
        let animationFrameId = null;

        const updateVisibility = target => {
            const shouldShow = getScrollTop(target) > SCROLL_THRESHOLD;
            setIsVisible(current => (current === shouldShow ? current : shouldShow));
        };

        const handleScroll = event => {
            if (animationFrameId) {
                return;
            }

            animationFrameId = window.requestAnimationFrame(() => {
                updateVisibility(event.target);
                animationFrameId = null;
            });
        };

        updateVisibility();
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }

            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, []);

    const handleScrollToTop = useCallback(() => {
        scrollEverythingToTop('smooth');
        setIsVisible(false);
    }, []);

    const button = (
        <AnimatePresence>
            {isVisible && !isExcludedPath && (
                <motion.button
                    type="button"
                    aria-label="Scroll to top"
                    onClick={handleScrollToTop}
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-4 z-[9999] flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-blue-600 text-white shadow-lg shadow-purple-500/35 ring-1 ring-white/20 transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:bottom-7 sm:right-6 sm:h-12 sm:w-12"
                    initial={{ opacity: 0, y: 18, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 18, scale: 0.85 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    whileHover={{ y: -3, scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                >
                    <FaArrowUp className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </motion.button>
            )}
        </AnimatePresence>
    );

    return createPortal(button, document.body);
}
