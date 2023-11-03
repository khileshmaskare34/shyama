

const menuToggle = document.querySelector('#menu-toggle');
const mainNav = document.querySelector('.burgger');

var flag = 0;
menuToggle.addEventListener("click", function() {
  if (flag === 0) {
    mainNav.style.display = "flex";
    flag = 1;
  } else {
    mainNav.style.display = "none";
    flag = 0;
  }
});
