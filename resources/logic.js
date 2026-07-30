/* ==========================================================================
   RAJU ENTERPRISES — shared site behaviour
   Vanilla JS, no dependencies. Loaded with `defer` on every page.
   ========================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------- mobile nav */
    function initNav() {
        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        var header = document.getElementById('siteHeader');
        if (!toggle || !links) return;

        function close() {
            links.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        links.addEventListener('click', function (e) {
            if (e.target.closest('a')) close();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        document.addEventListener('click', function (e) {
            if (!header.contains(e.target)) close();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) close();
        });
    }

    /* --------------------------------------------- header shadow on scroll */
    function initHeaderState() {
        var header = document.getElementById('siteHeader');
        var toTop = document.getElementById('toTop');
        if (!header && !toTop) return;

        function update() {
            var y = window.scrollY;
            if (header) header.classList.toggle('is-stuck', y > 12);
            if (toTop) toTop.classList.toggle('is-shown', y > 600);
        }
        update();
        window.addEventListener('scroll', update, { passive: true });

        if (toTop) {
            toTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
    }

    /* ------------------------------------------------------ scroll reveal */
    function initReveal() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                setTimeout(function () { el.classList.add('is-in'); }, delay);
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        items.forEach(function (el) { io.observe(el); });
    }

    /* --------------------------------------------------- hero slideshow */
    function initHeroSlides() {
        var slides = document.querySelectorAll('.hero-slide');
        if (slides.length < 2) {
            if (slides.length) slides[0].classList.add('is-active');
            return;
        }

        var i = 0;
        slides[0].classList.add('is-active');

        setInterval(function () {
            slides[i].classList.remove('is-active');
            i = (i + 1) % slides.length;
            slides[i].classList.add('is-active');
        }, 5200);
    }

    /* -------------------------------------------------------- soap bubbles */
    function initBubbles() {
        var host = document.querySelector('.bubbles');
        if (!host || reduceMotion) return;

        var html = '';
        for (var n = 0; n < 14; n++) {
            var size = 12 + Math.random() * 58;
            var left = Math.random() * 100;
            var dur = 13 + Math.random() * 14;
            var delay = -Math.random() * 20;
            html += '<i style="width:' + size.toFixed(0) + 'px;height:' + size.toFixed(0) + 'px;' +
                    'left:' + left.toFixed(2) + '%;' +
                    'animation-duration:' + dur.toFixed(1) + 's;' +
                    'animation-delay:' + delay.toFixed(1) + 's"></i>';
        }
        host.innerHTML = html;
    }

    /* ------------------------------------------------------ count-up stats */
    function initCounters() {
        var nums = document.querySelectorAll('[data-count]');
        if (!nums.length) return;

        function run(el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var decimals = (String(target).split('.')[1] || '').length;

            if (reduceMotion) {
                el.textContent = target.toFixed(decimals) + suffix;
                return;
            }

            var start = performance.now();
            var dur = 1500;

            function tick(now) {
                var p = Math.min((now - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = (target * eased).toFixed(decimals) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        if (!('IntersectionObserver' in window)) {
            nums.forEach(run);
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                run(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.4 });

        nums.forEach(function (el) { io.observe(el); });
    }

    /* --------------------------------------------------------- footer year */
    function initYear() {
        document.querySelectorAll('[data-year]').forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }

    /* ------------------------------------------------ contact form validation */
    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        /* Take over validation only now that the script is running — the inputs
           keep their `required` attributes as a no-JS fallback. */
        form.noValidate = true;

        var rules = {
            name: function (v) {
                if (v.length < 2) return 'Please enter at least 2 characters.';
                if (!/^[A-Za-z .'-]+$/.test(v)) return 'Letters and spaces only, please.';
                return '';
            },
            email: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email, e.g. name@email.com';
            },
            phone: function (v) {
                if (!/^[0-9]{10}$/.test(v)) return 'Phone number must be exactly 10 digits.';
                if (v === '1234567890' || v === '9876543210') return 'Please enter a real phone number.';
                return '';
            },
            query: function (v) {
                return v.length < 5 ? 'Tell us a little more (at least 5 characters).' : '';
            }
        };

        function validateField(input) {
            var rule = rules[input.name];
            if (!rule) return true;

            var field = input.closest('.field');
            var msg = rule(input.value.trim());
            field.classList.toggle('has-error', !!msg);
            var box = field.querySelector('.field-msg');
            if (box) box.textContent = msg;
            return !msg;
        }

        form.querySelectorAll('input, textarea').forEach(function (input) {
            input.addEventListener('blur', function () { validateField(input); });
            input.addEventListener('input', function () {
                if (input.closest('.field').classList.contains('has-error')) validateField(input);
            });
        });

        form.addEventListener('submit', function (e) {
            var firstBad = null;

            form.querySelectorAll('input[name], textarea[name]').forEach(function (input) {
                if (!validateField(input) && !firstBad) firstBad = input;
            });

            if (firstBad) {
                e.preventDefault();
                firstBad.focus();
                firstBad.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
                return;
            }

            /* formsubmit.co takes over from here; if that navigation never
               happens, put the button back so the visitor can retry. */
            var btn = form.querySelector('button[type="submit"]');
            if (btn) {
                var label = btn.innerHTML;
                btn.disabled = true;
                btn.textContent = 'Sending…';
                setTimeout(function () {
                    btn.disabled = false;
                    btn.innerHTML = label;
                }, 8000);
            }
        });
    }

    /* ----------------------------------------------------------------- boot */
    function boot() {
        initNav();
        initHeaderState();
        initReveal();
        initHeroSlides();
        initBubbles();
        initCounters();
        initYear();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
