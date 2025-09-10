// Function to include HTML templates
function includeHTML() {
    const includeElements = document.querySelectorAll('[data-include]');
    
    includeElements.forEach(element => {
        const file = element.getAttribute('data-include');
        
        fetch(file)
            .then(response => response.text())
            .then(data => {
                element.innerHTML = data;
                
                // Re-initialize any scripts that might be needed
                if (file.includes('header')) {
                    initMobileMenu();
                }
                
                if (file.includes('footer')) {
                    initBackToTop();
                }
            })
            .catch(error => {
                console.error('Error including HTML:', error);
                element.innerHTML = 'Error loading content.';
            });
    });
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('show') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) navMenu.classList.remove('show');
            if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// Initialize back to top functionality
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Header scroll effect and progress bar
function initScrollEffects() {
    const header = document.getElementById('header');
    const scrollProgress = document.querySelector('.scroll-progress');
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        // Header effect
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Scroll progress
        if (scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            scrollProgress.style.width = scrolled + '%';
        }
        
        // Back to top button
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    includeHTML();
    initScrollEffects();
    initSmoothScrolling();
});
