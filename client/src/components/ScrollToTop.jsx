import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Function to scroll everything to top
        const scrollToTop = () => {
            // Scroll window
            window.scrollTo(0, 0);

            // Scroll document
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }
            if (document.body) {
                document.body.scrollTop = 0;
            }

            // Find and scroll any scrollable containers
            const scrollableElements = document.querySelectorAll('*');
            scrollableElements.forEach(el => {
                if (el.scrollTop > 0) {
                    el.scrollTop = 0;
                }
            });
        };

        // Scroll immediately
        scrollToTop();

        // Scroll multiple times with delays
        const delays = [10, 50, 100, 200, 300];
        const timeouts = delays.map(delay =>
            setTimeout(() => scrollToTop(), delay)
        );

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [pathname]);

    return null;
}
