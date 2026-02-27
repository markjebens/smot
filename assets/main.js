document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const overlayLinks = document.querySelectorAll('.overlay-nav a');
    const tracksList = document.querySelector('#tracks-list');
    const soundcloudPlayer = document.querySelector('#soundcloud-player');
    const soundcloudPlayerWrap = document.querySelector('#track-player');

    if (menuToggle && menuOverlay) {
        // Toggle Menu
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');

            // Prevent scrolling when menu is open
            if (menuOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close Menu on Link Click
        overlayLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    function formatTrackDate(dateString) {
        if (!dateString) {
            return 'Recent';
        }

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return 'Recent';
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
        });
    }

    function escapeHtml(value) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function renderTracks(tracks) {
        if (!tracks.length) {
            return false;
        }

        tracksList.innerHTML = tracks.map(track => `
            <div class="tour-item">
                <div class="tour-date">${formatTrackDate(track.publishedAt)}</div>
                <div class="tour-venue">
                    <strong>${escapeHtml(track.title)}</strong>
                    <span>Single Mother Of Two</span>
                </div>
                <div class="tour-actions">
                    <a href="#" class="track-play-link" data-track-url="${track.url}" data-track-title="${escapeHtml(track.title)}">PLAY</a>
                    <a href="${track.url}" target="_blank" rel="noopener noreferrer">SHARE</a>
                </div>
            </div>
        `).join('');

        return true;
    }

    function renderFallbackTracks() {
        const fallbackTracks = [
            {
                title: 'Latest release on SoundCloud',
                url: 'https://soundcloud.com/singlemotheroftwo/tracks',
                publishedAt: '',
            },
        ];
        renderTracks(fallbackTracks);
    }

    function parseTracksFromRinaMarkdown(markdown) {
        const lines = markdown.split('\n');
        const tracks = [];
        let pendingDate = '';
        const reservedSlugs = new Set([
            'tracks',
            'albums',
            'popular-tracks',
            'playlists',
            'sets',
            'reposts',
            'likes',
            'followers',
            'following',
            'spotlight',
        ]);

        for (const line of lines) {
            const dateMatch = line.match(/published on\s+(.+)$/i);
            if (dateMatch) {
                pendingDate = dateMatch[1].trim();
                continue;
            }

            const linkMatch = line.match(/\[(.+?)\]\((https:\/\/soundcloud\.com\/[^)\s]+)\)/i);
            if (!linkMatch) {
                continue;
            }

            const title = linkMatch[1].trim();
            const url = linkMatch[2].trim();
            let looksLikeTrack = false;
            let trackSlug = '';

            try {
                const parsed = new URL(url);
                const parts = parsed.pathname.split('/').filter(Boolean);
                const username = parts[0] || '';
                trackSlug = parts[1] || '';
                const hasKnownUsername = username === 'singlemotheroftwo' || username === 'motheroftwoofficial';
                looksLikeTrack = hasKnownUsername && Boolean(trackSlug) && !reservedSlugs.has(trackSlug);
            } catch (error) {
                looksLikeTrack = false;
            }

            if (!looksLikeTrack || title.toLowerCase().includes('soundcloud')) {
                continue;
            }

            if (!tracks.find(track => track.url === url)) {
                tracks.push({
                    title,
                    url,
                    publishedAt: pendingDate,
                });
            }
        }

        return tracks.slice(0, 8);
    }

    async function loadTracks() {
        const proxyTargets = [
            'https://r.jina.ai/http://soundcloud.com/singlemotheroftwo/tracks',
            'https://r.jina.ai/http://soundcloud.com/motheroftwoofficial/tracks',
        ];

        for (const target of proxyTargets) {
            try {
                const response = await fetch(target);
                if (!response.ok) {
                    continue;
                }

                const markdown = await response.text();
                const tracks = parseTracksFromRinaMarkdown(markdown);
                if (renderTracks(tracks)) {
                    return;
                }
            } catch (error) {
                // Try the next source.
            }
        }

        renderFallbackTracks();
    }

    if (tracksList) {
        tracksList.addEventListener('click', (event) => {
            const playLink = event.target.closest('.track-play-link');
            if (!playLink || !soundcloudPlayer || !soundcloudPlayerWrap) {
                return;
            }

            event.preventDefault();
            const trackUrl = playLink.getAttribute('data-track-url');
            if (!trackUrl) {
                return;
            }

            soundcloudPlayer.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23ffffff&auto_play=true&show_teaser=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
            soundcloudPlayerWrap.classList.add('active');
            soundcloudPlayerWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        loadTracks();
    }
});
