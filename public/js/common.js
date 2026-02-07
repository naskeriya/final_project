// Mobile Burger Menu
const burger = document.querySelector('.header__burger');
const navigation = document.querySelector('.header__nav');

burger.addEventListener('click', (e) => {
    e.stopPropagation();
    navigation.classList.toggle('hidden-on-mobile');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__nav') && !e.target.closest('.header__burger')) {
        document.querySelector('.header__nav').classList.add('hidden-on-mobile');
    }
});

// [DEPENDENCY]: updateNavigation is defined in /public/js/auth-utils.js
updateNavigation();


// Debounce utility (globally available)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
