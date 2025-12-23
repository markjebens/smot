/**
 * SINGLEMOTHEROFTWO // VINYL PLAYER LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
    const record = document.querySelector('.record-disk');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const timeCurrent = document.getElementById('time-current');
    const timeTotal = document.getElementById('time-total');
    const toneArm = document.querySelector('.tone-arm');
    
    let isPlaying = false;
    let rotation = 0;
    let velocity = 0;
    let lastMouseBefore = 0;
    let isDragging = false;
    let rafId;

    // Mock Tracks Data
    const tracks = [
        { title: "ISOLATION WARD", artist: "SINGLEMOTHEROFTWO", duration: "04:32" },
        { title: "DOMESTIC DECAY", artist: "SINGLEMOTHEROFTWO", duration: "03:45" },
        { title: "VOLTAGE_LEAK", artist: "SINGLEMOTHEROFTWO", duration: "05:12" },
        { title: "STRUCTURAL RHYTHM", artist: "SINGLEMOTHEROFTWO", duration: "04:01" }
    ];
    let currentTrackIdx = 0;

    // --- AUDIO SIMULATION ---
    // In a real app, this would control an <audio> element.
    // Here we simulate progress.
    let playProgress = 0; // 0 to 100
    
    function loadTrack(idx) {
        trackTitle.textContent = tracks[idx].title;
        trackArtist.textContent = tracks[idx].artist;
        timeTotal.textContent = tracks[idx].duration;
        playProgress = 0;
        updateTimeDisplay();
        
        // Update functionality for list items
        document.querySelectorAll('.track-item').forEach((item, i) => {
            if (i === idx) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    function togglePlay() {
        isPlaying = !isPlaying;
        updatePlayButton();
        
        if (isPlaying) {
            velocity = 1; // Normal speed
            toneArm.classList.add('playing');
        } else {
            toneArm.classList.remove('playing');
        }
    }

    function updatePlayButton() {
        playBtn.textContent = isPlaying ? "PAUSE" : "PLAY";
    }

    // --- ANIMATION LOOP ---
    function update() {
        // Friction when dragging not happening, but stopping
        if (!isPlaying && !isDragging) {
            velocity *= 0.95;
            if (Math.abs(velocity) < 0.01) velocity = 0;
        }
        
        // Recover speed if playing and not dragging
        if (isPlaying && !isDragging) {
            velocity += (1 - velocity) * 0.1;
        }

        rotation += velocity * 2; // Speed multiplier
        record.style.transform = `rotate(${rotation}deg)`;

        if (isPlaying) {
            playProgress += 0.05; // Simulate time
            if (playProgress >= 100) {
                playProgress = 0;
                // Auto next?
            }
            updateTimeDisplay();
        }

        rafId = requestAnimationFrame(update);
    }
    
    function updateTimeDisplay() {
        // Convert progress to MM:SS (mock)
        // Just mocking for visual
        let totalSeconds = 240; // approx 4 mins
        let currentSeconds = Math.floor((playProgress / 100) * totalSeconds);
        let mins = Math.floor(currentSeconds / 60);
        let secs = currentSeconds % 60;
        timeCurrent.textContent = `${mins}:${secs < 10 ? '0'+secs : secs}`;
    }

    // --- DRAG INTERACTION ---
    record.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseBefore = getAngle(e);
        record.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentAngle = getAngle(e);
        const delta = currentAngle - lastMouseBefore;
        
        // Handle wrapping from 360 to 0
        let diff = delta;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        rotation += diff;
        velocity = diff; // Impulse
        
        lastMouseBefore = currentAngle;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = 'auto';
        }
    });

    function getAngle(e) {
        const rect = record.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        return Math.atan2(y, x) * (180 / Math.PI);
    }

    // --- EVENT LISTENERS ---
    playBtn.addEventListener('click', togglePlay);
    
    nextBtn.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
        loadTrack(currentTrackIdx);
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIdx);
    });

    // Track List Clicks
    document.querySelectorAll('.track-item').forEach((item, idx) => {
        item.addEventListener('click', () => {
            currentTrackIdx = idx;
            loadTrack(idx);
            if (!isPlaying) togglePlay();
        });
    });

    // Init
    loadTrack(0);
    update();
});
