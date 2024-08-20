const slider = document.querySelector('.slider');
const ul = slider.querySelector('ul');
const prevButton = slider.querySelector('.prev');
const nextButton = slider.querySelector('.next');

let currentSlide = 0;

function showSlide(index) {
    ul.style.left = -index * (366 + 50) + 'px';
    currentSlide = index;
}

showSlide(0);

prevButton.addEventListener('click', function() {
    if (currentSlide === 0) {
        currentSlide = ul.children.length - 3;
    } else {
        currentSlide--;
    }
    showSlide(currentSlide);
});

nextButton.addEventListener('click', function() {
    if (currentSlide === ul.children.length - 3) {
        currentSlide = 0;
    } else {
        currentSlide++;
    }
    showSlide(currentSlide);
});
