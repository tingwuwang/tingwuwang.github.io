/* ===== Sticky Nav Shadow ===== */
function initStickyNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;

    function onScroll() {
        if (window.scrollY > 10) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ===== Active Nav Highlighting ===== */
function initActiveNav() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;

    var links = nav.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var sectionMap = [];
    links.forEach(function (link) {
        var id = link.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (section) {
            sectionMap.push({ link: link, section: section });
        }
    });

    var currentActive = null;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            // Store visibility state on the section element
            entry.target._isInView = entry.isIntersecting;
        });

        // Find the first visible section (top-down order)
        var activeLink = null;
        for (var i = 0; i < sectionMap.length; i++) {
            if (sectionMap[i].section._isInView) {
                activeLink = sectionMap[i].link;
                break;
            }
        }

        if (activeLink !== currentActive) {
            if (currentActive) currentActive.classList.remove('active');
            if (activeLink) activeLink.classList.add('active');
            currentActive = activeLink;
        }
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sectionMap.forEach(function (item) {
        observer.observe(item.section);
    });
}

/* ===== Scroll Animations with Stagger ===== */
function initScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
        // Group newly visible entries by their parent section
        var batchByParent = new Map();

        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            var parent = entry.target.closest('section') || entry.target.parentElement;
            if (!batchByParent.has(parent)) {
                batchByParent.set(parent, []);
            }
            batchByParent.get(parent).push(entry.target);
            observer.unobserve(entry.target);
        });

        // Apply staggered delays per section
        batchByParent.forEach(function (els) {
            els.forEach(function (el, i) {
                el.style.setProperty('--anim-delay', (i * 80) + 'ms');
                // Small RAF delay to ensure the CSS variable is picked up
                requestAnimationFrame(function () {
                    el.classList.add('visible');
                });
            });
        });
    }, { threshold: 0.1 });

    elements.forEach(function (el) {
        observer.observe(el);
    });
}

/* ===== Particle Canvas ===== */
function initParticleCanvas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 50;
    var CONNECTION_DISTANCE = 120;
    var MOUSE_RADIUS = 150;
    var MOUSE_FORCE = 0.8;
    var animationId = null;
    var isHidden = false;

    // Track mouse position
    var mouse = { x: -9999, y: -9999 };

    document.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function getColors() {
        var style = getComputedStyle(document.documentElement);
        return {
            dot: style.getPropertyValue('--color-particle').trim() || 'rgba(23,114,208,0.25)',
            line: style.getPropertyValue('--color-particle-line').trim() || 'rgba(23,114,208,0.08)'
        };
    }

    function createParticles() {
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1
            });
        }
    }

    function animate() {
        if (isHidden) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var colors = getColors();

        // Update and draw particles
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // Mouse repulsion
            var mdx = p.x - mouse.x;
            var mdy = p.y - mouse.y;
            var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < MOUSE_RADIUS && mDist > 0) {
                var force = (1 - mDist / MOUSE_RADIUS) * MOUSE_FORCE;
                p.vx += (mdx / mDist) * force;
                p.vy += (mdy / mDist) * force;
            }

            // Dampen velocity so particles drift back naturally
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Keep a minimum drift so they don't freeze
            var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed < 0.15) {
                p.vx += (Math.random() - 0.5) * 0.1;
                p.vy += (Math.random() - 0.5) * 0.1;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.dot;
            ctx.fill();

            // Draw connections
            for (var j = i + 1; j < particles.length; j++) {
                var q = particles[j];
                var dx = p.x - q.x;
                var dy = p.y - q.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = colors.line;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            isHidden = true;
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            isHidden = false;
            animate();
        }
    });

    window.addEventListener('resize', function () {
        resize();
    });

    resize();
    createParticles();
    animate();
}

/* ===== Back to Top ===== */
function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    function onScroll() {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function () {
    initStickyNav();
    initActiveNav();
    initScrollAnimations();
    initParticleCanvas();
    initBackToTop();
});
