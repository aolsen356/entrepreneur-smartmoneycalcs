/**
 * Exit-Intent Popup - SmartMoney Calcs
 * Captures visitors with financial planning resources
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'smc_exit_shown';
    const COOLDOWN_HOURS = 24;

    function wasRecentlyShown() {
        const lastShown = localStorage.getItem(STORAGE_KEY);
        if (!lastShown) return false;
        const hoursSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
        return hoursSince < COOLDOWN_HOURS;
    }

    function markAsShown() {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }

    function createPopup() {
        const overlay = document.createElement('div');
        overlay.id = 'exit-intent-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            text-align: center;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        `;

        popup.innerHTML = `
            <button id="exit-popup-close" style="
                position: absolute;
                top: 12px;
                right: 12px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #9CA3AF;
                padding: 4px;
            ">&times;</button>
            <div style="
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            ">
                <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91 2.02.52 4.18 1.39 4.18 3.91-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
            </div>
            <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 12px; color: #111827;">
                Your Financial Future Awaits
            </h3>
            <p style="color: #6B7280; margin-bottom: 24px; line-height: 1.6;">
                Try our free calculators to plan your debt payoff, build your emergency fund, or track your net worth.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <a href="/calculators/debt-payoff.html" style="
                    display: block;
                    background: #10B981;
                    color: white;
                    padding: 14px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10B981'">
                    Create Debt Payoff Plan
                </a>
                <a href="/blog/" style="
                    display: block;
                    background: #F3F4F6;
                    color: #374151;
                    padding: 14px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">
                    Read Money Guides
                </a>
            </div>
            <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">
                100% free, no signup required
            </p>
        `;

        const container = document.createElement('div');
        container.style.position = 'relative';
        container.appendChild(popup);
        overlay.appendChild(container);

        return overlay;
    }

    function showPopup() {
        if (wasRecentlyShown()) return;
        if (document.getElementById('exit-intent-overlay')) return;

        const overlay = createPopup();
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div > div').style.transform = 'translateY(0)';
        });

        markAsShown();

        const closePopup = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('#exit-popup-close').addEventListener('click', closePopup);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', handler);
            }
        });
    }

    function init() {
        if (window.innerWidth < 768) return;

        let triggered = false;

        document.addEventListener('mouseout', (e) => {
            if (triggered) return;
            if (e.clientY < 0 && e.relatedTarget === null) {
                triggered = true;
                showPopup();
            }
        });

        let lastScrollTop = 0;
        let rapidScrollCount = 0;

        window.addEventListener('scroll', () => {
            const st = window.pageYOffset;
            if (st < lastScrollTop && lastScrollTop - st > 100) {
                rapidScrollCount++;
                if (rapidScrollCount > 2 && !triggered) {
                    triggered = true;
                    showPopup();
                }
            } else {
                rapidScrollCount = 0;
            }
            lastScrollTop = st;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
