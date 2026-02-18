/**
 * SINGLEMOTHEROFTWO — Experimental
 * Grain · Cursor · Hero Reveal · Vinyl
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── GRAIN CANVAS ─── */
    const grain = document.getElementById('grain');
    if (grain) {
        const ctx = grain.getContext('2d');
        let raf;

        const resize = () => {
            grain.width = window.innerWidth;
            grain.height = window.innerHeight;
        };

        const draw = () => {
            const w = grain.width, h = grain.height;
            const img = ctx.createImageData(w, h);
            const d = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = Math.random() * 255 | 0;
                d[i] = d[i + 1] = d[i + 2] = v;
                d[i + 3] = 255;
            }
            ctx.putImageData(img, 0, 0);
            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        window.addEventListener('resize', resize);
    }

    /* ─── LIVE CLOCK ─── */
    const liveTime = document.getElementById('liveTime');
    if (liveTime) {
        const tick = () => {
            const n = new Date();
            liveTime.textContent =
                String(n.getHours()).padStart(2, '0') + ':' +
                String(n.getMinutes()).padStart(2, '0') + ':' +
                String(n.getSeconds()).padStart(2, '0');
        };
        tick();
        setInterval(tick, 1000);
    }

    /* ─── CURSOR ─── */
    const cur = document.getElementById('cur');
    if (cur) {
        let mx = 0, my = 0;
        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            cur.style.left = mx + 'px';
            cur.style.top = my + 'px';
        });

        document.querySelectorAll('a, button, .rel, .tl-row, .vinyl').forEach(el => {
            el.addEventListener('mouseenter', () => cur.classList.add('big'));
            el.addEventListener('mouseleave', () => cur.classList.remove('big'));
        });
    }

    /* ─── HERO REVEAL SEQUENCE ─── */
    // SINGLE line slides in from left
    const htSingle = document.querySelector('.ht-single');
    const htOftwo = document.querySelector('.ht-oftwo');
    const htMother = document.querySelectorAll('.ht-mother span');
    const heroMeta1 = document.querySelector('.hero-meta-1');
    const heroCta = document.querySelector('.hero-cta');

    setTimeout(() => htSingle?.classList.add('in'), 100);

    // MOTHER letters stagger
    htMother.forEach((span, i) => {
        setTimeout(() => span.classList.add('in'), 300 + i * 70);
    });

    // OF_TWO slides in from right
    setTimeout(() => htOftwo?.classList.add('in'), 600);

    // Meta fades in
    setTimeout(() => heroMeta1?.classList.add('in'), 900);
    setTimeout(() => heroCta?.classList.add('in'), 1100);

    /* ─── RANDOM GLITCH on MOTHER ─── */
    function glitchMother() {
        const spans = document.querySelectorAll('.ht-mother span');
        if (spans.length) {
            const el = spans[Math.floor(Math.random() * spans.length)];
            const origColor = el.style.color;
            el.style.transform = `translateY(${Math.random() * 6 - 3}px) skewX(${Math.random() * 8 - 4}deg)`;
            el.style.color = Math.random() > 0.5 ? '#fff' : 'var(--r)';
            setTimeout(() => {
                el.style.transform = '';
                el.style.color = origColor;
            }, 60 + Math.random() * 60);
        }
        setTimeout(glitchMother, 1500 + Math.random() * 3500);
    }
    setTimeout(glitchMother, 2000);

    /* ─── NAV HIDE/SHOW ─── */
    const nav = document.getElementById('nav');
    let lastY = 0, navVisible = true;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < 80) {
            nav?.classList.remove('hide');
            navVisible = true;
        } else if (y > lastY + 6 && navVisible) {
            nav?.classList.add('hide');
            navVisible = false;
        } else if (y < lastY - 6 && !navVisible) {
            nav?.classList.remove('hide');
            navVisible = true;
        }
        lastY = y;
    }, { passive: true });

    /* ─── HERO PARALLAX ─── */
    const heroBg = document.getElementById('heroBg');
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (heroBg && y < window.innerHeight * 1.5) {
            heroBg.style.transform = `translateY(${y * 0.2}px) scale(1.05)`;
        }
    }, { passive: true });

    /* ─── SCROLL REVEALS ─── */
    const revealEls = document.querySelectorAll('.reveal, .about-text, .about-img-wrap, .rel, .np, .tl, .contact-text-col, .contact-img-col');
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    revealEls.forEach((el, i) => {
        if (!el.classList.contains('ht-single') && !el.classList.contains('ht-oftwo')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${(i % 5) * 0.08}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${(i % 5) * 0.08}s`;
        }
        io.observe(el);
    });

    // When .in is added, apply visible styles
    const revealObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('in')) {
                m.target.style.opacity = '1';
                m.target.style.transform = 'translateY(0)';
            }
        });
    });

    revealEls.forEach(el => revealObserver.observe(el, { attributes: true, attributeFilter: ['class'] }));

    /* ─── VINYL PLAYER ─── */
    const vinyl = document.getElementById('vinyl');
    const tonearm = document.getElementById('toneArm');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const npTitle = document.getElementById('nowPlayingTitle');
    const npArtist = document.getElementById('nowPlayingArtist');
    const vinylArt = document.getElementById('vinyl-art');
    const tlRows = document.querySelectorAll('.tl-row');
    const iPlay = playBtn?.querySelector('.i-play');
    const iPause = playBtn?.querySelector('.i-pause');
    const npEl = document.querySelector('.np');

    const tracks = [
        { title: 'ISOLATION WARD', artist: 'SINGLEMOTHEROFTWO', art: 'public/1.jpg' },
        { title: 'DOMESTIC DECAY', artist: 'SINGLEMOTHEROFTWO', art: 'public/2.jpg' },
        { title: 'VOLTAGE_LEAK', artist: 'SINGLEMOTHEROFTWO', art: 'public/3.jpg' },
        { title: 'STRUCTURAL RHYTHM', artist: 'SINGLEMOTHEROFTWO', art: 'public/4.jpg' },
    ];

    let playing = false, current = 0;
    let rot = 0, dragging = false, lastAng = 0, vel = 0, momId;

    function loadTrack(idx) {
        current = idx;
        const t = tracks[idx];
        if (npTitle) npTitle.textContent = t.title;
        if (npArtist) npArtist.textContent = t.artist;
        if (vinylArt) {
            vinylArt.style.opacity = '0';
            setTimeout(() => {
                vinylArt.src = t.art;
                vinylArt.style.transition = 'opacity 0.4s';
                vinylArt.style.opacity = '0.75';
            }, 200);
        }
        tlRows.forEach((r, i) => r.classList.toggle('active', i === idx));
    }

    function setPlay(state) {
        playing = state;
        vinyl?.classList.toggle('spinning', state);
        tonearm?.classList.toggle('playing', state);
        npEl?.classList.toggle('playing', state);
        if (iPlay) iPlay.style.display = state ? 'none' : '';
        if (iPause) iPause.style.display = state ? '' : 'none';
    }

    function ang(e, el) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const ex = e.clientX ?? e.touches?.[0]?.clientX;
        const ey = e.clientY ?? e.touches?.[0]?.clientY;
        return Math.atan2(ey - cy, ex - cx) * (180 / Math.PI);
    }

    function dragStart(e) {
        if (playing) return;
        dragging = true;
        lastAng = ang(e, vinyl);
        vinyl.style.cursor = 'grabbing';
        vinyl.style.animation = 'none';
        cancelAnimationFrame(momId);
        e.preventDefault();
    }

    function dragMove(e) {
        if (!dragging) return;
        const a = ang(e, vinyl);
        let d = a - lastAng;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        rot += d; vel = d; lastAng = a;
        vinyl.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
    }

    function dragEnd() {
        if (!dragging) return;
        dragging = false;
        vinyl.style.cursor = 'grab';
        (function mom() {
            if (Math.abs(vel) < 0.06) { vel = 0; return; }
            rot += vel; vel *= 0.93;
            vinyl.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
            momId = requestAnimationFrame(mom);
        })();
    }

    playBtn?.addEventListener('click', () => setPlay(!playing));
    prevBtn?.addEventListener('click', () => {
        current = (current - 1 + tracks.length) % tracks.length;
        loadTrack(current);
        if (playing) { vinyl?.classList.remove('spinning'); setTimeout(() => vinyl?.classList.add('spinning'), 100); }
    });
    nextBtn?.addEventListener('click', () => {
        current = (current + 1) % tracks.length;
        loadTrack(current);
        if (playing) { vinyl?.classList.remove('spinning'); setTimeout(() => vinyl?.classList.add('spinning'), 100); }
    });

    tlRows.forEach((row, idx) => {
        row.addEventListener('click', () => { loadTrack(idx); if (!playing) setPlay(true); });
    });

    if (vinyl) {
        vinyl.addEventListener('mousedown', dragStart);
        vinyl.addEventListener('touchstart', dragStart, { passive: false });
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('touchmove', dragMove, { passive: false });
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('touchend', dragEnd);
    }

    /* ─── RELEASES → PLAYER ─── */
    document.querySelectorAll('.rel').forEach((el, idx) => {
        el.addEventListener('click', () => {
            loadTrack(idx);
            if (!playing) setPlay(true);
            document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ─── SMOOTH SCROLL ─── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

    loadTrack(0);
    console.log('⚡ SMOT');
});
