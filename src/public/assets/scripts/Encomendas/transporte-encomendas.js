// transporte-encomendas.js

// Referências aos elementos do DOM
const partida = document.getElementById('partida');
const chegada = document.getElementById('chegada');
const dataViagem = document.getElementById('dataViagem');
const horaPartida = document.getElementById('horaPartida');
const veiculo = document.getElementById('veiculo');
const placa = document.getElementById('placa');
const dataRetorno = document.getElementById('dataRetorno');
const horaRetorno = document.getElementById('horaRetorno');
const retornoContainer = document.getElementById('retornoContainer');

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

configurarSeletores('custoOptions');

// controla exibição do bloco de retorno
configurarSeletores('retornoOptions', (valor) => {
  if (!retornoContainer) return;
  if (valor.includes('Não incluir')) {
    retornoContainer.style.display = 'none';
  } else {
    retornoContainer.style.display = 'flex';
  }
});

// Garante estado inicial do container de retorno conforme opção ativa
(function inicializarRetorno() {
  const active = document.querySelector('#retornoOptions .active');
  if (!active) return;
  if (active.innerText.includes('Não incluir')) {
    retornoContainer.style.display = 'none';
  } else {
    retornoContainer.style.display = 'flex';
  }
})();

// Manipulador do botão criar oferta
const btn = document.getElementById('criarOferta');
if (btn) {
  btn.addEventListener('click', () => {
    // Validação dos campos obrigatórios
    const camposObrigatorios = [partida, chegada, dataViagem, horaPartida, veiculo, placa];

    for (const campo of camposObrigatorios) {
      if (!campo) continue;
      // para <select>, verificamos se o valor foi selecionado
      const valor = (campo.tagName === 'SELECT') ? campo.value : campo.value.trim();
      if (!valor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        campo.focus();
        return;
      }
    }

    // Monta o objeto de dados corretamente (sem atribuições erradas)
    const dados = {
      partida: partida.value.trim(),
      chegada: chegada.value.trim(),
      dataViagem: dataViagem.value,
      horaPartida: horaPartida.value,
      veiculo: veiculo.value,
      placa: placa.value.trim(),
      custo: (document.querySelector('#custoOptions .active') || {}).innerText || '',
      incluirRetorno: (document.querySelector('#retornoOptions .active') || {}).innerText || '',
      dataRetorno: dataRetorno ? dataRetorno.value : '',
      horaRetorno: horaRetorno ? horaRetorno.value : ''
    };

    const incluirRetornoAtivo = document.querySelector('#retornoOptions .active');
    if (incluirRetornoAtivo && incluirRetornoAtivo.innerText.includes('Não incluir')) {
      retornoContainer.style.display = 'none';
    }
    
    console.log('Oferta criada:', dados);
    window.location.href = '/pages/encomendas/index.html';
  });
}
