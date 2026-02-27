document.addEventListener('DOMContentLoaded', () => {
    const consentKey = 'smot_cookie_consent';
    const consentCookieName = 'smot_cookie_consent';
    const oneYearSeconds = 60 * 60 * 24 * 365;

    function getStoredConsent() {
        const fromStorage = localStorage.getItem(consentKey);
        if (fromStorage === 'accepted' || fromStorage === 'rejected') {
            return fromStorage;
        }

        const match = document.cookie.match(/(?:^|;\s*)smot_cookie_consent=([^;]+)/);
        if (!match) {
            return null;
        }

        const value = decodeURIComponent(match[1]);
        return value === 'accepted' || value === 'rejected' ? value : null;
    }

    function saveConsent(value) {
        localStorage.setItem(consentKey, value);
        document.cookie = `${consentCookieName}=${encodeURIComponent(value)}; Max-Age=${oneYearSeconds}; Path=/; SameSite=Lax`;
    }

    function removeBanner() {
        const existing = document.querySelector('#cookie-banner');
        if (existing) {
            existing.remove();
        }
    }

    function openBanner(forceOpen) {
        const existingConsent = getStoredConsent();
        if (existingConsent && !forceOpen) {
            return;
        }

        removeBanner();
        const banner = document.createElement('aside');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <p class="cookie-banner-copy">
                We use essential cookies to run this site and optional cookies to remember your preferences.
                See our <a href="cookies.html">Cookie Policy</a>.
            </p>
            <div class="cookie-banner-actions">
                <button type="button" class="btn btn-primary btn-sm" data-cookie-action="accept">Accept All</button>
                <button type="button" class="btn btn-outline btn-sm" data-cookie-action="reject">Reject Optional</button>
            </div>
        `;

        document.body.appendChild(banner);
    }

    document.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-cookie-action]');
        if (actionButton) {
            const action = actionButton.getAttribute('data-cookie-action');
            if (action === 'accept') {
                saveConsent('accepted');
            } else if (action === 'reject') {
                saveConsent('rejected');
            }
            removeBanner();
            return;
        }

        const openSettings = event.target.closest('[data-open-cookie-settings]');
        if (openSettings) {
            event.preventDefault();
            openBanner(true);
        }
    });

    const shouldForceOpen = window.location.hash === '#settings';
    openBanner(shouldForceOpen);
});
