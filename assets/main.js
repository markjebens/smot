/**
 * SINGLEMOTHEROFTWO — Redesign Logic
 * Lenis Scroll, Custom Cursor, Canvas Grain, Parallax, Player
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── 1. LOADER ─── */
    const loader = document.getElementById('loader');
    const loaderFill = document.getElementById('loaderFill');
    const heroContent = document.querySelector('.hero-content');

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        loaderFill.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('loaded');
                setTimeout(() => heroContent?.classList.add('in'), 400);
            }, 500);
        }
    }, 100);

    /* ─── 2. LENIS SMOOTH SCROLL ─── */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor links integration with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: 0, duration: 1.5 });
                // Close mobile nav if open
                if (mobileNav.classList.contains('open')) {
                    navMenu.click();
                }
            }
        });
    });

    /* ─── 3. CUSTOM CURSOR ─── */
    const cur = document.getElementById('cur');
    const curLabel = document.getElementById('curLabel');

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor follow
    const renderCursor = () => {
        curX += (mouseX - curX) * 0.15;
        curY += (mouseY - curY) * 0.15;
        cur.style.transform = `translate(calc(${curX}px - 50%), calc(${curY}px - 50%))`;
        requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover logic via data-attributes
    document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const type = el.getAttribute('data-cursor');
            cur.className = `cur hover-${type}`;
            if (type === 'view') curLabel.textContent = 'VIEW';
            else if (type === 'drag') curLabel.textContent = 'DRAG';
            else curLabel.textContent = '';
        });
        el.addEventListener('mouseleave', () => {
            cur.className = 'cur';
            curLabel.textContent = '';
        });
    });

    /* ─── 4. MOBILE NAV ─── */
    const navMenu = document.getElementById('navMenu');
    const mobileNav = document.getElementById('mobileNav');

    navMenu?.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        mobileNav.classList.toggle('open');
        if (mobileNav.classList.contains('open')) {
            lenis.stop();
            cur.style.mixBlendMode = 'normal';
        } else {
            lenis.start();
            cur.style.mixBlendMode = 'difference';
        }
    });

    /* ─── 5. GRAIN CANVAS ─── */
    const grain = document.getElementById('grain');
    if (grain) {
        const ctx = grain.getContext('2d', { alpha: false });
        let w, h, imgData, d;

        const resize = () => {
            w = grain.width = window.innerWidth;
            h = grain.height = window.innerHeight;
            imgData = ctx.createImageData(w, h);
            d = imgData.data;
        };

        const draw = () => {
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.random() * 255 | 0;
                d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
            }
            ctx.putImageData(imgData, 0, 0);
            requestAnimationFrame(draw);
        };
        resize(); draw();
        window.addEventListener('resize', resize);
    }

    /* ─── 6. LIVE CLOCK ─── */
    const liveTime = document.getElementById('liveTime');
    const footerUpdated = document.getElementById('footerUpdated');
    const tick = () => {
        const n = new Date();
        liveTime.textContent = n.toLocaleTimeString('en-GB', { hour12: false });
        if (footerUpdated) {
            footerUpdated.textContent = `LAST UPDATED: ${n.getDate().toString().padStart(2, '0')}.${(n.getMonth() + 1).toString().padStart(2, '0')}.${n.getFullYear()}`;
        }
    };
    if (liveTime) { tick(); setInterval(tick, 1000); }

    /* ─── 7. SCROLL EFFECTS (Nav & Parallax & Reveals) ─── */
    const nav = document.getElementById('nav');
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    let lastScroll = 0;

    lenis.on('scroll', (e) => {
        const y = e.scroll;

        // Nav hide/show
        if (y > 100) {
            if (y > lastScroll && !nav.classList.contains('hidden')) nav.classList.add('hidden');
            else if (y < lastScroll && nav.classList.contains('hidden')) nav.classList.remove('hidden');
        } else {
            nav.classList.remove('hidden');
        }
        lastScroll = y;

        // Image Parallax (cheap effect via transform)
        parallaxEls.forEach(el => {
            const rect = el.parentElement.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // calculate center offset
                const offset = (rect.top - window.innerHeight / 2) * 0.1;
                el.style.transform = `translateY(${offset}px)`;
            }
        });
    });

    // Intersection Observer for Reveals
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

    /* ─── 8. INDEX PREVIEW HOVER ─── */
    const previewEl = document.getElementById('indexPreview');
    const previewImg = document.getElementById('previewImg');
    const previewTitle = document.getElementById('previewTitle');
    const previewMeta = document.getElementById('previewMeta');

    const releaseData = [
        { img: 'public/1.jpg', title: 'Isolation Ward', meta: 'EP · 2024' },
        { img: 'public/2.jpg', title: 'Domestic Decay', meta: 'LP · 2023' },
        { img: 'public/3.jpg', title: 'Voltage Leak', meta: 'Single · 2023' },
        { img: 'public/4.jpg', title: 'Structural Rhythm', meta: 'Demo · 2025' }
    ];

    document.querySelectorAll('.index-items .idx-item[data-target]').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const data = releaseData[item.dataset.target];
            if (!data || !previewEl) return;

            previewEl.classList.add('active');
            previewImg.style.opacity = '0';

            setTimeout(() => {
                previewImg.src = data.img;
                previewTitle.textContent = data.title;
                previewMeta.textContent = data.meta;
                previewImg.style.opacity = '1';
            }, 150);
        });

        item.addEventListener('mouseleave', () => {
            previewEl.classList.remove('active');
        });
    });

    /* ─── 9. VINYL PLAYER ─── */
    const deck = document.querySelector('.deck');
    const playBtn = document.getElementById('playBtn');
    const vinylArt = document.getElementById('vinyl-art');
    const npTitle = document.getElementById('nowPlayingTitle');
    const tlRows = document.querySelectorAll('.tl-row');
    const iPlay = playBtn?.querySelector('.i-play');
    const iPause = playBtn?.querySelector('.i-pause');

    let isPlaying = false;
    let currentTrack = 0;

    const loadTrack = (idx) => {
        currentTrack = idx;
        const data = releaseData[idx];

        // Update text
        npTitle.textContent = data.title.toUpperCase();

        // Update lists
        tlRows.forEach((r, i) => r.classList.toggle('active', i === idx));

        // Update vinyl art safely
        if (vinylArt) {
            vinylArt.style.opacity = '0';
            setTimeout(() => {
                vinylArt.src = data.img;
                vinylArt.style.opacity = '0.8';
            }, 300);
        }
    };

    const togglePlay = () => {
        isPlaying = !isPlaying;
        deck.classList.toggle('playing', isPlaying);
        if (iPlay) iPlay.style.display = isPlaying ? 'none' : 'block';
        if (iPause) iPause.style.display = isPlaying ? 'block' : 'none';
    };

    playBtn?.addEventListener('click', togglePlay);

    document.getElementById('prevBtn')?.addEventListener('click', () => {
        loadTrack((currentTrack - 1 + releaseData.length) % releaseData.length);
        if (!isPlaying) togglePlay();
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        loadTrack((currentTrack + 1) % releaseData.length);
        if (!isPlaying) togglePlay();
    });

    tlRows.forEach((row, idx) => {
        row.addEventListener('click', () => {
            loadTrack(idx);
            if (!isPlaying) togglePlay();
        });
    });

    // Init first track
    loadTrack(0);
});
