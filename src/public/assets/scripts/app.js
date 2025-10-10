function getCurrentUser() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) return JSON.parse(savedUser);

  const defaultUser = {
    nome: 'João Silva',
    avatar: 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png',
    email: ''
  };

  localStorage.setItem('currentUser', JSON.stringify(defaultUser));
  return defaultUser;
}

function updateCurrentUser(newUserData) {
  const currentUser = getCurrentUser();
  const updatedUser = { ...currentUser, ...newUserData };
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  return updatedUser;
}

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;


  if (currentPath.includes('caronas.html')) {
    loadCaronas();
    setupFilters();
    setupSearch();
    setupButtons();
  } else if (currentPath.includes('pedir-carona.html')) {
    setupPedirCaronaForm();
  } else if (currentPath.includes('oferecer-carona.html')) {
    setupOferecerCaronaForm();
  } else if (currentPath.includes('editar-pedido-carona.html')) {
    setupEditarPedidoForm();
  } else if (currentPath.includes('editar-oferta-carona.html')) {
    setupEditarOfertaForm();
  } else {
    loadViagens();
  }
});

async function loadCaronas() {
  try {
    const res = await fetch("http://localhost:3000/caronas");
    const caronas = await res.json();

    const container = document.getElementById("caronas-container");
    if (!container) return;

    container.innerHTML = "";

    if (!caronas.length) {
      container.innerHTML = `
        <div class="text-center text-muted py-5">
          <i class="bi bi-car-front" style="font-size: 3rem; color: #d1d5db;"></i>
          <p class="mt-3">Nenhuma carona disponível no momento</p>
        </div>`;
      return;
    }

    caronas.forEach(carona => {
      const card = createCaronaCard(carona);
      if (card) container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar caronas:", err);
    const container = document.getElementById("caronas-container");
    if (container) {
      container.innerHTML = '<div class="text-center text-danger py-5"><i class="bi bi-exclamation-triangle" style="font-size: 3rem;"></i><p class="mt-3">Erro ao carregar caronas</p></div>';
    }
  }
}

function createCaronaCard(carona) {
  if (!carona || !carona.rota || !carona.rota.origem || !carona.rota.destino) {
    console.warn('Carona com dados incompletos:', carona);
    return null;
  }

  const card = document.createElement("div");
  card.className = "carona-card p-4 rounded relative position-relative";

  const isOferecendo = carona.tipo === 'oferecendo';
  const acaoTexto = isOferecendo ? ' <strong>está oferecendo uma carona</strong>' : ' <strong>está pedindo uma carona</strong>';
  const rotaTexto = carona.subtitle
    ? carona.subtitle 
    : `De <strong>${carona.rota.origem}</strong> para <strong>${carona.rota.destino}</strong>`;
  const rotaClass = isOferecendo ? 'oferecendo' : 'pedindo';

  let detailsHTML = `
    <div class="d-flex align-items-center gap-2">
      <i class="bi bi-calendar3"></i>
      <span>Dia ${carona.data || ''} ${carona.horario ? 'às ' + carona.horario : ''}</span>
    </div>`;

  if (carona.veiculo) {
    const veiculoIcon = carona.veiculo === 'moto' ? 'fa fa-motorcycle' : 'fa fa-car';
    detailsHTML += `
      <div class="d-flex align-items-center gap-2">
        <i class="${veiculoIcon}"></i>
        <span>Veículo: ${carona.veiculo}</span>
      </div>`;
  }

  if (carona.vagas) {
    detailsHTML += `
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-person"></i>
        <span>${carona.vagas} vaga${carona.vagas > 1 ? 's' : ''}</span>
      </div>`;
  }

  if (carona.incluiRetorno) {
    detailsHTML += `
      <div class="carona-detail">
        <i class="bi bi-arrow-repeat"></i>
        <span>Inclui retorno</span>
      </div>`;
  }

  if (carona.podeTrazerEncomendas) {
    detailsHTML += `
      <div class="carona-detail">
        <i class="bi bi-box"></i>
        <span>Pode trazer encomendas</span>
      </div>`;
  }

  const buttonHTML = isOferecendo
    ? `<button class="btn-participar d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3" onclick="participarViagem(${carona.id})">
         <i class="bi bi-check-circle"></i> Participar da viagem
       </button>`
    : `<button class="btn-oferecer d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3" onclick="oferecerCarona(${carona.id})">
         <i class="bi bi-car-front"></i> Oferecer carona
       </button>`;

  card.innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-4">
      <img src="${(carona.usuario && carona.usuario.avatar) || getCurrentUser().avatar}" alt="${(carona.usuario && carona.usuario.nome) || 'Usuário'}" class="user-avatar-card">
      <span class="carona-user">${(carona.usuario && carona.usuario.nome) || 'Usuário'} ${acaoTexto}</span>
    </div>

    <div class="carona-rota d-flex align-items-center gap-2 mb-4 ${rotaClass}">
      <h2>${rotaTexto}</h2>
    </div>

    <div class="carona-details d-flex flex-wrap gap-2 mb-4">
      ${detailsHTML}
    </div>

    ${carona.custo ? `<div class="carona-custo">${carona.custo}</div>` : ''}

    <div class="d-flex justify-content-end">
      ${buttonHTML}
    </div>
  `;
  return card;
}

function setupFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  if (!filterTabs) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter || 'todos';
      filterCaronas(filter);
    });
  });
}

async function filterCaronas(filter) {
  try {
    const res = await fetch("http://localhost:3000/caronas");
    const caronas = await res.json();

    let filteredCaronas = caronas;
    if (filter && filter !== 'todos') {
      filteredCaronas = caronas.filter(carona => carona.tipo === filter);
    }

    const container = document.getElementById("caronas-container");
    if (!container) return;
    container.innerHTML = "";

    if (filteredCaronas.length === 0) {
      const message = filter === 'todos'
        ? 'Nenhuma carona disponível no momento'
        : filter === 'oferecendo'
          ? 'Nenhuma oferta de carona disponível'
          : 'Nenhum pedido de carona disponível';

      container.innerHTML = `<div class="text-center text-muted py-5"><i class="bi bi-car-front" style="font-size: 3rem; color: #d1d5db;"></i><p class="mt-3">${message}</p></div>`;
      return;
    }

    filteredCaronas.forEach(carona => container.appendChild(createCaronaCard(carona)));
  } catch (err) {
    console.error("Erro ao filtrar caronas:", err);
  }
}

function setupSearch() {
  const btnBuscar = document.getElementById('btn-buscar');
  if (!btnBuscar) return;

  btnBuscar.addEventListener('click', () => {
    const origem = document.getElementById('origem') ? document.getElementById('origem').value : '';
    const destino = document.getElementById('destino') ? document.getElementById('destino').value : '';
    const data = document.getElementById('data') ? document.getElementById('data').value : '';
    searchCaronas(origem, destino, data);
  });
}

async function searchCaronas(origem, destino, data) {
  try {
    const res = await fetch("http://localhost:3000/caronas");
    const caronas = await res.json();

    let filtered = caronas;

    if (origem) {
      filtered = filtered.filter(c => c.rota && c.rota.origem && c.rota.origem.toLowerCase().includes(origem.toLowerCase()));
    }
    if (destino) {
      filtered = filtered.filter(c => c.rota && c.rota.destino && c.rota.destino.toLowerCase().includes(destino.toLowerCase()));
    }
    if (data) {
      const searchDate = new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      filtered = filtered.filter(c => c.data === searchDate);
    }

    const container = document.getElementById("caronas-container");
    if (!container) return;
    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-5"><i class="bi bi-search" style="font-size: 3rem; color: #d1d5db;"></i><p class="mt-3">Nenhuma carona encontrada com os critérios de busca</p></div>';
    } else {
      filtered.forEach(carona => container.appendChild(createCaronaCard(carona)));
    }
  } catch (err) {
    console.error("Erro ao buscar caronas:", err);
  }
}

function setupButtons() {
  const btnPedir = document.getElementById('btn-pedir-carona');
  const btnOferecer = document.getElementById('btn-oferecer-carona');
  if (btnPedir) btnPedir.addEventListener('click', () => { window.location.href = 'pedir-carona.html'; });
  if (btnOferecer) btnOferecer.addEventListener('click', () => { window.location.href = 'oferecer-carona.html'; });
}

async function participarViagem(caronaId) {

  const pedidoNome = await getNomeCarona(caronaId);

  Swal.fire({
    title: 'Participar da Viagem',
    text: `Deseja participar da viagem de ${pedidoNome}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, participar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({ title: 'Sucesso!', text: 'Você foi adicionado à viagem.', icon: 'success' });
    }
  });
}

