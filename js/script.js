document.addEventListener('DOMContentLoaded', function () {

    /* ===== burger / mobile sidebar ===== */
    var burger = document.querySelector('.burger');
    var sidebar = document.querySelector('.sidebar');

    if (burger && sidebar) {
        burger.addEventListener('click', function () {
            burger.classList.toggle('active');
            sidebar.classList.toggle('active');
        });

        sidebar.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                burger.classList.remove('active');
                sidebar.classList.remove('active');
            });
        });
    }

    /* ===== nav + hero entrance animation ===== */
    var nav = document.querySelector('nav');
    if (nav) nav.classList.add('visible');

    var heroSelectors = [
        '.home .main-text .eyebrow p',
        '.home .main-text h1',
        '.home .main-text h3',
        '.home .main-text h4',
        '.home .main-text .buttons',
        '.home .main .image img'
    ];

    heroSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            requestAnimationFrame(function () {
                el.classList.add('visible');
            });
        });
    });

    /* ===== reveal-on-scroll ===== */
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        revealEls.forEach(function (el) {
            el.classList.add('reveal-pre');
        });

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ===== certificates carousel (plain horizontal scroll) ===== */
    document.querySelectorAll('.cert-carousel').forEach(function (carousel) {
        var viewport = carousel.querySelector('.cert-viewport');
        var track = carousel.querySelector('.cert-track');
        var prev = carousel.querySelector('.prev-arrow');
        var next = carousel.querySelector('.next-arrow');
        if (!viewport || !track) return;

        function cardStep() {
            var firstCard = track.querySelector('.cert-card');
            if (!firstCard) return 300;
            var style = window.getComputedStyle(track);
            var gap = parseFloat(style.gap || style.columnGap || 24);
            return firstCard.getBoundingClientRect().width + gap;
        }

        if (prev) {
            prev.addEventListener('click', function () {
                viewport.scrollBy({ left: -cardStep(), behavior: 'smooth' });
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                viewport.scrollBy({ left: cardStep(), behavior: 'smooth' });
            });
        }
    });

    /* ===== reviews: big phone in front, others fanned behind ===== */
    var stack = document.getElementById('reviewStack');
    if (stack) {
        var cards = Array.prototype.slice.call(stack.querySelectorAll('.phone-card'));
        var total = cards.length;
        var current = 0;

        function getLayout() {
            var mobile = window.innerWidth <= 768;
            var k = mobile ? 0.65 : 1;
            return {
                0: { x: 0,        y: 0,        r: 0,  s: 1,    z: 6 },
                1: { x: 0.8 * k,  y: 0.10,     r: 12, s: 0.93, z: 5 },
                2: { x: 1.23 * k, y: 0.32,     r: 24, s: 0.86, z: 4 }
            };
        }

        function renderStack() {
            var layout = getLayout();
            var unit = cards[0].offsetWidth;

            cards.forEach(function (card, i) {
                var d = (i - current + total) % total;
                var mirrored = total - d;
                var pos;

                if (layout[d]) {
                    pos = layout[d];
                } else if (layout[mirrored]) {
                    var m = layout[mirrored];
                    pos = { x: -m.x, y: m.y, r: -m.r, s: m.s, z: m.z };
                } else {
                    pos = { x: 0, y: 0.15, r: 0, s: 0.8, z: 1, hidden: true };
                }

                card.style.transform =
                    'translate(' + (pos.x * unit) + 'px, ' + (pos.y * unit) + 'px) ' +
                    'rotate(' + pos.r + 'deg) scale(' + pos.s + ')';
                card.style.zIndex = pos.z;
                card.style.opacity = pos.hidden ? 0 : 1;
                card.style.pointerEvents = d === 0 ? 'auto' : 'none';
            });
        }

        var prevBtn = stack.parentElement.querySelector('.stack-arrows .prev-arrow');
        var nextBtn = stack.parentElement.querySelector('.stack-arrows .next-arrow');

        if (nextBtn) nextBtn.addEventListener('click', function () {
            current = (current + 1) % total;
            renderStack();
        });
        if (prevBtn) prevBtn.addEventListener('click', function () {
            current = (current - 1 + total) % total;
            renderStack();
        });

        window.addEventListener('resize', renderStack);
        renderStack();
    }

    /* ===== Вспомогательная функция форматирования времени ===== */
    function formatTime(totalSeconds) {
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    /* ===== hero countdown timer (10 секунд, затем двигается) ===== */
    var TIMER_START_SECONDS = 10;
    var timerValueEl = document.getElementById('heroTimerValue');
    var heroBadge = document.getElementById('heroTimer') || timerValueEl;
    var remaining = TIMER_START_SECONDS;
    var heroIntervalId = null;

    function tickTimer() {
        if (!timerValueEl) return;

        if (remaining > 0) {
            timerValueEl.textContent = formatTime(remaining);
            remaining -= 1;
        } else {
            timerValueEl.textContent = formatTime(0);
            clearInterval(heroIntervalId);
            if (heroBadge) {
                heroBadge.classList.add('time-is-up');
            }
        }
    }

    if (timerValueEl) {
        tickTimer();
        heroIntervalId = setInterval(tickTimer, 1000);
    }

    /* ===== signs-section countdown: запускается ТОЛЬКО при скролле до него ===== */
    var signsTimerEl = document.getElementById('signsTimerValue');
    var signsBadge = document.getElementById('signsTimer') || signsTimerEl;
    var signsRemaining = 10;
    var signsIntervalId = null;
    var signsStarted = false; // флаг, чтобы таймер не стартовал повторно

    function tickSignsTimer() {
        if (!signsTimerEl) return;

        if (signsRemaining > 0) {
            signsTimerEl.textContent = formatTime(signsRemaining);
            signsRemaining -= 1;
        } else {
            signsTimerEl.textContent = formatTime(0);
            clearInterval(signsIntervalId);
            if (signsBadge) {
                signsBadge.classList.add('time-is-up');
            }
        }
    }

    function startSignsTimer() {
        if (signsStarted) return;
        signsStarted = true;

        tickSignsTimer();
        signsIntervalId = setInterval(tickSignsTimer, 1000);
    }

    // Если есть элемент таймера, инициализируем его значением 00:10
    if (signsTimerEl) {
        signsTimerEl.textContent = formatTime(signsRemaining);

        // Используем IntersectionObserver для отслеживания прокрутки до элемента
        if ('IntersectionObserver' in window) {
            var signsObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        startSignsTimer();
                        signsObserver.unobserve(entry.target); // перестаем следить
                    }
                });
            }, { threshold: 0.3 }); // Стартует, когда элемент показан на 30%

            signsObserver.observe(signsBadge || signsTimerEl);
        } else {
            // Фолбэк для старых браузеров
            startSignsTimer();
        }
    }

});


/* ===== анимации при скролле: добавляют класс .visible ===== */
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.2
});

document.querySelectorAll(
  '.home, .home nav, .home .main .main-text h1, .home .main .main-text h3, .home .main-text p, .home .main .main-text .buttons, .home .main .main-text .eyebrow p, .home .main .image img, ' +
  '.about-us .container .image, .about-us .container .main .text h3, .about-us .container .main .text p, .about-us .button, ' +
  '.signs .button, ' +
  '.services .main-text, ' +
  '.price .main-text, .price .button, ' +
  '.reviews .main-text, .phone-stack, .stack-arrows, ' +
  '.certificates .main-text, .cert-carousel, ' +
  '.contacts .main-text, .contacts .social-medias a, ' +
  '.footer'
).forEach(el => {
  scrollObserver.observe(el);
});
