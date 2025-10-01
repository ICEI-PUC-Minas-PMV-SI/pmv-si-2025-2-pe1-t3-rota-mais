document.addEventListener("DOMContentLoaded", () => {
    setupSidebar();
    addActiveClassInCurrentPage();
  });
  
function setupSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
  
    sidebar.innerHTML = `
        <div class="sidebar-container">
            <div class="sidebar-header">
                <img src="assets/images/logo.png" alt="Logo" class="logo">
            </div>
            
            <div class="community-selector d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2">
                <i style="font-size: 2rem; color: black;" class="bi bi-geo-alt-fill"></i>
                <div class="d-flex flex-column align-items-start gap-2">
                    <span>Comunidade selecionada:</span>
                    <div class="d-flex align-items-center gap-2">
                    <strong style="font-size: 1.2rem;">Taquara</strong>
                    </div>
                </div>
                </div>
                <img style="font-size: 2rem; transform: rotate(180deg);" src="/assets/images/repeat.svg"/>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav-list">
                <li class="nav-item active">
                    <a href="/pages/caronas.html" class="nav-link">
                    <i class="fa fa-car"></i>
                    <span>Caronas</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="/pages/encomendas.html" class="nav-link">
                    <img src="/assets/images/encomendas.svg" alt="Encomendas" class="nav-link-icon" style="max-width: 90%;">
                    <span>Encomendas</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                    <i class="fa fa-users"></i>
                    <span>Comunidade</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                    <i class="fa fa-bars"></i>
                    <span>Minhas viagens</span>
                    </a>
                </li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-profile d-flex">
                    <div class="user-avatar-container">
                        <img src="https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png" class="user-avatar">
                    </div>
                    <div class="user-name-container">
                        <span class="user-name"> João Silva </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setupSidebarNavigation();
}
  
function setupSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href !== "#") {
          window.location.href = href;
        } else {
          e.preventDefault();
        }
  
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        
        link.closest('.nav-item').classList.add('active');
      });
    });
}

function addActiveClassInCurrentPage() {
    const currentPath = window.location.pathname.split("/").pop(); 
  
    const navLinks = document.querySelectorAll(".nav-link");
  
    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
  
      const linkPage = href.split("/").pop(); 
  
      if (currentPath === linkPage) {
        link.closest(".nav-item a").classList.add("active");
      } else {
        link.closest(".nav-item a").classList.remove("active");
      }
    });
}
