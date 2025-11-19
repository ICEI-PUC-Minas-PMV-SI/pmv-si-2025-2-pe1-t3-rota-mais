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

/* Renderiza um card de carona simples (adaptado da sua lógica de caronas) */
function buildCardCarona(carona) {
  const card = el('div', 'card-carona');

  const info = el('div', 'carona-info');
  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  // avatar do criador se existir
  avatar.src = (carona.usuario && carona.usuario.avatar) || (carona.criadorAvatar) || 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';
  avatar.alt = (carona.usuario && carona.usuario.nome) ? carona.usuario.nome : 'Usuário';

  const dados = el('div', 'carona-dados');
  const usuarioTxt = el('div', null, (carona.usuario && carona.usuario.nome) ? `${carona.usuario.nome}` : (carona.criadorNome || 'Usuário'));
  const rotaTxt = el('div', null, `De ${carona.rota?.origem || '—'} para ${carona.rota?.destino || '—'}`);
  const detalhesTxt = el('div', null, `${carona.data ? 'Dia ' + carona.data : ''} ${carona.horario ? 'às ' + carona.horario : ''}`);

  dados.appendChild(usuarioTxt);
  dados.appendChild(rotaTxt);
  dados.appendChild(detalhesTxt);

  info.appendChild(avatar);
  info.appendChild(dados);

  // Ações (botões)
  const acoes = el('div', 'carona-acao');
  const btnParticipar = el('button', 'btn-participar', carona.tipo === 'oferecendo' ? 'Participar da viagem' : 'Se candidatar');
  btnParticipar.onclick = () => {
    // ação mínima: redireciona para a página de detalhes
    window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo || ''}`;
  };

  const btnDetalhes = el('button', 'btn-detalhes', 'Detalhes');
  btnDetalhes.onclick = () => {
    window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo || ''}`;
  };

  acoes.appendChild(btnDetalhes);
  acoes.appendChild(btnParticipar);

  card.appendChild(info);
  card.appendChild(acoes);

  return card;
}

/* Mostra mensagem quando não houver caronas */
function renderVazio(container, texto = "Nenhuma carona encontrada para este local.") {
  container.innerHTML = '';
  const msg = el('div', 'alert alert-light', texto);
  container.appendChild(msg);
}

/* Carrega dados do local e das caronas */
async function carregarPaginaLocal() {
  const id = getIdFromUrl();
  if (!id) {
    console.error('ID do local não informado na URL.');
    return;
  }

  // Elementos
  const imgBanner = qs('#local-banner-img');
  const nomeEl = qs('#local-nome');
  const criadorNomeEl = qs('#local-criador-nome');
  const categoriaEl = qs('#local-categoria');
  const enderecoEl = qs('#local-endereco');
  const quantidadeEl = qs('#local-quantidade');
  const btnContato = qs('#btn-contato');
  const caronasContainer = qs('#caronas-container');

  try {
    // Buscar local
    const resLocal = await fetch(`${API_BASE}/locais/${id}`);
    if (!resLocal.ok) throw new Error('Erro ao buscar local');

    const local = await resLocal.json();

    // Preencher dados
    imgBanner.src = local.imagem || imgBanner.src;
    imgBanner.alt = `Foto de ${local.nome || 'local'}`;
    nomeEl.textContent = local.nome || 'Nome do local';
    criadorNomeEl.textContent = local.criadorNome || local.criador || '—';
    categoriaEl.textContent = ' ' + (local.tipo || 'Categoria não informada');
    enderecoEl.textContent = ' ' + (local.endereco || 'Endereço não informado');
    quantidadeEl.textContent = ' ' + ((local.quantidadeViagens !== undefined) ? `${local.quantidadeViagens} viagens estão passando por aqui atualmente` : '0 viagens');

    // contato (se tiver telefone no objeto local)
    if (local.contato) {
      btnContato.onclick = () => {
        // abre whatsapp se for número, ou envia para link se for url
        if (/^\+?\d{6,}$/.test(local.contato.replace(/\D/g, ''))) {
          const numero = local.contato.replace(/\D/g, '');
          window.open(`https://wa.me/${numero}`, '_blank');
        } else if (local.contato.startsWith('http')) {
          window.open(local.contato, '_blank');
        } else {
          // mostra número
          Swal.fire('Contato', local.contato, 'info');
        }
      };
    } else {
      btnContato.style.display = 'none';
    }

    // Buscar caronas e filtrar
    const resCaronas = await fetch(`${API_BASE}/caronas`);
    if (!resCaronas.ok) throw new Error('Erro ao buscar caronas');
    const caronas = await resCaronas.json();

    // Filtrar as caronas relacionadas ao local:
    // 1) carona.localId === id
    // 2) carona.rota.destino === local.nome (caso não use localId)
    const caronasFiltradas = caronas.filter(c => {
      const destino = c.rota?.destino;
      const localIdMatch = c.localId === id || c.destinoId === id;
      const destinoNomeMatch = destino && local.nome && destino.toString().toLowerCase() === local.nome.toString().toLowerCase();
      return localIdMatch || destinoNomeMatch;
    });

    // Renderizar
    caronasContainer.innerHTML = '';
    if (!caronasFiltradas.length) {
      renderVazio(caronasContainer, 'Nenhuma carona disponível para este local no momento.');
    } else {
      caronasFiltradas.forEach(c => {
        const card = buildCardCarona(c);
        caronasContainer.appendChild(card);
      });
    }

  } catch (err) {
    console.error(err);
    const caronasContainer = qs('#caronas-container');
    renderVazio(caronasContainer, 'Erro ao carregar dados. Tente novamente mais tarde.');
  }
}

/* Inicializa a página */
document.addEventListener('DOMContentLoaded', () => {
  carregarPaginaLocal();
});
