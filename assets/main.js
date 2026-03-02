document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize SpectraNoise WebGL background
    if (typeof window.initSpectraNoise === 'function') {
        const canvas = document.getElementById('spectra-bg');
        if (canvas) {
            window.initSpectraNoise(canvas, {
                hueShift: 240,
                noiseIntensity: 0.05,
                scanlineIntensity: 0.0, // Disabled scanlines to ensure we can see pure animation
                scanlineFrequency: 0.0,
                warpAmount: 0.5,
                speed: 0.5,
                resolutionScale: 1.0   // Improved resolution
            });
        }
    }

    // 2. Brutalist Navigation Split-Screen Overlay Logic
    const navLinks = document.querySelectorAll('.nav-list .nav-item');
    const sections = document.querySelectorAll('.section-overlay');
    const closeBtns = document.querySelectorAll('.close-btn');

    function hideAllSections() {
        sections.forEach(sec => sec.classList.remove('active'));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    hideAllSections();
                    targetSection.classList.add('active');
                }
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllSections();
        });
    });

    // 4. Digital Clock in Footer
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        setInterval(() => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
            clockEl.textContent = timeStr;
        }, 1000);
    }

    // 5. SoundCloud Track Parsing (Unchanged logic, just keeping it alive)
    const tracksList = document.querySelector('#tracks-list');
    const soundcloudPlayer = document.querySelector('#soundcloud-player');
    const soundcloudPlayerWrap = document.querySelector('#track-player');

    function formatTrackDate(dateString) {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'Recent';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
    }

    function escapeHtml(value) {
        return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    }

    function renderTracks(tracks) {
        if (!tracks.length) return false;

        if (tracksList) {
            tracksList.innerHTML = tracks.map(track => `
                <div class="list-item">
                    <div class="list-meta">${formatTrackDate(track.publishedAt)}</div>
                    <div class="list-body">
                        <strong>${escapeHtml(track.title)}</strong>
                        <span>Single Mother Of Two</span>
                    </div>
                    <div class="list-actions">
                        <a href="#" class="track-play-link" data-track-url="${track.url}">(Play)</a>
                        <a href="${track.url}" target="_blank" rel="noopener noreferrer">(Share)</a>
                    </div>
                </div>
            `).join('');
        }
        return true;
    }

    function renderFallbackTracks() {
        const fallbackTracks = [{ title: 'Latest release on SoundCloud', url: 'https://soundcloud.com/singlemotheroftwo/tracks', publishedAt: '' }];
        renderTracks(fallbackTracks);
    }

    function parseTracksFromRinaMarkdown(markdown) {
        const lines = markdown.split('\n');
        const tracks = [];
        let pendingDate = '';
        const reservedSlugs = new Set(['tracks', 'albums', 'popular-tracks', 'playlists', 'sets', 'reposts', 'likes', 'followers', 'following', 'spotlight']);

        for (const line of lines) {
            const dateMatch = line.match(/published on\s+(.+)$/i);
            if (dateMatch) { pendingDate = dateMatch[1].trim(); continue; }
            const linkMatch = line.match(/\[(.+?)\]\((https:\/\/soundcloud\.com\/[^)\s]+)\)/i);
            if (!linkMatch) continue;
            const title = linkMatch[1].trim();
            const url = linkMatch[2].trim();

            // basic check
            if (!tracks.find(t => t.url === url)) { tracks.push({ title, url, publishedAt: pendingDate }); }
        }
        return tracks.slice(0, 8);
    }

    async function loadTracks() {
        if (!tracksList) return;
        const proxyTargets = [
            'https://r.jina.ai/http://soundcloud.com/singlemotheroftwo/tracks'
        ];
        for (const target of proxyTargets) {
            try {
                const response = await fetch(target);
                if (!response.ok) continue;
                const markdown = await response.text();
                const tracks = parseTracksFromRinaMarkdown(markdown);
                if (renderTracks(tracks)) return;
            } catch (error) { }
        }
        renderFallbackTracks();
    }

    if (tracksList) {
        tracksList.addEventListener('click', (event) => {
            const playLink = event.target.closest('.track-play-link');
            if (!playLink || !soundcloudPlayer || !soundcloudPlayerWrap) return;
            event.preventDefault();
            const trackUrl = playLink.getAttribute('data-track-url');
            if (!trackUrl) return;
            soundcloudPlayer.src = \`https://w.soundcloud.com/player/?url=\${encodeURIComponent(trackUrl)}&color=%23111111&auto_play=true&show_teaser=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true\`;
            soundcloudPlayerWrap.classList.add('active');
            soundcloudPlayerWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        loadTracks();
    }
});
