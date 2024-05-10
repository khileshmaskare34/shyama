const menuToggle = document.querySelector("#menu-toggle"),
mainNav = document.querySelector(".burgger");
var flag = 0;
menuToggle.addEventListener("click", function() {
    0 === flag ? (mainNav.style.display = "flex", flag = 1) : (mainNav.style.display = "none", flag = 0)
});