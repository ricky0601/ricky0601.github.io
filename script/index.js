const header = document.querySelector(".navBar");
const dropmenu = document.querySelector(".dropmenus");
const headerHeight = header.getBoundingClientRect().height;
 
window.addEventListener("scroll", () => {
      if (window.scrollY > headerHeight) {
      header.setAttribute("style", "background: #2F0B3A;");
      dropmenu.setAttribute("style", "background: rgba(0,1,22,.85)")
   } else {
      
header.setAttribute("style", "background: transparent;");
dropmenu.setAttribute("style", "background: transparent;");
   }
   
});