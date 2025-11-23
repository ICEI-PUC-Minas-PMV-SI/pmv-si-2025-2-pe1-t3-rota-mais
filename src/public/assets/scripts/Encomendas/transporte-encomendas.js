// transporte-encomendas.js

// Referências ao DOM
const partida = document.getElementById('partida');
const chegada = document.getElementById('chegada');
const dataViagem = document.getElementById('dataViagem');
const horaPartida = document.getElementById('horaPartida');
const veiculo = document.getElementById('veiculo');
const placa = document.getElementById('placa');
const dataRetorno = document.getElementById('dataRetorno');
const horaRetorno = document.getElementById('horaRetorno');
const retornoContainer = document.getElementById('retornoContainer');
const btn = document.getElementById('criarOferta');

function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  const meses = [
    'janeiro','fevereiro','março','abril','maio','junho',
    'julho','agosto','setembro','outubro','novembro','dezembro'
  ];
  return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

function configurarSeletores(containerId, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const options = container.querySelectorAll('.option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      if (callback) callback(option.innerText);
    });
  });
}

// configura
configurarSeletores('custoOptions');
configurarSeletores('retornoOptions', (valor) => {
  if (!retornoContainer) return;
  if (valor.includes('Não incluir')) retornoContainer.style.display = 'none';
  else retornoContainer.style.display = 'flex';
});

// estado inicial retorno
(function inicializarRetorno() {
  const active = document.querySelector('#retornoOptions .active');
  if (!active) return;
  if (active.innerText.includes('Não incluir')) retornoContainer.style.display = 'none';
  else retornoContainer.style.display = 'flex';
})();

if (btn) {
  btn.addEventListener('click', async () => {
    // valida login
    const currentUser = getCurrentUser();
    const userId = Number(localStorage.getItem('userId'));
    if (!currentUser || !userId) {
      alert('Você precisa estar logado para criar uma oferta!');
      window.location.href = '/pages/autenticacao/login.html';
      return;
    }

    // valida campos obrigatórios
    const obrigatorios = [partida, chegada, dataViagem, horaPartida, veiculo, placa];
    for (const campo of obrigatorios) {
      if (!campo) continue;
      const valor = campo.tagName === 'SELECT' ? campo.value : campo.value.trim();
      if (!valor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        campo.focus();
        return;
      }
    }

    // monta o modelo compatível com a listagem
    const origem = partida.value.trim();
    const destino = chegada.value.trim();
    const dataISO = dataViagem.value ? new Date(dataViagem.value + 'T00:00:00').toISOString() : new Date().toISOString();
    const dataTexto = formatarData(dataISO);
    const horario = horaPartida.value || '';

    const incluirRetornoTxt = document.querySelector('#retornoOptions .active')?.innerText || '';
    const custoTxt = document.querySelector('#custoOptions .active')?.innerText || '';

    const oferta = {
      tipo: 'oferecendo',        // padronizado
      origem,
      destino,
      dataTexto,
      dataISO,
      horario,
      veiculo: veiculo.value,
      placa: placa.value.trim(),
      custo: custoTxt,
      incluirRetorno: incluirRetornoTxt,
      dataRetorno: incluirRetornoTxt.includes('Não') ? '' : (dataRetorno?.value || ''),
      horaRetorno: incluirRetornoTxt.includes('Não') ? '' : (horaRetorno?.value || ''),

      usuario: {
        id: currentUser.id,
        nome: currentUser.nome || currentUser.name,
        email: currentUser.email,
        telefone: currentUser.telefone,
        comunidade: currentUser.comunidade,
        cidade: currentUser.cidade,
        avatar: currentUser.avatar
      },

      criadorId: userId
    };

    // POST no JSON Server usando API_BASE (mesmo padrão das outras telas)
    try {
      const res = await fetch(`${API_BASE}/encomendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oferta)
      });

      if (!res.ok) throw new Error('Erro ao criar oferta');

      alert('Oferta criada com sucesso!');
      window.location.href = '/pages/encomendas/index.html';
    } catch (err) {
      console.error(err);
      alert('Erro ao criar oferta. Tente novamente.');
    }
  });
}
