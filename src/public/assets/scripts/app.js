document.addEventListener("DOMContentLoaded", () => {
  loadViagens();
});

async function loadViagens() {
  try {
    const res = await fetch("http://localhost:3000/viagens");
    const viagens = await res.json();

    const container = document.getElementById("viagens-container");
    container.innerHTML = ""; 

    viagens.forEach(v => {
      container.appendChild(createViagemCard(v));
    });
  } catch (err) {
    console.error("Erro ao carregar viagens:", err);
  }
}

function createViagemCard({ title, subtitle, footer, buttonText, buttonColor, icon }) {
  const card = document.createElement("div");
  let colorClass = '';
  if (buttonColor === 'lightgreen') {
    colorClass = 'cor-green';
  } else if (buttonColor === 'lightblue') {
    colorClass = 'cor-blue';
  } else if (buttonColor === 'lightsalmon') {
    colorClass = 'cor-orange';
  }

  card.className = viagem-card ${colorClass};

  card.innerHTML = `
    <p class="card-title">${title}</p>
    <h3 class="card-subtitle">${subtitle}</h3>
    <p class="card-footer"><i class="${icon}"></i> ${footer}</p>
    <button class="btn-info">
      <i class="${icon}"></i> ${buttonText}
    </button>
  `;

  return card;
}
