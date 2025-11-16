async function fetchJSON(path, options = {}) {
  const res = await fetch(API_BASE + path, options);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return await res.json();
}

function checkAuth() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    window.location.href = "../../autenticacao/login.html";
    return false;
  }
  return true;
}

$(document).ready(async function () {
  if (!checkAuth()) return;

  const currentUserId = Number(localStorage.getItem("userId"));

  try {
    const user = await fetchJSON(`/users/${currentUserId}`);

    $(".user-avatar img").attr("src", user.avatar || "https://placehold.co/100x100").css("width", "100px").css("height", "100px");

    $(".user-name h1").text(user.name || "Usuário");

    const username = user.username || `${(user.name || "usuario").toLowerCase().replace(/\s+/g, "")}`;
    $(".user-id p").text('@' + username);

    const caronas = await fetchJSON("/caronas");
    const userCaronas = caronas.filter(c =>
      (c.motoristaId === currentUserId && c.tipo === "oferecendo") ||
      (c.passageiros && c.passageiros.some(p => p.userId === currentUserId && p.status === "aprovado"))
    );
    const viagensRealizadas = userCaronas.length;

    const rating = user.rating || 5.0;

    $(".user-stats-item-value").html(`
      <div>
        <i class="bi bi-car-front"></i>
        <span><strong>${viagensRealizadas} viagem${viagensRealizadas !== 1 ? 'ens' : ''} realizada${viagensRealizadas !== 1 ? 's' : ''}</strong></span>
      </div>
      <div>
        <i class="bi bi-star-fill"></i>
        <span><strong>${rating} de avaliação média</strong></span>
      </div>
    `);

    let localizacaoTexto = "Não informado";
    if (user.endereco) {
      const partes = [];
      if (user.endereco.comunidade) partes.push(user.endereco.comunidade);
      if (user.endereco.cidade) partes.push(user.endereco.cidade);
      if (partes.length > 0) {
        localizacaoTexto = partes.join(" • ");
      }
    } else if (user.localizacao) {
      localizacaoTexto = user.localizacao;
    }
    $(".user-info").find("h4").first().text(localizacaoTexto);

    if (user.biografia) {
      $(".user-info").find("h4").last().text(user.biografia);
    } else {
      $(".user-info").find("h4").last().text("Nenhuma biografia cadastrada.");
    }

    await carregarVeiculos(currentUserId);

  } catch (e) {
    console.error("Erro ao carregar dados do usuário:", e);
    Swal.fire("Erro", "Falha ao carregar dados do usuário.", "error");
  }
});

async function carregarVeiculos(userId) {
  const $container = $(".veiculos-container");

  try {
    const veiculos = await fetchJSON(`/vehicles?motoristaId=${userId}`);

    $container.empty();

    if (veiculos.length === 0) {
      $container.html('<p class="text-muted">Nenhum veículo cadastrado.</p>');
      return;
    }

    veiculos.forEach(veiculo => {
      const tipoVeiculo = veiculo.type === 'CAR' ? 'Carro' : 'Motocicleta';
      const $item = $(`
        <div class="veiculo-item mb-3 p-3 border rounded">
          <div class="veiculo-item-info">
            <h3 class="mb-2">${veiculo.brand} ${veiculo.model}</h3>
            <div class="d-flex flex-wrap gap-3 text-muted">
              <span><i class="bi bi-tag"></i> ${tipoVeiculo}</span>
              <span><i class="bi bi-palette"></i> ${veiculo.color || 'Não informado'}</span>
              <span><i class="bi bi-123"></i> ${veiculo.licensePlate || 'Não informado'}</span>
              <span><i class="bi bi-people"></i> ${veiculo.availableSeats || 0} vaga${veiculo.availableSeats !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      `);

      $container.append($item);
    });

  } catch (e) {
    console.error("Erro ao carregar veículos:", e);
    $container.html('<p class="text-danger">Erro ao carregar veículos.</p>');
  }
}

