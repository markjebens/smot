/**
 * SINGLEMOTHEROFTWO - Vinyl Player & Interactions
 * Redesign inspired by Project Turntable
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const vinyl = document.getElementById('vinyl');
    const toneArm = document.getElementById('toneArm');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    const vinylArt = document.getElementById('vinyl-art');
    const trackItems = document.querySelectorAll('.track-item');

    // --- STATE ---
    let isPlaying = false;
    let currentTrackIndex = 0;
    let rotation = 0;
    let isDragging = false;
    let lastAngle = 0;
    let velocity = 0;
    let animationId;

    // --- TRACKS DATA ---
    const tracks = [
        { title: "ISOLATION WARD", artist: "SINGLEMOTHEROFTWO", art: "public/1.jpg" },
        { title: "DOMESTIC DECAY", artist: "SINGLEMOTHEROFTWO", art: "public/2.jpg" },
        { title: "VOLTAGE_LEAK", artist: "SINGLEMOTHEROFTWO", art: "public/3.jpg" },
        { title: "STRUCTURAL RHYTHM", artist: "SINGLEMOTHEROFTWO", art: "public/4.jpg" }
    ];

    // --- FUNCTIONS ---
    function loadTrack(index) {
        currentTrackIndex = index;
        const track = tracks[index];
        
        nowPlayingTitle.textContent = track.title;
        nowPlayingArtist.textContent = track.artist;
        vinylArt.src = track.art;
        
        // Update active state in tracklist
        trackItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    function togglePlay() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            vinyl.classList.add('spinning');
            toneArm.classList.add('playing');
            playBtn.textContent = '⏸';
        } else {
            vinyl.classList.remove('spinning');
            toneArm.classList.remove('playing');
            playBtn.textContent = '▶';
        }
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        
        // Brief pause effect
        if (isPlaying) {
            vinyl.classList.remove('spinning');
            setTimeout(() => vinyl.classList.add('spinning'), 100);
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        
        if (isPlaying) {
            vinyl.classList.remove('spinning');
            setTimeout(() => vinyl.classList.add('spinning'), 100);
        }
    }

    // --- DRAG INTERACTION ---
    function getAngle(e, element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    }

    function handleDragStart(e) {
        if (isPlaying) return; // Only allow drag when paused
        
        isDragging = true;
        lastAngle = getAngle(e, vinyl);
        vinyl.style.cursor = 'grabbing';
        vinyl.style.animation = 'none';
        
        e.preventDefault();
    }

    function handleDragMove(e) {
        if (!isDragging) return;
        
        const currentAngle = getAngle(e, vinyl);
        let delta = currentAngle - lastAngle;
        
        // Handle wrap-around
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        
        rotation += delta;
        vinyl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        velocity = delta;
        lastAngle = currentAngle;
    }

    function handleDragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        vinyl.style.cursor = 'grab';
        
        // Apply momentum
        function applyMomentum() {
            if (isDragging || Math.abs(velocity) < 0.1) {
                velocity = 0;
                return;
            }
            
            rotation += velocity;
            velocity *= 0.95; // Friction
            vinyl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            
            animationId = requestAnimationFrame(applyMomentum);
        }
        
        applyMomentum();
    }

    // --- EVENT LISTENERS ---
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);

    // Track list clicks
    trackItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            loadTrack(index);
            if (!isPlaying) {
                togglePlay();
            }
        });
    });

    // Vinyl drag (mouse)
    vinyl.addEventListener('mousedown', handleDragStart);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);

    // Vinyl drag (touch)
    vinyl.addEventListener('touchstart', handleDragStart, { passive: false });
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    // --- SMOOTH SCROLL ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- INTERSECTION OBSERVER FOR ANIMATIONS ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for fade-in
    document.querySelectorAll('section, .album-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Initialize
    loadTrack(0);
    
    console.log('🎵 SINGLEMOTHEROFTWO Player Initialized');
});
