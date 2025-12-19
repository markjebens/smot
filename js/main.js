// --- HUD CURSOR LOGIC ---
const dot = document.getElementById('dot');
const bracket = document.getElementById('bracket');

let mouseX = 0, mouseY = 0;
let bracketX = 0, bracketY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
});

function animateCursor() {
    // Smooth trailing for the bracket
    let dx = mouseX - bracketX;
    let dy = mouseY - bracketY;
    bracketX += dx * 0.15;
    bracketY += dy * 0.15;
    bracket.style.left = `${bracketX}px`;
    bracket.style.top = `${bracketY}px`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

// --- REVEAL ON SCROLL ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Once revealed, stop observing to save resources
            observer.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.05, // Lower threshold for better detection
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters the viewport
});

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
    // Initial check for elements already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('active');
    }
});

// --- HOVER STATES ---
const interactives = document.querySelectorAll('a, button, input, textarea, .m-item');
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
});
