/* Helpers */
function qs(selector, parent = document) { return parent.querySelector(selector); }
function qsa(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); }
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return id ? Number(id) : null;
}

/* CARD PARA CARONAS */
function buildCardCarona(carona) {
  const card = el('div', 'card-carona');

  const info = el('div', 'carona-info');
  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  avatar.src = (carona.usuario?.avatar) || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';

  const dados = el('div', 'carona-dados');
  dados.appendChild(el('div', null, carona.usuario?.nome || carona.usuario["usuario"] || 'Usuário'));
  dados.appendChild(el('div', null, `De ${carona.rota?.origem || '—'} para ${carona.rota?.destino || '—'}`));
  dados.appendChild(el('div', null, `${carona.data ? 'Dia ' + carona.data : ''} ${carona.horario ? 'às ' + carona.horario : ''}`));

  info.appendChild(avatar);
  info.appendChild(dados);

  const acoes = el('div', 'carona-acao');
  const btn = el('button', 'btn-detalhes', 'Detalhes');
  btn.onclick = () => {
    window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo}`;
  };

  acoes.appendChild(btn);

  card.appendChild(info);
  card.appendChild(acoes);
  return card;
}


/* CARD PARA ENCOMENDAS */
function buildCardEncomenda(e) {
  const card = el('div', 'card-encomenda');

  const info = el('div', 'encomenda-info');

  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  avatar.src = (e.usuario?.avatar) || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';

  const dados = el('div', 'encomenda-dados');
  dados.appendChild(el('div', null, `${e.usuario?.usuario || 'Usuário'}`));
  dados.appendChild(el('div', null, `Origem: ${e.origem || '—'}`));
  dados.appendChild(el('div', null, `Destino: ${e.destino || '—'}`));
  dados.appendChild(el('div', null, `${e.dataTexto || ''} ${e.horario ? 'às ' + e.horario : ''}`));

  info.appendChild(avatar);
  info.appendChild(dados);

  const acoes = el('div', 'encomenda-acao');
  const btn = el('button', 'btn-detalhes', 'Detalhes');
  btn.onclick = () => {
    window.location.href = `/pages/encomendas/detalhes.html?id=${e.id}`;
  };

  acoes.appendChild(btn);

  card.appendChild(info);
  card.appendChild(acoes);

  return card;
}


/* Mensagem de vazio */
function renderVazio(container, texto = "Nenhuma informação encontrada.") {
  container.innerHTML = '';
  container.appendChild(el('div', 'alert alert-light', texto));
}


/* CARREGA A PÁGINA DO LOCAL */
async function carregarPaginaLocal() {
  const id = getIdFromUrl();
  if (!id) return console.error('ID do local não informado.');

  const imgBanner = qs('#local-banner-img');
  const nomeEl = qs('#local-nome');
  const criadorNomeEl = qs('#local-criador-nome');
  const categoriaEl = qs('#local-categoria');
  const enderecoEl = qs('#local-endereco');
  const quantidadeEl = qs('#local-quantidade');
  const caronasContainer = qs('#caronas-container');

  try {

    /* ---------- 1. BUSCAR LOCAL ----------- */
    const local = await fetch(`${API_BASE}/locais/${id}`).then(r => r.json());

    imgBanner.src = local.imagem || imgBanner.src;
    nomeEl.textContent = local.nome;
    criadorNomeEl.textContent = local.criadorNome || 'Usuário da plataforma';
    categoriaEl.textContent = ' ' + (local.tipo || '');
    enderecoEl.textContent = ' ' + (local.endereco || '—');


    /* ---------- 2. BUSCAR CARONAS ----------- */
    const caronas = await fetch(`${API_BASE}/caronas`).then(r => r.json());

    const caronasFiltradas = caronas.filter(c => {
      const loc = local.nome.toLowerCase();
      return (
        c.rota?.origem?.toLowerCase() === loc ||
        c.rota?.destino?.toLowerCase() === loc
      );
    });


    /* ---------- 3. BUSCAR ENCOMENDAS ----------- */
    const encomendas = await fetch(`${API_BASE}/encomendas`).then(r => r.json());

    const encomendasFiltradas = encomendas.filter(e => {
      const loc = local.nome.toLowerCase();
      return (
        e.origem?.toLowerCase() === loc ||
        e.destino?.toLowerCase() === loc
      );
    });


    /* ---------- 4. CONTABILIZAR TOTAL ----------- */
    const total = caronasFiltradas.length + encomendasFiltradas.length;
    quantidadeEl.textContent = `${total} viagens e encomendas passando por aqui`;


    /* ---------- 5. RENDERIZAR LISTAS ----------- */
    caronasContainer.innerHTML = '';

    if (caronasFiltradas.length === 0 && encomendasFiltradas.length === 0) {
      return renderVazio(caronasContainer, "Nenhuma viagem ou encomenda encontrada.");
    }

    // Caronas primeiro
    caronasFiltradas.forEach(c => {
      caronasContainer.appendChild(buildCardCarona(c));
    });

    // Encomendas depois
    encomendasFiltradas.forEach(e => {
      caronasContainer.appendChild(buildCardEncomenda(e));
    });

  } catch (e) {
    console.error(e);
    renderVazio(caronasContainer, "Erro ao carregar dados.");
  }
}


/* Inicialização */
document.addEventListener('DOMContentLoaded', carregarPaginaLocal);
