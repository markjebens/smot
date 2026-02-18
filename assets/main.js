/**
 * SINGLEMOTHEROFTWO — Arty Minimalist Redesign
 * Custom cursor · Scroll reveals · Magnetic buttons · Vinyl player
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────
       CUSTOM CURSOR
    ───────────────────────────────────────── */
    const cursorDot  = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    if (cursorDot && cursorRing) {
        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top  = mouseY + 'px';
        });

        // Ring follows with lag
        function animateRing() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top  = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover state
        const hoverTargets = document.querySelectorAll('a, button, .track-item, .release-row, .vinyl-record');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
        });
    }

    /* ─────────────────────────────────────────
       HERO TEXT REVEAL
    ───────────────────────────────────────── */
    const heroWords = document.querySelectorAll('.hero-word');
    heroWords.forEach((word, i) => {
        setTimeout(() => {
            word.classList.add('revealed');
        }, 200 + i * 180);
    });

    /* ─────────────────────────────────────────
       SCROLL REVEAL (IntersectionObserver)
    ───────────────────────────────────────── */
    const revealEls = document.querySelectorAll('[data-reveal-fade]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ─────────────────────────────────────────
       HEADER HIDE / SHOW ON SCROLL
    ───────────────────────────────────────── */
    const header = document.getElementById('header');
    let lastScrollY = 0;
    let headerVisible = true;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        if (currentScrollY < 80) {
            // Always show at top
            if (!headerVisible) {
                header.classList.remove('hidden');
                header.classList.add('visible');
                headerVisible = true;
            }
        } else if (delta > 4 && headerVisible) {
            // Scrolling down — hide
            header.classList.add('hidden');
            header.classList.remove('visible');
            headerVisible = false;
        } else if (delta < -4 && !headerVisible) {
            // Scrolling up — show
            header.classList.remove('hidden');
            header.classList.add('visible');
            headerVisible = true;
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    /* ─────────────────────────────────────────
       MAGNETIC BUTTONS
    ───────────────────────────────────────── */
    const magneticEls = document.querySelectorAll('.magnetic');

    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.25;
            const dy = (e.clientY - cy) * 0.25;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });

    /* ─────────────────────────────────────────
       HERO IMAGE PARALLAX
    ───────────────────────────────────────── */
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroImg.style.transform = `translateY(${scrolled * 0.15}px)`;
            }
        }, { passive: true });
    }

    /* ─────────────────────────────────────────
       VINYL PLAYER
    ───────────────────────────────────────── */
    const vinyl          = document.getElementById('vinyl');
    const toneArm        = document.getElementById('toneArm');
    const playBtn        = document.getElementById('playBtn');
    const prevBtn        = document.getElementById('prevBtn');
    const nextBtn        = document.getElementById('nextBtn');
    const nowPlayingTitle  = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    const vinylArt       = document.getElementById('vinyl-art');
    const trackItems     = document.querySelectorAll('.track-item');
    const iconPlay       = playBtn ? playBtn.querySelector('.icon-play')  : null;
    const iconPause      = playBtn ? playBtn.querySelector('.icon-pause') : null;

    const tracks = [
        { title: 'ISOLATION WARD',   artist: 'SINGLEMOTHEROFTWO', art: 'public/1.jpg' },
        { title: 'DOMESTIC DECAY',   artist: 'SINGLEMOTHEROFTWO', art: 'public/2.jpg' },
        { title: 'VOLTAGE_LEAK',     artist: 'SINGLEMOTHEROFTWO', art: 'public/3.jpg' },
        { title: 'STRUCTURAL RHYTHM',artist: 'SINGLEMOTHEROFTWO', art: 'public/4.jpg' },
    ];

    let isPlaying        = false;
    let currentTrackIndex = 0;
    let rotation         = 0;
    let isDragging       = false;
    let lastAngle        = 0;
    let velocity         = 0;
    let momentumId;

    function loadTrack(index) {
        currentTrackIndex = index;
        const track = tracks[index];

        if (nowPlayingTitle)  nowPlayingTitle.textContent  = track.title;
        if (nowPlayingArtist) nowPlayingArtist.textContent = track.artist;
        if (vinylArt)         vinylArt.src                 = track.art;

        trackItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    function setPlayState(playing) {
        isPlaying = playing;
        if (vinyl)    vinyl.classList.toggle('spinning', playing);
        if (toneArm)  toneArm.classList.toggle('playing', playing);
        if (iconPlay)  iconPlay.style.display  = playing ? 'none'  : '';
        if (iconPause) iconPause.style.display = playing ? ''      : 'none';
    }

    function togglePlay() {
        setPlayState(!isPlaying);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            vinyl.classList.remove('spinning');
            setTimeout(() => vinyl.classList.add('spinning'), 120);
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            vinyl.classList.remove('spinning');
            setTimeout(() => vinyl.classList.add('spinning'), 120);
        }
    }

    /* Drag interaction */
    function getAngle(e, el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    }

    function onDragStart(e) {
        if (isPlaying) return;
        isDragging = true;
        lastAngle  = getAngle(e, vinyl);
        vinyl.style.cursor    = 'grabbing';
        vinyl.style.animation = 'none';
        cancelAnimationFrame(momentumId);
        e.preventDefault();
    }

    function onDragMove(e) {
        if (!isDragging) return;
        const angle = getAngle(e, vinyl);
        let delta   = angle - lastAngle;
        if (delta >  180) delta -= 360;
        if (delta < -180) delta += 360;
        rotation  += delta;
        velocity   = delta;
        lastAngle  = angle;
        vinyl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        vinyl.style.cursor = 'grab';

        function applyMomentum() {
            if (Math.abs(velocity) < 0.08) { velocity = 0; return; }
            rotation += velocity;
            velocity *= 0.94;
            vinyl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            momentumId = requestAnimationFrame(applyMomentum);
        }
        applyMomentum();
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);

    trackItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadTrack(index);
            if (!isPlaying) setPlayState(true);
        });
    });

    if (vinyl) {
        vinyl.addEventListener('mousedown',  onDragStart);
        vinyl.addEventListener('touchstart', onDragStart, { passive: false });
        window.addEventListener('mousemove',  onDragMove);
        window.addEventListener('touchmove',  onDragMove, { passive: false });
        window.addEventListener('mouseup',    onDragEnd);
        window.addEventListener('touchend',   onDragEnd);
    }

    /* ─────────────────────────────────────────
       SMOOTH SCROLL
    ───────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ─────────────────────────────────────────
       RELEASE ROW — image preview on hover
    ───────────────────────────────────────── */
    const releaseRows = document.querySelectorAll('.release-row');
    releaseRows.forEach((row, index) => {
        row.addEventListener('click', () => {
            // Load corresponding track in player
            loadTrack(index);
            if (!isPlaying) setPlayState(true);
            document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ─────────────────────────────────────────
       INIT
    ───────────────────────────────────────── */
    loadTrack(0);
    console.log('🎵 SINGLEMOTHEROFTWO — Initialized');
});
