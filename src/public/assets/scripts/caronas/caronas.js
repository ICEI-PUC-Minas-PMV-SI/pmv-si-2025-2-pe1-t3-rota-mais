function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createSafeElement(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function createIcon(iconClass, style = '') {
  const icon = document.createElement('i');
  icon.className = iconClass;
  if (style) icon.style.cssText = style;
  return icon;
}

const clearChildren = (container) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

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

async function loadCaronas() {
  try {
    const res = await fetch("http://localhost:3000/caronas");
    const caronas = await res.json();
    const container = document.getElementById("caronas-container");
    if (!container) return;

    clearChildren(container);

    if (!caronas.length) {
      const emptyDiv = createSafeElement('div', 'text-center text-muted py-5');
      emptyDiv.appendChild(createIcon('bi bi-car-front', 'font-size: 3rem; color: #d1d5db;'));
      emptyDiv.appendChild(createSafeElement('p', 'mt-3', 'Nenhuma carona disponível no momento'));
      container.appendChild(emptyDiv);
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
      const errorDiv = createSafeElement('div', 'text-center text-danger py-5');
      errorDiv.appendChild(createIcon('bi bi-exclamation-triangle', 'font-size: 3rem;'));
      errorDiv.appendChild(createSafeElement('p', 'mt-3', 'Erro ao carregar caronas'));
      container.appendChild(errorDiv);
    }
  }
}

function createCaronaCard(carona) {
  if (!carona || !carona.rota || !carona.rota.origem || !carona.rota.destino) return null;

  const card = document.createElement("div");
  card.className = "carona-card p-4 rounded relative position-relative";

  const isOferecendo = carona.tipo === 'oferecendo';
  const acaoTexto = isOferecendo ? ' está oferecendo uma carona' : ' está pedindo uma carona';
  const rotaClass = isOferecendo ? 'oferecendo' : 'pedindo';

  const mainContainer = createSafeElement('div');
  
  const userHeader = createSafeElement('div', 'd-flex align-items-center gap-2 mb-4');
  const userImg = document.createElement('img');
  userImg.src = (carona.usuario && carona.usuario.avatar) || getCurrentUser().avatar;
  userImg.alt = (carona.usuario && carona.usuario.nome) || 'Usuário';
  userImg.className = 'user-avatar-card';
  userHeader.appendChild(userImg);
  
  const userName = createSafeElement('span', 'carona-user');
  userName.textContent = ((carona.usuario && carona.usuario.nome) || 'Usuário') + acaoTexto;
  userHeader.appendChild(userName);
  mainContainer.appendChild(userHeader);

  const rotaDiv = createSafeElement('div', `carona-rota d-flex align-items-center gap-2 mb-4 ${rotaClass}`);
  const rotaTitle = createSafeElement('h2');
  
  if (carona.subtitle) {
    rotaTitle.textContent = carona.subtitle;
  } else {
    rotaTitle.appendChild(document.createTextNode('De '));
    const origemStrong = document.createElement('strong');
    origemStrong.textContent = carona.rota.origem;
    rotaTitle.appendChild(origemStrong);
    rotaTitle.appendChild(document.createTextNode(' para '));
    const destinoStrong = document.createElement('strong');
    destinoStrong.textContent = carona.rota.destino;
    rotaTitle.appendChild(destinoStrong);
  }
  
  rotaDiv.appendChild(rotaTitle);
  mainContainer.appendChild(rotaDiv);

  const detailsDiv = createSafeElement('div', 'carona-details d-flex flex-wrap gap-2 mb-4');
  
  const dataDiv = createSafeElement('div', 'd-flex align-items-center gap-2');
  dataDiv.appendChild(createIcon('bi bi-calendar3'));
  dataDiv.appendChild(createSafeElement('span', '', `Dia ${carona.data || ''} ${carona.horario ? 'às ' + carona.horario : ''}`));
  detailsDiv.appendChild(dataDiv);

  if (carona.veiculo) {
    const veiculoDiv = createSafeElement('div', 'd-flex align-items-center gap-2');
    const veiculoIcon = carona.veiculo === 'moto' ? 'fa fa-motorcycle' : 'fa fa-car';
    veiculoDiv.appendChild(createIcon(veiculoIcon));
    veiculoDiv.appendChild(createSafeElement('span', '', `Veículo: ${carona.veiculo}`));
    detailsDiv.appendChild(veiculoDiv);
  }

  if (carona.vagas) {
    const vagasDiv = createSafeElement('div', 'd-flex align-items-center gap-2');
    vagasDiv.appendChild(createIcon('bi bi-person'));
    vagasDiv.appendChild(createSafeElement('span', '', `${carona.vagas} vaga${carona.vagas > 1 ? 's' : ''}`));
    detailsDiv.appendChild(vagasDiv);
  }

  if (carona.incluiRetorno) {
    const retornoDiv = createSafeElement('div', 'carona-detail');
    retornoDiv.appendChild(createIcon('bi bi-arrow-repeat'));
    retornoDiv.appendChild(createSafeElement('span', '', 'Inclui retorno'));
    detailsDiv.appendChild(retornoDiv);
  }

  if (carona.podeTrazerEncomendas) {
    const encomendasDiv = createSafeElement('div', 'carona-detail');
    encomendasDiv.appendChild(createIcon('bi bi-box'));
    encomendasDiv.appendChild(createSafeElement('span', '', 'Pode trazer encomendas'));
    detailsDiv.appendChild(encomendasDiv);
  }

  mainContainer.appendChild(detailsDiv);

  if (carona.custo) {
    const custoDiv = createSafeElement('div', 'carona-custo');
    custoDiv.textContent = carona.custo;
    mainContainer.appendChild(custoDiv);
  }

  const buttonContainer = createSafeElement('div', 'd-flex justify-content-end gap-2');
  
  const editButton = createSafeElement('button', 'btn btn-success d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3');

  const detailsButton = createSafeElement('button', 'btn btn-secondary d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3');
  detailsButton.appendChild(createIcon('bi bi-info-circle'));
  detailsButton.onclick = () => window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}`;
  detailsButton.appendChild(createSafeElement('span', '', 'Detalhes'));
  buttonContainer.appendChild(detailsButton);

  editButton.appendChild(createIcon('bi bi-pencil'));
  editButton.appendChild(createSafeElement('span', '', 'Editar'));
  editButton.onclick = () => editarCarona(carona.id, carona.tipo);
  buttonContainer.appendChild(editButton);
  
  const button = createSafeElement('button', isOferecendo ? 'btn-participar d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3' : 'btn-oferecer d-flex align-items-center gap-2 rounded-3 pointer border-0 p-3');
  
  if (isOferecendo) {
    button.appendChild(createIcon('bi bi-check-circle'));
    button.appendChild(createSafeElement('span', '', ' Participar da viagem'));
    button.onclick = () => participarViagem(carona.id);
  } else {
    button.appendChild(createIcon('bi bi-car-front'));
    button.appendChild(createSafeElement('span', '', ' Oferecer carona'));
    button.onclick = () => oferecerCarona(carona.id);
  }
  
  buttonContainer.appendChild(button);
  mainContainer.appendChild(buttonContainer);

  card.appendChild(mainContainer);
  return card;
}

function editarCarona(caronaId, tipo) {
  const url = `editar-carona.html?id=${caronaId}&tipo=${tipo}`;
  window.location.href = url;
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
    const container = document.getElementById("caronas-container");
    if (!container) return;

    let filteredCaronas = caronas;
    if (filter && filter !== 'todos') {
      filteredCaronas = caronas.filter(carona => carona.tipo === filter);
    }

    clearChildren(container);

    if (filteredCaronas.length === 0) {
      const message = filter === 'todos'
        ? 'Nenhuma carona disponível no momento'
        : filter === 'oferecendo'
          ? 'Nenhuma oferta de carona disponível'
          : 'Nenhum pedido de carona disponível';

      const emptyDiv = createSafeElement('div', 'text-center text-muted py-5');
      emptyDiv.appendChild(createIcon('bi bi-car-front', 'font-size: 3rem; color: #d1d5db;'));
      emptyDiv.appendChild(createSafeElement('p', 'mt-3', message));
      container.appendChild(emptyDiv);
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
    const container = document.getElementById("caronas-container");
    if (!container) return;

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

    clearChildren(container);

    if (filtered.length === 0) {
      const emptyDiv = createSafeElement('div', 'text-center text-muted py-5');
      emptyDiv.appendChild(createIcon('bi bi-search', 'font-size: 3rem; color: #d1d5db;'));
      emptyDiv.appendChild(createSafeElement('p', 'mt-3', 'Nenhuma carona encontrada com os critérios de busca'));
      container.appendChild(emptyDiv);
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

async function getNomeCarona(caronaId) {
  const response = await fetch(`http://localhost:3000/caronas/${caronaId}`);
  if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
  const carona = await response.json();
  return carona.usuario.nome;
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
      await saveCaronaToDatabase(data);

      Swal.fire({
        title: 'Sucesso!',
        text: 'Seu pedido de carona foi criado com sucesso.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'caronas/index.html';
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
      await saveCaronaToDatabase(data);

      Swal.fire({
        title: 'Sucesso!',
        text: 'Sua oferta de carona foi criada com sucesso.',
        icon: 'success'
      }).then(() => {
        window.location.href = 'caronas/index.html';
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Erro!', text: 'Ocorreu um erro ao criar a oferta de carona.', icon: 'error' });
    }
  });
}

function getCustoText(tipo, valor) {
  switch (tipo) {
    case 'gratuito':
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
      caronaData.subtitle = `De ${origem} para ${destino}`;
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

    return await response.json();
  } catch (error) {
    console.error('Erro ao salvar carona:', error);
    throw error;
  }
}

function initializeEditCarona() {
  if (!document.getElementById('page-title')) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const tipo = urlParams.get('tipo'); 
  const id = urlParams.get('id'); 
  
  if (tipo === 'pedindo') {
    showPedidoForm();
    loadPedidoData(id);
  } else if (tipo === 'oferecendo') {
    showOfertaForm();
    loadOfertaData(id);
  } else {
    detectCaronaType(id);
  }
  
  setupFormHandlers();
}

function showPedidoForm() {
  const loadingMessage = document.getElementById('loading-message');
  const pedidoContainer = document.getElementById('form-pedido-container');
  const ofertaContainer = document.getElementById('form-oferta-container');
  const pageTitle = document.getElementById('page-title');
  
  if (loadingMessage) loadingMessage.style.display = 'none';
  if (pedidoContainer) pedidoContainer.style.display = 'block';
  if (ofertaContainer) ofertaContainer.style.display = 'none';
  if (pageTitle) pageTitle.innerHTML = '<strong>Editar Pedido de Carona</strong>';
}

function showOfertaForm() {
  const loadingMessage = document.getElementById('loading-message');
  const pedidoContainer = document.getElementById('form-pedido-container');
  const ofertaContainer = document.getElementById('form-oferta-container');
  const pageTitle = document.getElementById('page-title');
  
  if (loadingMessage) loadingMessage.style.display = 'none';
  if (pedidoContainer) pedidoContainer.style.display = 'none';
  if (ofertaContainer) ofertaContainer.style.display = 'block';
  if (pageTitle) pageTitle.innerHTML = '<strong>Editar Oferta de Carona</strong>';
}

async function detectCaronaType(id) {
  try {
    const response = await fetch(`http://localhost:3000/caronas/${id}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const carona = await response.json();
    
    if (carona.tipo === 'pedindo') {
      showPedidoForm();
      loadPedidoData(id);
    } else {
      showOfertaForm();
      loadOfertaData(id);
    }
  } catch (error) {
    console.error('Erro ao detectar tipo de carona:', error);
  }
}

async function loadPedidoData(id) {
  try {
    const response = await fetch(`http://localhost:3000/caronas/${id}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const pedido = await response.json();
    
    if (pedido) {
      const origemInput = document.getElementById('origem-pedido');
      const destinoInput = document.getElementById('destino-pedido');
      const dataInput = document.getElementById('data-pedido');
      const horarioInput = document.getElementById('horario-pedido');
      const caronaIdInput = document.getElementById('carona-id');
      
      if (origemInput) origemInput.value = pedido.rota?.origem || '';
      if (destinoInput) destinoInput.value = pedido.rota?.destino || '';
      if (dataInput) dataInput.value = pedido.data || '';
      if (horarioInput) horarioInput.value = pedido.horario || '';
      if (caronaIdInput) caronaIdInput.value = pedido.id || '';
      
      if (pedido.tipoCarona === 'emergencial') {
        const emergencialRadio = document.getElementById('carona-emergencial');
        if (emergencialRadio) emergencialRadio.checked = true;
      } else {
        const comumRadio = document.getElementById('carona-comum');
        if (comumRadio) comumRadio.checked = true;
      }
      
      if (pedido.precisaRetorno) {
        const precisaRetornoRadio = document.getElementById('precisa-retorno');
        if (precisaRetornoRadio) precisaRetornoRadio.checked = true;
        
        const dataRetornoInput = document.getElementById('data-retorno-pedido');
        const horarioRetornoInput = document.getElementById('horario-retorno-pedido');
        
        if (dataRetornoInput) dataRetornoInput.value = pedido.dataRetorno || '';
        if (horarioRetornoInput) horarioRetornoInput.value = pedido.horarioRetorno || '';
      } else {
        const naoPrecisaRetornoRadio = document.getElementById('nao-precisa-retorno');
        if (naoPrecisaRetornoRadio) naoPrecisaRetornoRadio.checked = true;
      }
      
      toggleRetornoFields('pedido');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do pedido:', error);
  }
}

async function loadOfertaData(id) {
  try {
    const response = await fetch(`http://localhost:3000/caronas/${id}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const oferta = await response.json();
    
    if (oferta) {
      const origemInput = document.getElementById('origem-oferta');
      const destinoInput = document.getElementById('destino-oferta');
      const dataInput = document.getElementById('data-oferta');
      const horarioInput = document.getElementById('horario-oferta');
      const caronaIdInput = document.getElementById('carona-id-oferta');
      
      if (origemInput) origemInput.value = oferta.rota?.origem || '';
      if (destinoInput) destinoInput.value = oferta.rota?.destino || '';
      if (dataInput) dataInput.value = oferta.data || '';
      if (horarioInput) horarioInput.value = oferta.horario || '';
      if (caronaIdInput) caronaIdInput.value = oferta.id || '';
      
      const veiculoSelect = document.getElementById('rideVehicle');
      const vagasInput = document.getElementById('rideSeats');
      
      if (veiculoSelect) veiculoSelect.value = oferta.veiculo || '';
      if (vagasInput) vagasInput.value = oferta.vagas || 1;
      
      if (oferta.custo) {
        if (oferta.custo === 'Viagem gratuita') {
          const gratuitoRadio = document.getElementById('custo-gratuito');
          if (gratuitoRadio) gratuitoRadio.checked = true;
        } else if (oferta.custo === 'Com divisão de custos') {
          const divisaoRadio = document.getElementById('custo-divisao');
          if (divisaoRadio) divisaoRadio.checked = true;
        }
      }
      
      if (oferta.podeTrazerEncomendas) {
        const simRadio = document.getElementById('pode-encomendas-sim');
        if (simRadio) simRadio.checked = true;
      } else {
        const naoRadio = document.getElementById('pode-encomendas-nao');
        if (naoRadio) naoRadio.checked = true;
      }
      
      if (oferta.incluiRetorno) {
        const incluirRadio = document.getElementById('incluir-retorno');
        if (incluirRadio) incluirRadio.checked = true;
        
        const dataRetornoInput = document.getElementById('data-retorno-oferta');
        const horarioRetornoInput = document.getElementById('horario-retorno-oferta');
        
        if (dataRetornoInput) dataRetornoInput.value = oferta.dataRetorno || '';
        if (horarioRetornoInput) horarioRetornoInput.value = oferta.horarioRetorno || '';
      } else {
        const naoIncluirRadio = document.getElementById('nao-incluir-retorno');
        if (naoIncluirRadio) naoIncluirRadio.checked = true;
      }
      
      toggleRetornoFields('oferta');
    }
  } catch (error) {
    console.error('Erro ao carregar dados da oferta:', error);
  }
}

async function loadVehicles() {
  try {
    const response = await fetch('http://localhost:3000/veiculos');
    const veiculos = await response.json();
    
    const select = document.getElementById('rideVehicle');
    if (!select) return;
    
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }
    
    veiculos.forEach(veiculo => {
      const option = document.createElement('option');
      option.value = veiculo.tipo;
      option.textContent = veiculo.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
  }
}

function setupFormHandlers() {
  const formPedido = document.getElementById('form-editar-pedido');
  if (formPedido) {
    formPedido.addEventListener('submit', handlePedidoSubmit);
  }
  
  const formOferta = document.getElementById('form-editar-oferta');
  if (formOferta) {
    formOferta.addEventListener('submit', handleOfertaSubmit);
  }
  
  const precisaRetorno = document.getElementById('precisa-retorno');
  const naoPrecisaRetorno = document.getElementById('nao-precisa-retorno');
  const incluirRetorno = document.getElementById('incluir-retorno');
  const naoIncluirRetorno = document.getElementById('nao-incluir-retorno');
  
  if (precisaRetorno && naoPrecisaRetorno) {
    precisaRetorno.addEventListener('change', () => toggleRetornoFields('pedido'));
    naoPrecisaRetorno.addEventListener('change', () => toggleRetornoFields('pedido'));
  }
  
  if (incluirRetorno && naoIncluirRetorno) {
    incluirRetorno.addEventListener('change', () => toggleRetornoFields('oferta'));
    naoIncluirRetorno.addEventListener('change', () => toggleRetornoFields('oferta'));
  }
  
  loadVehicles();
}

function toggleRetornoFields(tipo) {
  if (tipo === 'pedido') {
    const precisaRetorno = document.getElementById('precisa-retorno');
    const retornoFields = document.getElementById('retorno-fields-pedido');
    
    if (precisaRetorno && retornoFields) {
      retornoFields.style.display = precisaRetorno.checked ? 'block' : 'none';
    }
  } else if (tipo === 'oferta') {
    const incluirRetorno = document.getElementById('incluir-retorno');
    const retornoFields = document.getElementById('retorno-fields-oferta');
    
    if (incluirRetorno && retornoFields) {
      retornoFields.style.display = incluirRetorno.checked ? 'block' : 'none';
    }
  }
}

async function handlePedidoSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
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
    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Seu pedido de carona foi atualizado com sucesso.',
      icon: 'success'
    }).then(() => {
      window.location.href = 'caronas/index.html';
    });
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    Swal.fire({
      title: 'Erro!',
      text: 'Erro ao salvar as alterações. Tente novamente.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

async function handleOfertaSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
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
    const response = await fetch(`http://localhost:3000/caronas/${caronaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Sua oferta de carona foi atualizada com sucesso.',
      icon: 'success'
    }).then(() => {
      window.location.href = 'caronas/index.html';
    });
  } catch (error) {
    console.error('Erro ao salvar oferta:', error);
    Swal.fire({
      title: 'Erro!',
      text: 'Erro ao salvar as alterações. Tente novamente.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

async function loadViagens() {
  try {
    const res = await fetch("http://localhost:3000/viagens");
    const viagens = await res.json();
    const container = document.getElementById("viagens-container");
    if (!container) return;

    clearChildren(container);

    if (!viagens.length) {
      const emptyDiv = createSafeElement('div', 'text-center text-muted py-5');
      emptyDiv.appendChild(createIcon('bi bi-briefcase', 'font-size: 3rem; color: #d1d5db;'));
      emptyDiv.appendChild(createSafeElement('p', 'mt-3', 'Nenhuma viagem cadastrada'));
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

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('caronas/index.html')) {
    loadCaronas();
    setupFilters();
    setupSearch();
    setupButtons();
  } else if (currentPath.includes('editar-carona.html')) {
    initializeEditCarona();
  } else if (currentPath.includes('pedir-carona.html')) {
    setupPedirCaronaForm();
  } else if (currentPath.includes('oferecer-carona.html')) {
    setupOferecerCaronaForm();
  } else if (currentPath.includes('viagem.html')) {
    loadViagens();
  } else {
    if (document.getElementById('page-title')) {
      initializeEditCarona();
    }
  }
});