async function oferecerCarona(caronaId) {
  try {
    const res = await fetch(`http://localhost:3000/caronas/${caronaId}`);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

    const pedidoNome = await getNomeCarona(caronaId);

    Swal.fire({
      title: 'Oferecer Carona',
      text: `Deseja oferecer carona para ${pedidoNome}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, oferecer',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sucesso!', `Sua oferta foi enviada para ${pedidoNome}.`, 'success');
      }
    });
  } catch (err) {
    console.error('Erro ao oferecer carona:', err);
    Swal.fire('Erro', 'Não foi possível carregar os dados da carona.', 'error');
  }
}

function setupPedirCaronaForm() {
  const form = document.getElementById('form-pedir-carona');
  if (!form) return;

  const precisaRetorno = document.getElementById('precisa-retorno');
  const naoPrecisaRetorno = document.getElementById('nao-precisa-retorno');
  const retornoFields = document.getElementById('retorno-fields');

  function toggleRetornoFields() {
    if (precisaRetorno && precisaRetorno.checked) {
      retornoFields.style.display = 'block';
    } else if (retornoFields) {
      retornoFields.style.display = 'none';
    }
  }

  if (precisaRetorno && naoPrecisaRetorno) {
    precisaRetorno.addEventListener('change', toggleRetornoFields);
    naoPrecisaRetorno.addEventListener('change', toggleRetornoFields);
    toggleRetornoFields();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const currentUser = getCurrentUser();

    const data = {
      tipo: 'pedindo',
      usuario: currentUser,
      rota: {
        origem: formData.get('origem'),
        destino: formData.get('destino')
      },
      data: formData.get('data'),
      horario: formData.get('horario'),
      precisaRetorno: formData.get('precisa-retorno') === 'sim',
      dataRetorno: formData.get('data-retorno'),
      horarioRetorno: formData.get('horario-retorno'),
      tipoCarona: formData.get('tipo-carona') || 'comum'
    };

    try {
      // opcional: efeito de loading (simulado)
      await new Promise(resolve => setTimeout(resolve, 700));

      await saveCaronaToDatabase(data);

      Swal.fire({
        title: 'Sucesso!',
        text: 'Seu pedido de carona foi criado com sucesso.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'caronas.html';
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao criar o pedido de carona.', icon: 'error' });
    }
  });
}

function setupOferecerCaronaForm() {
  const form = document.getElementById('form-oferecer-carona');
  if (!form) return;

  const incluirRetorno = document.getElementById('incluir-retorno');
  const naoIncluirRetorno = document.getElementById('nao-incluir-retorno');
  const retornoFields = document.getElementById('retorno-fields');

  function toggleRetornoFields() {
    if (incluirRetorno && incluirRetorno.checked) {
      retornoFields.style.display = 'block';
    } else if (retornoFields) {
      retornoFields.style.display = 'none';
    }
  }

  if (incluirRetorno && naoIncluirRetorno) {
    incluirRetorno.addEventListener('change', toggleRetornoFields);
    naoIncluirRetorno.addEventListener('change', toggleRetornoFields);
    toggleRetornoFields();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const currentUser = getCurrentUser();

    const data = {
      tipo: 'oferecendo',
      usuario: currentUser,
      rota: {
        origem: formData.get('origem'),
        destino: formData.get('destino')
      },
      data: formData.get('data'),
      horario: formData.get('horario'),
      veiculo: formData.get('veiculo'),
      vagas: parseInt(formData.get('vagas')) || 1,
      custo: getCustoText(formData.get('custo'), formData.get('valor-fixo')),
      podeTrazerEncomendas: formData.get('pode-encomendas') === 'sim',
      incluiRetorno: formData.get('incluir-retorno') === 'sim',
      dataRetorno: formData.get('data-retorno'),
      horarioRetorno: formData.get('horario-retorno')
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      await saveCaronaToDatabase(data);

      Swal.fire({
        title: 'Sucesso!',
        text: 'Sua oferta de carona foi criada com sucesso.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'caronas.html';
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao criar a oferta de carona.', icon: 'error' });
    }
  });
}

function increaseVagas() {
  const vagasInput = document.getElementById('vagas');
  if (!vagasInput) return;
  const currentValue = parseInt(vagasInput.value || '1');
  if (currentValue < 4) vagasInput.value = currentValue + 1;
}

function decreaseVagas() {
  const vagasInput = document.getElementById('vagas');
  if (!vagasInput) return;
  const currentValue = parseInt(vagasInput.value || '1');
  if (currentValue > 1) vagasInput.value = currentValue - 1;
}

function setupEditarPedidoForm() {
  const form = document.getElementById('form-editar-pedido');
  const btnExcluir = document.getElementById('btn-excluir');
  if (!form) return;

  loadPedidoData();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const caronaId = formData.get('carona-id');

    const data = {
      tipo: 'pedindo',
      usuario: getCurrentUser(),
      rota: {
        origem: formData.get('origem'),
        destino: formData.get('destino')
      },
      data: formData.get('data'),
      horario: formData.get('horario'),
      tipoCarona: formData.get('tipo-carona'),
      precisaRetorno: formData.get('precisa-retorno') === 'sim',
      dataRetorno: formData.get('data-retorno'),
      horarioRetorno: formData.get('horario-retorno')
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      Swal.fire({ title: 'Sucesso!', text: 'Seu pedido de carona foi atualizado com sucesso.', icon: 'success' })
        .then(() => { window.location.href = 'caronas.html'; });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao atualizar o pedido de carona.', icon: 'error' });
    }
  });

  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      Swal.fire({
        title: 'Excluir Pedido',
        text: 'Tem certeza que deseja excluir este pedido de carona?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const formData = new FormData(form);
            const caronaId = formData.get('carona-id');
            const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            Swal.fire({ title: 'Excluído!', text: 'Seu pedido de carona foi excluído com sucesso.', icon: 'success' })
              .then(() => { window.location.href = 'caronas.html'; });
          } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao excluir o pedido de carona.', icon: 'error' });
          }
        }
      });
    });
  }
}

function setupEditarOfertaForm() {
  const form = document.getElementById('form-editar-oferta');
  const btnExcluir = document.getElementById('btn-excluir');
  if (!form) return;

  loadOfertaData();

  const custoSelect = document.getElementById('custo');
  const valorFixoContainer = document.getElementById('valor-fixo-container');
  if (custoSelect && valorFixoContainer) {
    custoSelect.addEventListener('change', () => {
      if (custoSelect.value === 'fixo') {
        valorFixoContainer.style.display = 'block';
      } else {
        valorFixoContainer.style.display = 'none';
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const caronaId = formData.get('carona-id');

    const data = {
      tipo: 'oferecendo',
      usuario: getCurrentUser(),
      rota: {
        origem: formData.get('origem'),
        destino: formData.get('destino')
      },
      data: formData.get('data'),
      horario: formData.get('horario'),
      veiculo: formData.get('veiculo'),
      vagas: parseInt(formData.get('vagas')) || 1,
      custo: getCustoText(formData.get('custo'), formData.get('valor-fixo')),
      podeTrazerEncomendas: formData.get('pode-encomendas') === 'sim',
      incluiRetorno: formData.get('incluir-retorno') === 'sim',
      dataRetorno: formData.get('data-retorno'),
      horarioRetorno: formData.get('horario-retorno')
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      Swal.fire({ title: 'Sucesso!', text: 'Sua oferta de carona foi atualizada com sucesso.', icon: 'success' })
        .then(() => { window.location.href = 'caronas.html'; });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao atualizar a oferta de carona.', icon: 'error' });
    }
  });

  if (btnExcluir) {
    btnExcluir.addEventListener('click', () => {
      Swal.fire({
        title: 'Excluir Oferta',
        text: 'Tem certeza que deseja excluir esta oferta de carona?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc2626'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const formData = new FormData(form);
            const caronaId = formData.get('carona-id');
            const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            Swal.fire({ title: 'Excluído!', text: 'Sua oferta de carona foi excluída com sucesso.', icon: 'success' })
              .then(() => { window.location.href = 'caronas.html'; });
          } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao excluir a oferta de carona.', icon: 'error' });
          }
        }
      });
    });
  }
}

function getCustoText(tipo, valor) {
  switch (tipo) {
    case 'gratuita':
      return 'Viagem gratuita';
    case 'divisao':
      return 'Com divisão de custos';
    case 'fixo':
      return `R$ ${valor} por pessoa`;
    default:
      return '';
  }
}

async function saveCaronaToDatabase(caronaData) {
  try {
    if (caronaData.rota && caronaData.rota.origem && caronaData.rota.destino) {
      const origem = caronaData.rota.origem;
      const destino = caronaData.rota.destino;
      caronaData.subtitle = `De <strong>${origem}</strong> para <strong>${destino}</strong>`;
    }

    if (!caronaData.usuario) {
      caronaData.usuario = getCurrentUser();
    }

    if (!caronaData.id) {
      caronaData.id = Date.now();
    }

    const response = await fetch('http://localhost:3000/caronas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caronaData)
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const saved = await response.json();
    console.log('Carona salva com sucesso:', saved);
    return saved;
  } catch (error) {
    console.error('Erro ao salvar carona:', error);
    throw error;
  }
}

async function loadViagens() {
  try {
    const res = await fetch("http://localhost:3000/viagens");
    const viagens = await res.json();

    const container = document.getElementById("viagens-container");
    if (!container) return;

    container.innerHTML = "";

    if (!viagens.length) {
      container.innerHTML = `<div class="text-center text-muted py-5"><i class="bi bi-briefcase" style="font-size: 3rem; color: #d1d5db;"></i><p class="mt-3">Nenhuma viagem cadastrada</p></div>`;
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

  card.innerHTML = `
    <p class="card-title">${title || ''}</p>
    <h3 class="card-subtitle">${subtitle || ''}</h3>
    <p class="card-footer">${icon ? `<i class="${icon}"></i>` : ''} ${footer || ''}</p>
    <button class="btn-info" style="${buttonColor ? 'background:' + buttonColor + ';' : ''}">
      ${icon ? `<i class="${icon}"></i>` : ''} ${buttonText || 'Ação'}
    </button>
  `;

  return card;
}


async function loadPedidoData() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');
    if (!caronaId) {
      console.error('ID da carona não fornecido');
      return;
    }

    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const pedidoData = await response.json();

    // Preenche campos se existirem
    const el = id => document.getElementById(id);
    if (el('carona-id')) el('carona-id').value = pedidoData.id;
    if (el('origem')) el('origem').value = pedidoData.rota?.origem || '';
    if (el('destino')) el('destino').value = pedidoData.rota?.destino || '';
    if (el('data')) el('data').value = pedidoData.data || '';
    if (el('horario')) el('horario').value = pedidoData.horario || '';

    if (pedidoData.precisaRetorno) {
      if (el('precisa-retorno')) el('precisa-retorno').checked = true;
      if (el('data-retorno')) el('data-retorno').value = pedidoData.dataRetorno || '';
      if (el('horario-retorno')) el('horario-retorno').value = pedidoData.horarioRetorno || '';
    } else {
      if (el('nao-precisa-retorno')) el('nao-precisa-retorno').checked = true;
    }

    if (pedidoData.tipoCarona === 'emergencial') {
      if (el('carona-emergencial')) el('carona-emergencial').checked = true;
    } else {
      if (el('carona-comum')) el('carona-comum').checked = true;
    }
  } catch (error) {
    console.error('Erro ao carregar dados do pedido:', error);
  }
}

async function loadOfertaData() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const caronaId = urlParams.get('id');
    if (!caronaId) {
      console.error('ID da carona não fornecido');
      return;
    }

    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const ofertaData = await response.json();

    const el = id => document.getElementById(id);
    if (el('carona-id')) el('carona-id').value = ofertaData.id;
    if (el('origem')) el('origem').value = ofertaData.rota?.origem || '';
    if (el('destino')) el('destino').value = ofertaData.rota?.destino || '';
    if (el('data')) el('data').value = ofertaData.data || '';
    if (el('horario')) el('horario').value = ofertaData.horario || '';
    if (el('veiculo')) el('veiculo').value = ofertaData.veiculo || '';
    if (el('vagas')) el('vagas').value = ofertaData.vagas || 1;

    if (ofertaData.custo && el('custo')) {
      if (ofertaData.custo === 'Viagem gratuita' && el('custo-gratuito')) el('custo-gratuito').checked = true;
      else if (el('custo-divisao')) el('custo-divisao').checked = true;
    }

    if (ofertaData.podeTrazerEncomendas) {
      if (el('pode-encomendas-sim')) el('pode-encomendas-sim').checked = true;
    } else {
      if (el('pode-encomendas-nao')) el('pode-encomendas-nao').checked = true;
    }

    if (ofertaData.incluiRetorno) {
      if (el('incluir-retorno')) el('incluir-retorno').checked = true;
      if (el('data-retorno')) el('data-retorno').value = ofertaData.dataRetorno || '';
      if (el('horario-retorno')) el('horario-retorno').value = ofertaData.horarioRetorno || '';
    } else {
      if (el('nao-incluir-retorno')) el('nao-incluir-retorno').checked = true;
    }
  } catch (error) {
    console.error('Erro ao carregar dados da oferta:', error);
  }
}

async function getNomeCarona(caronaId) {
  const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
  if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
  const carona = await response.json();
  return carona.usuario.nome;
}
