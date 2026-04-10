document.addEventListener('DOMContentLoaded', function () {
    // Rotating text animation
    const rotatingWords = [
        'systems thinker',
        'visual thinker',
        'sketching advocate',
        'workshop facilitator',
        'trail runner',
        'bread baker'
    ];

    let currentWordIndex = 0;
    const rotatingElement = document.querySelector('.rotating-text');

    function rotateText() {
        if (!rotatingElement) return;

        rotatingElement.style.opacity = '0';

        setTimeout(() => {
            currentWordIndex = (currentWordIndex + 1) % rotatingWords.length;
            rotatingElement.textContent = rotatingWords[currentWordIndex];
            rotatingElement.style.opacity = '1';
        }, 300);
    }

    // Start rotation
    if (rotatingElement) {
        setInterval(rotateText, 10000);
    }

    // Navigation active state
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        let currentSection = '';
        let closestSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const distance = sectionTop - window.scrollY;

            // Find section that is in or near the viewport (but not too far above)
            if (distance < window.innerHeight / 2 && distance > -window.innerHeight) {
                if (Math.abs(distance) < closestDistance) {
                    closestDistance = Math.abs(distance);
                    closestSection = section.getAttribute('id');
                }
            }
        });

        // Fallback to first section that's above current scroll
        if (!closestSection) {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    currentSection = section.getAttribute('id');
                }
            });
        } else {
            currentSection = closestSection;
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Update active state after scroll completes
            setTimeout(updateActiveLink, 100);
        });
    });

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
});
