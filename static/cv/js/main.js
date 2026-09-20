/* =========================================================
   Akobir Marupov — portfolio
   Barcha interaktivlik shu faylda, tashqi kutubxona yo'q.
   ========================================================= */
(function () {
    'use strict';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const softMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* ---------------------------------------------------
       1. Preloader
       --------------------------------------------------- */
    window.addEventListener('load', () => {
        const pre = $('#preloader');
        if (!pre) return;
        setTimeout(() => {
            pre.classList.add('done');
            document.body.classList.remove('is-locked');
        }, 500);
    });
    document.body.classList.add('is-locked');

    /* ---------------------------------------------------
       2. Til almashtirgich
       --------------------------------------------------- */
    const LANG_KEY = 'am-portfolio-lang';
    let lang = 'uz';

    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved === 'uz' || saved === 'en') lang = saved;
    } catch (e) { /* localStorage yopiq bo'lsa ham sayt ishlayveradi */ }

    function movePill() {
        const pill = $('#langPill');
        const active = $('#langSwitch button.on');
        if (!pill || !active) return;
        pill.style.left = active.offsetLeft + 'px';
        pill.style.width = active.offsetWidth + 'px';
    }

    function applyLang(next) {
        lang = next;
        document.documentElement.setAttribute('lang', next);
        document.documentElement.setAttribute('data-lang', next);

        $$('[data-uz]').forEach(el => {
            const value = el.getAttribute('data-' + next);
            if (value !== null) el.textContent = value;
        });

        $$('#langSwitch button').forEach(b => {
            b.classList.toggle('on', b.dataset.setLang === next);
        });
        movePill();

        try { localStorage.setItem(LANG_KEY, next); } catch (e) { }

        restartTyping();
    }

    $$('#langSwitch button').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.setLang));
    });

    /* ---------------------------------------------------
       3. Yozuv effekti (hero)
       --------------------------------------------------- */
    let roles = [];
    const rolesNode = $('#roles-data');
    if (rolesNode) {
        try { roles = JSON.parse(rolesNode.textContent) || []; } catch (e) { roles = []; }
    }

    const typedEl = $('#typed');
    let typeTimer = null;
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function currentRole() {
        const role = roles[roleIndex % roles.length];
        if (!role) return '';
        return role[lang] || role.uz || '';
    }

    function typeLoop() {
        if (!typedEl || !roles.length) return;
        const text = currentRole();

        if (!deleting) {
            charIndex++;
            typedEl.textContent = text.slice(0, charIndex);
            if (charIndex >= text.length) {
                deleting = true;
                typeTimer = setTimeout(typeLoop, 1900);
                return;
            }
            typeTimer = setTimeout(typeLoop, 55 + Math.random() * 45);
        } else {
            charIndex--;
            typedEl.textContent = text.slice(0, charIndex);
            if (charIndex <= 0) {
                deleting = false;
                roleIndex++;
                typeTimer = setTimeout(typeLoop, 320);
                return;
            }
            typeTimer = setTimeout(typeLoop, 28);
        }
    }

    function restartTyping() {
        if (!typedEl || !roles.length) return;
        clearTimeout(typeTimer);
        if (softMotion) {
            typedEl.textContent = currentRole();
            return;
        }
        charIndex = 0;
        deleting = false;
        typedEl.textContent = '';
        typeTimer = setTimeout(typeLoop, 260);
    }

    /* ---------------------------------------------------
       4. Scroll: progress, nav holati, faol bo'lim
       --------------------------------------------------- */
    const nav = $('#nav');
    const bar = $('#progressBar');
    const toTop = $('#toTop');
    const sections = $$('main section[id]');
    const navLinks = $$('[data-nav]');
    let ticking = false;

    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        if (nav) nav.classList.toggle('stuck', y > 40);
        if (toTop) toTop.classList.toggle('show', y > 600);

        let active = '';
        sections.forEach(sec => {
            if (y >= sec.offsetTop - 140) active = sec.id;
        });
        navLinks.forEach(a => a.classList.toggle('active', a.dataset.nav === active));

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    if (toTop) {
        toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------------------------------------------------
       5. Mobil menyu
       --------------------------------------------------- */
    const burger = $('#burger');
    const mobileMenu = $('#mobileMenu');

    function closeMenu() {
        if (!burger || !mobileMenu) return;
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('is-locked');
    }

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            const open = burger.classList.toggle('open');
            mobileMenu.classList.toggle('open', open);
            document.body.classList.toggle('is-locked', open);
        });
        $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
    });

    /* ---------------------------------------------------
       6. Scroll bilan ochilish + hisoblagich + ko'nikma chiziqlari
       --------------------------------------------------- */
    const revealer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            revealer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    $$('[data-reveal]').forEach(el => revealer.observe(el));

    // Raqamlarni sanash
    function countUp(el) {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1500;
        const start = performance.now();

        function step(now) {
            const p = Math.min((now - start) / duration, 1);
            // yumshoq to'xtash
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counter = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            counter.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    $$('.count').forEach(el => counter.observe(el));

    // Ko'nikma chiziqlarini to'ldirish
    function fillBars(root) {
        $$('.bar span', root).forEach((s, i) => {
            const level = s.dataset.level || 0;
            setTimeout(() => { s.style.width = level + '%'; }, 90 * i);
        });
    }

    const barWatcher = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            fillBars(entry.target);
            barWatcher.unobserve(entry.target);
        });
    }, { threshold: 0.25 });

    $$('.skill-panel').forEach(p => barWatcher.observe(p));

    /* ---------------------------------------------------
       7. Ko'nikma bo'limidagi tablar
       --------------------------------------------------- */
    $$('.skill-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.tab;
            $$('.skill-tab').forEach(t => t.classList.toggle('on', t === tab));
            $$('.skill-panel').forEach(p => {
                const on = p.dataset.panel === key;
                p.classList.toggle('on', on);
                if (on) {
                    $$('.bar span', p).forEach(s => { s.style.width = '0%'; });
                    setTimeout(() => fillBars(p), 60);
                }
            });
        });
    });

    /* ---------------------------------------------------
       8. Kartalar ustidagi yorug'lik va tilt
       --------------------------------------------------- */
    $$('.card').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    if (!isTouch && !softMotion) {
        $$('[data-tilt]').forEach(el => {
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform =
                    `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-6px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });

        // Magnit tugmalar
        $$('[data-magnet]').forEach(el => {
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                el.style.transform = `translate(${x * 0.22}px, ${y * 0.32 - 3}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------------------------------------------------
       9. Maxsus kursor
       --------------------------------------------------- */
    if (!isTouch && !softMotion) {
        const dot = $('#cursorDot');
        const ring = $('#cursorRing');
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        window.addEventListener('pointermove', e => {
            mx = e.clientX;
            my = e.clientY;
            if (dot) {
                dot.style.left = mx + 'px';
                dot.style.top = my + 'px';
            }
        });

        (function follow() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            if (ring) {
                ring.style.left = rx + 'px';
                ring.style.top = ry + 'px';
            }
            requestAnimationFrame(follow);
        })();

        const hotSel = 'a, button, .card, .chip, .skill-tab';
        document.addEventListener('pointerover', e => {
            if (ring && e.target.closest(hotSel)) ring.classList.add('hot');
        });
        document.addEventListener('pointerout', e => {
            if (ring && e.target.closest(hotSel)) ring.classList.remove('hot');
        });
    } else {
        const dot = $('#cursorDot');
        const ring = $('#cursorRing');
        if (dot) dot.style.display = 'none';
        if (ring) ring.style.display = 'none';
    }

    /* ---------------------------------------------------
       10. Fondagi zarrachalar
       --------------------------------------------------- */
    (function particles() {
        const canvas = $('#particles');
        if (!canvas || softMotion) return;

        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, dots = [];
        const pointer = { x: -999, y: -999 };

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;

            const count = Math.min(Math.round(w * h / 22000), 90);
            dots = [];
            for (let i = 0; i < count; i++) {
                dots.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.28,
                    vy: (Math.random() - 0.5) * 0.28,
                    r: Math.random() * 1.6 + 0.6
                });
            }
        }

        function frame() {
            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < dots.length; i++) {
                const d = dots[i];
                d.x += d.vx;
                d.y += d.vy;

                if (d.x < 0 || d.x > w) d.vx *= -1;
                if (d.y < 0 || d.y > h) d.vy *= -1;

                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 245, 192, 0.45)';
                ctx.fill();

                // qo'shni nuqtalarni chiziq bilan bog'lash
                for (let j = i + 1; j < dots.length; j++) {
                    const o = dots[j];
                    const dist = Math.hypot(d.x - o.x, d.y - o.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(d.x, d.y);
                        ctx.lineTo(o.x, o.y);
                        ctx.strokeStyle = 'rgba(108, 140, 255, ' + (0.14 * (1 - dist / 120)).toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // sichqoncha yaqinidagi nuqtalar yorishadi
                const pd = Math.hypot(d.x - pointer.x, d.y - pointer.y);
                if (pd < 150) {
                    ctx.beginPath();
                    ctx.moveTo(d.x, d.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.strokeStyle = 'rgba(0, 245, 192, ' + (0.2 * (1 - pd / 150)).toFixed(3) + ')';
                    ctx.stroke();
                }
            }

            requestAnimationFrame(frame);
        }

        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', e => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        });
        window.addEventListener('pointerleave', () => {
            pointer.x = pointer.y = -999;
        });

        resize();
        frame();
    })();

    /* ---------------------------------------------------
       11. Kichik narsalar
       --------------------------------------------------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    window.addEventListener('resize', movePill);

    // Boshlanishi
    applyLang(lang);
    setTimeout(movePill, 120);
    onScroll();

})();
