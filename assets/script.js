// Global navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // ===== Mobile Menu Toggle =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const nav = document.querySelector('nav ul');
            const isOpen = nav.classList.contains('show');
            nav.classList.toggle('show');
            this.innerHTML = isOpen ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });
    }

    // ===== Close Mobile Menu on Link Click =====
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('nav ul');
            if (nav && nav.classList.contains('show')) {
                nav.classList.remove('show');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
                document.body.style.overflow = '';
            }
        });
    });

    // ===== Header Scroll Effects & Scroll Progress =====
    function handleScroll() {
        const header = document.getElementById('header');
        const scrollY = window.scrollY;

        // Sticky header style
        if (header) header.classList.toggle('scrolled', scrollY > 50);

        // Back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 300);

        // Scroll progress bar
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            scrollProgress.style.width = (winScroll / height) * 100 + "%";
        }
    }
    window.addEventListener('scroll', handleScroll);

    // ===== Back to Top Button =====
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Smooth Scrolling for Anchors =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            // Check if it's an internal page anchor
            const href = this.getAttribute('href');
            if (href.includes('#') && !href.startsWith('#')) {
                // This is a cross-page anchor link, let it navigate normally
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const headerOffset = 100;
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

            // Close mobile menu if open
            const nav = document.querySelector('nav ul');
            if (nav && nav.classList.contains('show')) {
                nav.classList.remove('show');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
                document.body.style.overflow = '';
            }
        });
    });

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark-theme');
            this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            // Save preference to localStorage
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
});
