// Define navigation structure
const navigationConfig = {
    'index.html': [
        { text: 'Home', href: 'index.html' },
        { text: 'Solutions', href: '#solutions' },
        { text: 'Case Studies', href: '#case-studies' },
        { text: 'Our Process', href: '#process' },
        { text: 'Contact', href: '#contact' }
    ],
    'primetower.html': [
        { text: 'Home', href: 'index.html' },
        { text: 'Features', href: '#features' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Demo', href: 'https://primetower.streamlit.app/', target: '_blank' },
        { text: 'Contact', href: '#contact' }
    ],
    'open2search.html': [
        { text: 'Home', href: 'index.html' },
        { text: 'What\'s Included', href: '#what-you-get' },
        { text: 'Portfolio', href: '#projects' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Contact', href: '#contact' }
    ]
};

// Function to render navigation
function renderNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navContainer = document.getElementById('main-nav');
    
    // Clear existing navigation
    navContainer.innerHTML = '';
    
    // Get the appropriate navigation items
    const navItems = navigationConfig[currentPage] || navigationConfig['index.html'];
    
    // Create navigation elements
    navItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.textContent = item.text;
        a.href = item.href;
        if (item.target) a.target = item.target;
        
        // Highlight current page
        if (item.href === currentPage || 
            (currentPage === 'index.html' && item.href === '#home')) {
            a.classList.add('active');
        }
        
        li.appendChild(a);
        navContainer.appendChild(li);
    });
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', renderNavigation);
