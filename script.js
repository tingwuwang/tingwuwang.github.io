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

/* ===== Typing Robot for Bio ===== */
function initTypingRobot() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var bioText = document.querySelector('.hero-bio-text');
    if (!bioText) return;

    // Skip if hero is not in viewport (e.g. user followed anchor link)
    var heroRect = bioText.getBoundingClientRect();
    if (heroRect.top > window.innerHeight || heroRect.bottom < 0) return;

    var SVG_NS = 'http://www.w3.org/2000/svg';

    function createTypingRobotSVG() {
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('typing-robot');

        // Head
        var head = document.createElementNS(SVG_NS, 'rect');
        head.setAttribute('x', '3');
        head.setAttribute('y', '1');
        head.setAttribute('width', '10');
        head.setAttribute('height', '8');
        head.setAttribute('rx', '2');
        head.setAttribute('fill', '#1772d0');

        // Left eye
        var leftEye = document.createElementNS(SVG_NS, 'circle');
        leftEye.setAttribute('cx', '6');
        leftEye.setAttribute('cy', '5');
        leftEye.setAttribute('r', '1.2');
        leftEye.setAttribute('fill', '#fff');

        // Right eye
        var rightEye = document.createElementNS(SVG_NS, 'circle');
        rightEye.setAttribute('cx', '10');
        rightEye.setAttribute('cy', '5');
        rightEye.setAttribute('r', '1.2');
        rightEye.setAttribute('fill', '#fff');

        // Blinking eyelids
        var leftLid = document.createElementNS(SVG_NS, 'rect');
        leftLid.setAttribute('x', '4.5');
        leftLid.setAttribute('y', '3.5');
        leftLid.setAttribute('width', '3');
        leftLid.setAttribute('height', '3');
        leftLid.setAttribute('fill', '#1772d0');
        leftLid.setAttribute('opacity', '0');
        leftLid.style.animation = 'typing-robot-blink 2.5s infinite';

        var rightLid = document.createElementNS(SVG_NS, 'rect');
        rightLid.setAttribute('x', '8.5');
        rightLid.setAttribute('y', '3.5');
        rightLid.setAttribute('width', '3');
        rightLid.setAttribute('height', '3');
        rightLid.setAttribute('fill', '#1772d0');
        rightLid.setAttribute('opacity', '0');
        rightLid.style.animation = 'typing-robot-blink 2.5s infinite';

        // Typing arm
        var arm = document.createElementNS(SVG_NS, 'line');
        arm.setAttribute('x1', '13');
        arm.setAttribute('y1', '7');
        arm.setAttribute('x2', '15');
        arm.setAttribute('y2', '12');
        arm.setAttribute('stroke', '#1772d0');
        arm.setAttribute('stroke-width', '1.5');
        arm.setAttribute('stroke-linecap', 'round');

        svg.appendChild(head);
        svg.appendChild(leftEye);
        svg.appendChild(rightEye);
        svg.appendChild(leftLid);
        svg.appendChild(rightLid);
        svg.appendChild(arm);

        return svg;
    }

    // Tokenize innerHTML: split into tags and text chunks
    function tokenize(html) {
        var tokens = [];
        var tagRegex = /(<[^>]+>)/g;
        var lastIndex = 0;
        var match;

        while ((match = tagRegex.exec(html)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({ type: 'text', value: html.slice(lastIndex, match.index) });
            }
            tokens.push({ type: 'tag', value: match[1] });
            lastIndex = tagRegex.lastIndex;
        }

        if (lastIndex < html.length) {
            tokens.push({ type: 'text', value: html.slice(lastIndex) });
        }

        return tokens;
    }

    // Split text into words, preserving whitespace
    function splitWords(text) {
        var parts = [];
        var wordRegex = /(\S+)/g;
        var lastIndex = 0;
        var match;

        while ((match = wordRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'space', value: text.slice(lastIndex, match.index) });
            }
            parts.push({ type: 'word', value: match[1] });
            lastIndex = wordRegex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push({ type: 'space', value: text.slice(lastIndex) });
        }

        return parts;
    }

    // Process each <p> inside hero-bio-text
    var paragraphs = bioText.querySelectorAll('p');
    var allWordSpans = [];

    paragraphs.forEach(function (p) {
        var tokens = tokenize(p.innerHTML);
        var newHTML = '';

        tokens.forEach(function (token) {
            if (token.type === 'tag') {
                newHTML += token.value;
            } else {
                var parts = splitWords(token.value);
                parts.forEach(function (part) {
                    if (part.type === 'space') {
                        newHTML += part.value;
                    } else {
                        newHTML += '<span class="typing-word">' + part.value + '</span>';
                    }
                });
            }
        });

        p.innerHTML = newHTML;
        var spans = p.querySelectorAll('.typing-word');
        for (var i = 0; i < spans.length; i++) {
            allWordSpans.push(spans[i]);
        }
    });

    if (!allWordSpans.length) return;

    // Create the typing robot SVG
    var robot = createTypingRobotSVG();
    allWordSpans[0].parentNode.insertBefore(robot, allWordSpans[0]);

    var currentIndex = 0;
    var punctuationRegex = /[.,;:!?]$/;

    function revealNext() {
        if (currentIndex >= allWordSpans.length) {
            // Celebration animation
            robot.classList.add('celebrate');
            robot.addEventListener('animationend', function () {
                if (robot.parentNode) robot.parentNode.removeChild(robot);
            });
            return;
        }

        var span = allWordSpans[currentIndex];
        span.classList.add('revealed');

        // Move robot after the current word
        if (span.nextSibling) {
            span.parentNode.insertBefore(robot, span.nextSibling);
        } else {
            span.parentNode.appendChild(robot);
        }

        currentIndex++;

        // Timing: longer pause for punctuation
        var text = span.textContent;
        var delay = 50 + Math.random() * 40; // 50-90ms
        if (punctuationRegex.test(text)) {
            delay = 150;
        }

        setTimeout(revealNext, delay);
    }

    // Start with a small initial delay
    setTimeout(revealNext, 300);
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function () {
    var inits = [initTypingRobot, initScrollAnimations, initParticleCanvas, initBackToTop];
    inits.forEach(function (fn) {
        try { fn(); } catch (e) { console.error(fn.name + ':', e); }
    });
});
