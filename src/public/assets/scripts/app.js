
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  if (currentPath.includes('viagem.html')) {
    loadViagens();
  }
});

async function loadViagens() {
  try {
    const res = await fetch("http://localhost:3000/viagens");
    const viagens = await res.json();

    const container = document.getElementById("viagens-container");
    if (!container) return;

    clearChildren(container);

    if (!viagens.length) {
      const emptyDiv = createSafeElement('div', 'text-center text-muted py-5');
      
      const icon = createIcon('bi bi-briefcase', 'font-size: 3rem; color: #d1d5db;');
      emptyDiv.appendChild(icon);
      
      const message = createSafeElement('p', 'mt-3', 'Nenhuma viagem cadastrada');
      emptyDiv.appendChild(message);
      
      container.appendChild(emptyDiv);
      return;
    }

    viagens.forEach(v => container.appendChild(createViagemCard(v)));
  } catch (error) {
    console.error('Erro ao carregar viagens:', error);
  }
}

function createViagemCard({ title, subtitle, footer, buttonText, buttonColor, icon }) {
  const card = document.createElement("div");
  card.className = "viagem-card";

  let colorClass = '';

  if (buttonColor) {
    if (buttonColor === 'lightgreen') {
      colorClass = 'cor-green';
    } else if (buttonColor === 'lightblue') {
      colorClass = 'cor-blue';
    } else if (buttonColor === 'lightsalmon') {
      colorClass = 'cor-orange';
    }
  }

  const titleP = createSafeElement('p', 'card-title', title || '');
  card.appendChild(titleP);

  const subtitleH3 = createSafeElement('h3', 'card-subtitle', subtitle || '');
  card.appendChild(subtitleH3);

  const footerP = createSafeElement('p', 'card-footer');

  if (icon) {
    footerP.appendChild(createIcon(icon));
    footerP.appendChild(document.createTextNode(' '));
  }

  footerP.appendChild(document.createTextNode(footer || ''));
  card.appendChild(footerP);

  const button = createSafeElement('button', 'btn-info');
  
  if (buttonColor) {
    button.style.background = buttonColor;
  }

  if (icon) {
    button.appendChild(createIcon(icon));
    button.appendChild(document.createTextNode(' '));
  }

  button.appendChild(document.createTextNode(buttonText || 'Ação'));
  card.appendChild(button);

  return card;
}


