$(function () {
  function addCustomValidationMethods() {
    if (typeof $.validator === 'undefined' || !$.validator.methods) {
      setTimeout(addCustomValidationMethods, 100);
      return;
    }
    
    $.validator.addMethod("pattern", function (value, element, param) {
      if (!param) return true;
      if (!value) return true;
      let regex;
      if (param instanceof RegExp) {
        regex = param;
      } else {
        regex = new RegExp(param);
      }
      return regex.test(value);
    }, "Formato inválido");
    
    $.validator.addMethod("validDate", function (value, element) {
      if (!value) return true;
      const parts = value.split('/');
      if (parts.length !== 3) return false;
      const [dia, mes, ano] = parts.map(p => parseInt(p));
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
      if (dia < 1 || dia > 31) return false;
      if (mes < 1 || mes > 12) return false;
      if (ano < 1900 || ano > 2100) return false;
      const date = new Date(ano, mes - 1, dia);
      return date.getDate() === dia && date.getMonth() === mes - 1 && date.getFullYear() === ano;
    }, "Data inválida. Use o formato DD/MM/AAAA com valores válidos.");

    $.validator.addMethod("dateGreaterThan", function (value, element, param) {
      if (!value) return true;
      
      const $form = $(element).closest('form');
      const dataIdaSelector = param || '#data, #data-pedido, #data-oferta';
      const $dataIda = $form.find(dataIdaSelector).first();
      const dataIda = $dataIda.val();
      
      if (!dataIda) return true;
      
      const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const [dia, mes, ano] = parts.map(p => parseInt(p));
        if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null;
        if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
        return new Date(ano, mes - 1, dia);
      };
      
      try {
        const dataIdaObj = parseDate(dataIda);
        const dataRetornoObj = parseDate(value);
        if (!dataIdaObj || !dataRetornoObj) return true;
        return dataRetornoObj >= dataIdaObj;
      } catch {
        return true;
      }
    }, "A data de retorno não pode ser anterior à data de ida");
  }
  
  addCustomValidationMethods();

  function el(tag, cls, text) {
    const $e = $(`<${tag}>`);
    if (cls) $e.addClass(cls);
    if (text !== undefined && text !== null) $e.text(text);
    return $e;
  }

  function icon(cls, style) {
    const $i = $('<i>');
    if (cls) $i.addClass(cls);
    if (style) $i.attr('style', style);
    return $i;
  }

  function clear($container) {
    $container.children().remove();
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    return await res.json();
  }

  function emptyState($container, iconCls, msg, color) {
    const $wrap = el('div', 'text-center py-5');
    const $i = icon(iconCls, `font-size:3rem;${color ? `color:${color};` : ''}`);
    const $p = el('p', 'mt-3', msg);
    $wrap.append($i, $p);
    clear($container);
    $container.append($wrap);
  }

  function maskDate(selector) {
    $(selector).mask('99/99/9999');
  }

  function maskTime(selector) {
    $(selector).mask('99:99');
  }


  function toggleCaronaType() {
    const tipoCarona = $('input[name="tipo-carona"]:checked').val();
    const $formComum = $('#form-comum-container, .form-comum-fields');
    const $formEmergencial = $('#form-emergencial-container, .form-emergencial-fields');
    const $motivoSection = $('#motivo-section-pedido');

    if (tipoCarona === 'emergencial') {
      $formComum.hide();
      $formEmergencial.show();
      if ($motivoSection.length) $motivoSection.show();
    } else {
      $formComum.show();
      $formEmergencial.hide();
      if ($motivoSection.length) $motivoSection.hide();
    }
  }

  function toggleReturnFields($yes, $no, $fields) {
    function update() {
      if ($yes.is(':checked')) $fields.slideDown(150);
      else $fields.slideUp(150);
    }
    $yes.on('change', update);
    $no.on('change', update);
    update();
  }

  function baseValidationConfig($form, tipo) {
    const rules = {};
    const messages = {};
    const addRule = (name, rule, msg) => {
      if ($form.find(`[name="${name}"]`).length) {
        rules[name] = rule;
        messages[name] = msg;
      }
    };

    addRule('origem', { required: true }, 'O local de partida é obrigatório');
    addRule('destino', { required: true }, 'O local de destino é obrigatório');
    addRule('data', { required: true, validDate: true }, 'A data é obrigatória e deve ser válida');
    addRule('horario', {
      required: true,
      pattern: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    }, 'O horário é obrigatório e deve estar no formato HH:MM');

    if (tipo === 'pedido' || $form.attr('id') === 'form-editar-pedido' || $form.attr('id') === 'form-pedir-carona') {
      addRule('precisa-retorno', { required: true }, 'A opção de retorno é obrigatória');
      addRule('data-retorno', {
        required: function () {
          const precisa = $('input[name="precisa-retorno"]:checked').val();
          return precisa === 'sim';
        },
        validDate: true,
        dateGreaterThan: '#data, #data-pedido'
      }, 'A data de retorno é obrigatória e não pode ser anterior à data de ida');
      addRule('horario-retorno', {
        required: function () {
          const precisa = $('input[name="precisa-retorno"]:checked').val();
          return precisa === 'sim';
        },
        pattern: /^([0-1]\d|2[0-3]):([0-5]\d)$/
      }, 'O horário de retorno é obrigatório e deve estar no formato HH:MM');

      addRule('origem-emergencial', { required: true }, 'O local de partida é obrigatório');
      addRule('destino-emergencial', { required: true }, 'O local de destino é obrigatório');
      addRule('data-emergencial', { required: true, validDate: true }, 'A data é obrigatória e deve ser válida');
      addRule('motivo-emergencial', { required: true }, 'O motivo da carona é obrigatório');
    }

    if (tipo === 'oferta' || $form.attr('id') === 'form-editar-oferta' || $form.attr('id') === 'form-oferecer-carona') {
      addRule('veiculo', { required: true }, 'O veículo é obrigatório');
      addRule('vagas', { required: true, digits: true, min: 1 }, 'O número de vagas é obrigatório e deve ser um número inteiro');
      addRule('custo', { required: true }, 'O custo é obrigatório');
      addRule('pode-encomendas', { required: true }, 'A opção de trazer encomendas é obrigatória');
      addRule('incluir-retorno', { required: true }, 'A opção de incluir retorno é obrigatória');
      addRule('data-retorno', {
        required: function () {
          return $('input[name="incluir-retorno"]:checked').val() === 'sim';
        },
        validDate: true,
        dateGreaterThan: '#data, #data-oferta'
      }, 'A data de retorno é obrigatória e não pode ser anterior à data de ida');
      addRule('horario-retorno', {
        required: function () {
          return $('input[name="incluir-retorno"]:checked').val() === 'sim';
        },
        pattern: /^([0-1]\d|2[0-3]):([0-5]\d)$/
      }, 'O horário de retorno é obrigatório e deve estar no formato HH:MM');
    }

    try {
      return $form.validate({
        rules,
        messages,
        errorElement: 'div',
        errorClass: 'invalid-feedback',
        highlight: el => $(el).addClass('is-invalid'),
        unhighlight: el => $(el).removeClass('is-invalid'),
        errorPlacement: function (error, element) {
          if (element.attr('type') === 'radio') {
            const $grp = element.closest('.radio-group');
            if ($grp.length) $grp.after(error);
            else element.after(error);
          } else {
            element.after(error);
          }
        }
      });
    } catch {
      return null;
    }
  }

  async function buildCaronaCard(carona) {
    const tipo = carona.tipo === 'oferecendo' ? 'oferecendo' : 'pedindo';
    
    let criadorNome = 'Usuário';
    let criadorAvatar = 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png';
    
    try {
      if (carona.criadorId) {
        const criador = await fetchJSON(`${API_BASE}/users/${carona.criadorId}`);
        criadorNome = criador.name || criadorNome;
        criadorAvatar = criador.avatar || criadorAvatar;
      } else if (carona.usuario && carona.usuario.nome) {
        criadorNome = carona.usuario.nome;
        criadorAvatar = carona.usuario.avatar || criadorAvatar;
      }
    } catch {}
    
    const action = tipo === 'oferecendo' ? 'está oferecendo uma carona' : 'está pedindo uma carona';
    const $card = el('div', 'carona-card p-4 rounded mb-3 position-relative');

    const agora = Date.now();
    const idadeCarona = agora - (carona.id || 0);
    const ehRecente = idadeCarona < 300000;

    if (carona.tipoCarona === 'emergencial') {
      $card.css({
        'border-left': '5px solid #dc3545',
        'background-color': '#ffeaea',
        'border': '2px solid #dc3545',
        'box-shadow': '0 2px 8px rgba(220, 53, 69, 0.2)'
      });

      const $badge = $('<span>').addClass('badge bg-danger').css({
        'position': 'absolute',
        'top': '10px',
        'right': '10px',
        'font-size': '0.75rem',
        'z-index': '10'
      }).text('Emergencial');
      $card.prepend($badge);
    } else if (ehRecente) {
      $card.css({
        'border-left': '5px solid #ffc107',
        'background-color': '#fff8e1',
        'border': '2px solid #ffc107',
        'box-shadow': '0 2px 8px rgba(255, 193, 7, 0.2)'
      });

      const $badge = $('<span>').addClass('badge bg-warning text-dark').css({
        'position': 'absolute',
        'top': '10px',
        'right': '10px',
        'font-size': '0.75rem',
        'z-index': '10'
      }).text('Nova');
      $card.prepend($badge);
    }

    const $header = el('div', 'd-flex align-items-center gap-2 mb-3');
    const $img = $('<img>').addClass('user-avatar-card').attr('src', criadorAvatar).attr('alt', criadorNome);
    const $user = el('span', 'carona-user', `${criadorNome} ${action}`);
    $header.append($img, $user);
    const $rota = el('div', `carona-rota ${tipo} d-flex align-items-center gap-2 mb-3`);
    const $h2 = el('h2');
    const origem = carona.rota && carona.rota.origem ? carona.rota.origem : '';
    const destino = carona.rota && carona.rota.destino ? carona.rota.destino : '';
    $h2.append(document.createTextNode('De '), $('<strong>').text(origem)[0], document.createTextNode(' para '), $('<strong>').text(destino)[0]);
    $rota.append($h2);
    const $details = el('div', 'carona-details d-flex flex-wrap gap-3 mb-3');
    const $data = el('div', 'd-flex align-items-center gap-2');
    $data.append(icon('bi bi-calendar3'), el('span', null, `Dia ${carona.data || ''} ${carona.horario ? 'às ' + carona.horario : ''}`));
    $details.append($data);

    if (carona.motivo) {
      const $motivo = el('div', 'carona-motivo w-100 mb-2 p-2 rounded', null);
      $motivo.css({
        'background-color': '#f8d7da',
        'font-style': 'italic',
        'margin-top': '0.5rem'
      });
      const $motivoLabel = el('strong', 'd-block mb-1', 'Motivo da emergência:');
      const $motivoText = el('div', null, carona.motivo);
      $motivo.append($motivoLabel, $motivoText);
      $details.append($motivo);
    }

    if (carona.veiculo) {
      const $veh = el('div', 'd-flex align-items-center gap-2');
      $veh.append(icon(carona.veiculo === 'moto' ? 'fa fa-motorcycle' : 'fa fa-car'), el('span', null, `Veículo: ${carona.veiculo}`));
      $details.append($veh);
    }
    if (carona.vagas) {
      const $v = el('div', 'd-flex align-items-center gap-2');
      $v.append(icon('bi bi-person'), el('span', null, `${carona.vagas} vaga${carona.vagas > 1 ? 's' : ''}`));
      $details.append($v);
    }
    if (carona.incluiRetorno) {
      const $r = el('div', 'd-flex align-items-center gap-2');
      $r.append(icon('bi bi-arrow-repeat'), el('span', null, 'Inclui retorno'));
      $details.append($r);
    }
    if (carona.podeTrazerEncomendas) {
      const $e = el('div', 'd-flex align-items-center gap-2');
      $e.append(icon('bi bi-box'), el('span', null, 'Pode trazer encomendas'));
      $details.append($e);
    }

    const $custo = carona.custo ? el('div', 'carona-custo', carona.custo) : null;
    const $btns = el('div', 'd-flex justify-content-end gap-2 mt-2');
    const $detailsBtn = el('button', 'btn btn-secondary d-flex align-items-center gap-2 rounded-3 border-0 p-2');
    $detailsBtn.attr('type', 'button');
    $detailsBtn.append(icon('bi bi-info-circle'), el('span', null, 'Detalhes'));
    $detailsBtn.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo}`;
    });
    
    const currentUserId = Number(localStorage.getItem("userId"));
    const isCriador = carona.criadorId === currentUserId;
    const $editBtn = el('button', 'btn btn-success d-flex align-items-center gap-2 rounded-3 border-0 p-2');
    $editBtn.attr('type', 'button');
    $editBtn.append(icon('bi bi-pencil'), el('span', null, 'Editar'));
    if (isCriador) {
      $editBtn.on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `editar-carona.html?id=${carona.id}&tipo=${carona.tipo}`;
      });
    } else {
      $editBtn.hide();
    }
    const isMotoristaOferecendo = tipo === 'oferecendo' && carona.motoristaId === currentUserId;
    const jaEstaIncluso = carona.passageiros && carona.passageiros.some(p => p.userId === currentUserId);
    const pedidoUsuario = carona.passageiros && carona.passageiros.find(p => p.userId === currentUserId);
    const statusPedido = pedidoUsuario?.status;
    const isCriadorPedindo = tipo === 'pedindo' && carona.passageiroId === currentUserId;
    const temPassageirosAprovados = carona.passageiros && carona.passageiros.some(p => p.status === 'aprovado');
    
    const $actionBtn = el('button', `${tipo === 'oferecendo' ? 'btn-participar' : 'btn-oferecer'} d-flex align-items-center gap-2 rounded-3 border-0 p-2`);
    $actionBtn.attr('type', 'button');
    
    if (tipo === 'oferecendo') {
      if (isMotoristaOferecendo || jaEstaIncluso) {
        $actionBtn.attr('style', 'display: none !important');
      } else {
        if (pedidoUsuario) {
          if (statusPedido === 'aprovado') {
            $actionBtn.append(icon('bi bi-check-circle'), el('span', null, ' Pedido aprovado'));
            $actionBtn.prop('disabled', true).removeClass('btn-participar').addClass('btn-success');
          } else if (statusPedido === 'pendente') {
            $actionBtn.append(icon('bi bi-clock'), el('span', null, ' Aguardando resposta do motorista'));
            $actionBtn.prop('disabled', true).removeClass('btn-participar').addClass('btn-warning');
          } else {
            $actionBtn.append(icon('bi bi-x-circle'), el('span', null, ' Pedido negado'));
            $actionBtn.prop('disabled', true).removeClass('btn-participar').addClass('btn-danger');
          }
        } else {
          $actionBtn.append(icon('bi bi-check-circle'), el('span', null, ' Pedir carona'));
          $actionBtn.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/pages/viagens/detalhes.html?id=${carona.id}&tipo=${carona.tipo}`;
          });
        }
      }
    } else {
      const isCriadorPedindo = carona.passageiroId === currentUserId || carona.criadorId === currentUserId;
      const jaTemMotorista = !!carona.motoristaId;
      const motoristasCandidatos = carona.motoristasCandidatos || [];
      const jaCandidatou = motoristasCandidatos.some(m => m.motoristaId === currentUserId);
      const temVeiculo = await verificarVeiculosUsuario();
      
      if (isCriadorPedindo) {
        $actionBtn.attr('style', 'display: none !important');
      } else if (jaTemMotorista) {
        $actionBtn.append(icon('bi bi-x-circle'), el('span', null, ' Carona já tem motorista'));
        $actionBtn.prop('disabled', true).removeClass('btn-oferecer').addClass('btn-secondary');
      } else if (jaCandidatou) {
        $actionBtn.append(icon('bi bi-clock'), el('span', null, ' Aguardando aprovação'));
        $actionBtn.prop('disabled', true).removeClass('btn-oferecer').addClass('btn-warning');
      } else if (!temVeiculo) {
        $actionBtn.attr('style', 'display: none !important');
      } else {
        $actionBtn.append(icon('bi bi-hand-thumbs-up'), el('span', null, ' Se candidatar'));
        $actionBtn.on('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          oferecerCarona(carona.id);
        });
      }
    }
    
    if (isCriadorPedindo || (isMotoristaOferecendo && !temPassageirosAprovados)) {
      const $deleteBtn = el('button', 'btn btn-danger d-flex align-items-center gap-2 rounded-3 border-0 p-2');
      $deleteBtn.attr('type', 'button');
      $deleteBtn.append(icon('bi bi-trash'), el('span', null, ' Excluir'));
      $deleteBtn.on('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await excluirCarona(carona.id);
      });
      $btns.append($deleteBtn);
    }
    
    $btns.append($detailsBtn, $editBtn, $actionBtn);
    $card.append($header, $rota, $details);
    if ($custo) $card.append($custo);
    $card.append($btns);
    return $card;
  }

  async function loadCaronas() {
    await filterCaronas('todos');
  }

  function setupFilters() {
    const $tabs = $('.filter-tab');
    if (!$tabs.length) return;
    $tabs.each(function () {
      $(this).on('click', function () {
        $tabs.removeClass('active');
        $(this).addClass('active');
        const filter = $(this).data('filter') || 'todos';
        filterCaronas(filter);
      });
    });
  }

  async function filterCaronas(filter) {
    const $container = $('#caronas-container');
    if (!$container.length) return;
    try {
      const caronas = await fetchJSON(`${API_BASE}/caronas`);
      const selectedCommunityId = Number(localStorage.getItem("selectedCommunityId"));
      
      let caronasFiltradas = caronas;
      if (selectedCommunityId) {
        caronasFiltradas = caronas.filter(c => c.comunidadeId === selectedCommunityId);
      }
      
      const caronasAtivas = caronasFiltradas.filter(c => (c.statusViagem || 'agendada') === 'agendada');
      const list = filter && filter !== 'todos' ? caronasAtivas.filter(c => c.tipo === filter) : caronasAtivas;
      clear($container);
      if (!list.length) {
        const msg = filter === 'oferecendo' ? 'Nenhuma oferta de carona disponível' : filter === 'pedindo' ? 'Nenhum pedido de carona disponível' : 'Nenhuma carona disponível no momento';
        emptyState($container, 'bi bi-car-front', msg, '#d1d5db');
        return;
      }
      const listOrdenada = list.sort((a, b) => (b.id || 0) - (a.id || 0));
      for (const c of listOrdenada) {
        const $card = await buildCaronaCard(c);
        $container.append($card);
      }
    } catch {
      emptyState($container, 'bi bi-exclamation-triangle', 'Erro ao carregar caronas');
    }
  }

  function setupSearch() {
    const $btn = $('#btn-buscar');
    if (!$btn.length) return;
    $btn.on('click', async function () {
      const origem = $('#origem').val() ? String($('#origem').val()).trim() : '';
      const destino = $('#destino').val() ? String($('#destino').val()).trim() : '';
      const data = $('#data').val() || '';
      await searchCaronas(origem, destino, data);
    });
  }

  async function searchCaronas(origem, destino, data) {
    const $container = $('#caronas-container');
    if (!$container.length) return;
    try {
      const caronas = await fetchJSON(`${API_BASE}/caronas`);
      const selectedCommunityId = Number(localStorage.getItem("selectedCommunityId"));
      
      let filtered = caronas;
      if (selectedCommunityId) {
        filtered = caronas.filter(c => c.comunidadeId === selectedCommunityId);
      }
      
      filtered = filtered.filter(c => (c.statusViagem || 'agendada') === 'agendada');
      if (origem) filtered = filtered.filter(c => c.rota?.origem?.toLowerCase().includes(origem.toLowerCase()));
      if (destino) filtered = filtered.filter(c => c.rota?.destino?.toLowerCase().includes(destino.toLowerCase()));
      if (data) {
        const searchDate = new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        filtered = filtered.filter(c => c.data === searchDate);
      }
      clear($container);
      if (!filtered.length) {
        emptyState($container, 'bi bi-search', 'Nenhuma carona encontrada com os critérios de busca', '#d1d5db');
        return;
      }
      const filteredOrdenado = filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
      for (const c of filteredOrdenado) {
        const $card = await buildCaronaCard(c);
        $container.append($card);
      }
    } catch {
      emptyState($container, 'bi bi-exclamation-triangle', 'Erro ao buscar caronas');
    }
  }

  async function setupButtons() {
    const $pedir = $('#btn-pedir-carona');
    const $oferecer = $('#btn-oferecer-carona');
    if ($pedir.length) $pedir.on('click', () => { window.location.href = 'pedir-carona.html'; });
    if ($oferecer.length) {
      $oferecer.on('click', async () => {
        const currentUserId = Number(localStorage.getItem("userId"));
        if (!currentUserId) {
          Swal.fire('Erro', 'Usuário não está logado.', 'error');
          return;
        }

        try {
          const veiculos = await fetchJSON(`${API_BASE}/vehicles?motoristaId=${currentUserId}`);
          if (!veiculos || veiculos.length === 0) {
            const result = await Swal.fire({
              title: 'Veículo não cadastrado',
              text: 'Você precisa ter pelo menos um veículo cadastrado para oferecer uma carona.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Ir para cadastrar veículo',
              cancelButtonText: 'Fechar',
              confirmButtonColor: '#198754'
            });

            if (result.isConfirmed) {
              window.location.href = '/pages/user/editar.html';
            }
            return;
          }

          window.location.href = 'oferecer-carona.html';
        } catch {
          Swal.fire('Erro', 'Não foi possível verificar seus veículos cadastrados.', 'error');
        }
      });
    }
  }


  async function oferecerCarona(caronaId) {
    try {
      const currentUserId = Number(localStorage.getItem("userId"));
      if (!currentUserId) {
        Swal.fire('Erro', 'Usuário não está logado.', 'error');
        return;
      }

      const carona = await fetchJSON(`${API_BASE}/caronas/${caronaId}`);
      
      if (carona.tipo === 'pedindo') {
        const temVeiculo = await verificarVeiculosUsuario();
        if (!temVeiculo) {
          const result = await Swal.fire({
            title: 'Veículo não cadastrado',
            text: 'Você precisa ter pelo menos um veículo cadastrado para se candidatar.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ir para cadastrar veículo',
            cancelButtonText: 'Fechar',
            confirmButtonColor: '#198754'
          });

          if (result.isConfirmed) {
            window.location.href = '/pages/user/editar.html';
          }
          return;
        }

        const motoristasCandidatos = carona.motoristasCandidatos || [];
        const jaCandidatou = motoristasCandidatos.some(m => m.motoristaId === currentUserId);
        
        if (jaCandidatou) {
          Swal.fire('Aviso', 'Você já se candidatou a esta carona.', 'info');
          return;
        }

        if (carona.motoristaId) {
          Swal.fire('Aviso', 'Esta carona já tem um motorista aprovado.', 'warning');
          return;
        }

        const result = await Swal.fire({
          title: 'Se candidatar',
          text: 'Deseja se candidatar para ser o motorista desta carona?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sim, me candidatar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          const novoCandidato = {
            motoristaId: currentUserId,
            status: "pendente",
            timestamp: Date.now()
          };
          
          await fetchJSON(`${API_BASE}/caronas/${caronaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              motoristasCandidatos: [...motoristasCandidatos, novoCandidato]
            })
          });
          
          Swal.fire('Sucesso!', 'Sua candidatura foi enviada. Aguarde a aprovação do passageiro.', 'success').then(() => {
            loadCaronas();
          });
        }
        return;
      }

      const temVeiculo = await verificarVeiculosUsuario();
      if (!temVeiculo) {
        const result = await Swal.fire({
          title: 'Veículo não cadastrado',
          text: 'Você precisa ter pelo menos um veículo cadastrado para oferecer uma carona.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ir para cadastrar veículo',
          cancelButtonText: 'Fechar',
          confirmButtonColor: '#198754'
        });

        if (result.isConfirmed) {
          window.location.href = '/pages/user/editar.html';
        }
        return;
      }

    } catch (err) {
      Swal.fire('Erro', 'Não foi possível carregar os dados da carona.', 'error');
    }
  }

  async function excluirCarona(caronaId) {
    try {
      const carona = await fetchJSON(`${API_BASE}/caronas/${caronaId}`);
      const currentUserId = Number(localStorage.getItem("userId"));
      
      const isCriadorPedindo = carona.tipo === 'pedindo' && carona.passageiroId === currentUserId;
      const isMotoristaOferecendo = carona.tipo === 'oferecendo' && carona.motoristaId === currentUserId;
      const temPassageirosAprovados = carona.passageiros && carona.passageiros.some(p => p.status === 'aprovado');
      
      if (isMotoristaOferecendo && temPassageirosAprovados) {
        Swal.fire('Atenção', 'Não é possível excluir esta carona pois já há passageiros aprovados. Use "Cancelar viagem" em vez disso.', 'warning');
        return;
      }

      const result = await Swal.fire({
        title: 'Excluir carona?',
        text: 'Tem certeza que deseja excluir esta carona? Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
      });

      if (result.isConfirmed) {
        await fetchJSON(`${API_BASE}/caronas/${caronaId}`, {
          method: 'DELETE'
        });
        
        Swal.fire('Excluída!', 'Carona excluída com sucesso.', 'success').then(() => {
          loadCaronas();
        });
      }
    } catch {
      Swal.fire('Erro', 'Não foi possível excluir a carona.', 'error');
    }
  }

  async function saveCaronaToDatabase(caronaData) {
    if (!caronaData.usuario) caronaData.usuario = getCurrentUser();
    if (!caronaData.id) caronaData.id = Date.now();
    return await fetchJSON(`${API_BASE}/caronas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caronaData)
    });
  }

  function toggleRetornoFieldsEdit(tipo) {
    if (tipo === 'pedido') {
      const $check = $('#precisa-retorno');
      const $wrap = $('#retorno-fields-pedido, #retorno-fields');
      if ($check.length && $wrap.length) $wrap.css('display', $check.is(':checked') ? 'block' : 'none');
    } else if (tipo === 'oferta') {
      const $check = $('#incluir-retorno');
      const $wrap = $('#retorno-fields-oferta, #retorno-fields');
      if ($check.length && $wrap.length) $wrap.css('display', $check.is(':checked') ? 'block' : 'none');
    }
  }

  async function loadPedidoData(id) {
    try {
      const pedido = await fetchJSON(`${API_BASE}/caronas/${id}`);
      if (!pedido) return;
      const $origem = $('#origem-pedido, #origem');
      const $destino = $('#destino-pedido, #destino');
      const $data = $('#data-pedido, #data');
      const $hora = $('#horario-pedido, #horario');
      const $cid = $('#carona-id');
      if ($origem.length) $origem.val(pedido.rota && pedido.rota.origem ? pedido.rota.origem : '');
      if ($destino.length) $destino.val(pedido.rota && pedido.rota.destino ? pedido.rota.destino : '');
      if ($data.length) $data.val(pedido.data || '');
      if ($hora.length) $hora.val(pedido.horario || '');
      if ($cid.length) $cid.val(pedido.id || '');
      if (pedido.tipoCarona === 'emergencial') {
        $('#carona-emergencial').prop('checked', true);
        const $motivo = $('#motivo-emergencial-pedido');
        if ($motivo.length) $motivo.val(pedido.motivo || '');
      } else {
        $('#carona-comum').prop('checked', true);
      }
      toggleCaronaType();
      if ($('input[name="precisa-retorno"]').length) {
        if (pedido.precisaRetorno) {
          $('#precisa-retorno').prop('checked', true);
          $('#data-retorno-pedido, #data-retorno').val(pedido.dataRetorno || '');
          $('#horario-retorno-pedido, #horario-retorno').val(pedido.horarioRetorno || '');
        } else {
          $('#nao-precisa-retorno').prop('checked', true);
        }
      }
      toggleRetornoFieldsEdit('pedido');
    } catch (e) { }
  }

  async function loadOfertaData(id) {
    try {
      const oferta = await fetchJSON(`${API_BASE}/caronas/${id}`);
      if (!oferta) return;
      const $origem = $('#origem-oferta, #origem');
      const $destino = $('#destino-oferta, #destino');
      const $data = $('#data-oferta, #data');
      const $hora = $('#horario-oferta, #horario');
      const $cid = $('#carona-id-oferta');
      if ($origem.length) $origem.val(oferta.rota && oferta.rota.origem ? oferta.rota.origem : '');
      if ($destino.length) $destino.val(oferta.rota && oferta.rota.destino ? oferta.rota.destino : '');
      if ($data.length) $data.val(oferta.data || '');
      if ($hora.length) $hora.val(oferta.horario || '');
      if ($cid.length) $cid.val(oferta.id || '');
      const $vehicle = $('#rideVehicle');
      const $seats = $('#rideSeats');
      if ($vehicle.length) {
        if (!$vehicle.attr('name')) $vehicle.attr('name', 'veiculo');
        $vehicle.val(oferta.veiculo || '');
      }
      if ($seats.length) {
        if (!$seats.attr('name')) $seats.attr('name', 'vagas');
        $seats.val(oferta.vagas || 1);
      }
      if ($('input[name="custo"]').length) {
        if (oferta.custo === 'Viagem gratuita') $('#custo-gratuito').prop('checked', true);
        else if (oferta.custo === 'Com divisão de custos') $('#custo-divisao').prop('checked', true);
      }
      if ($('input[name="pode-encomendas"]').length) {
        if (oferta.podeTrazerEncomendas) $('#pode-encomendas-sim').prop('checked', true);
        else $('#pode-encomendas-nao').prop('checked', true);
      }
      if ($('input[name="incluir-retorno"]').length) {
        if (oferta.incluiRetorno) {
          $('#incluir-retorno').prop('checked', true);
          $('#data-retorno-oferta, #data-retorno').val(oferta.dataRetorno || '');
          $('#horario-retorno-oferta, #horario-retorno').val(oferta.horarioRetorno || '');
        } else {
          $('#nao-incluir-retorno').prop('checked', true);
        }
      }
      toggleRetornoFieldsEdit('oferta');
    } catch (e) { }
  }

  async function detectCaronaType(id) {
    try {
      const carona = await fetchJSON(`${API_BASE}/caronas/${id}`);
      if (carona && carona.tipo === 'pedindo') {
        showPedidoForm();
        await loadPedidoData(id);
      } else {
        showOfertaForm();
        await loadOfertaData(id);
      }
    } catch (e) { }
  }

  function showPedidoForm() {
    const $loading = $('#loading-message');
    const $pedido = $('#form-pedido-container');
    const $oferta = $('#form-oferta-container');
    const $title = $('#page-title');
    if ($loading.length) $loading.css('display', 'none');
    if ($pedido.length) $pedido.css('display', 'block');
    if ($oferta.length) $oferta.css('display', 'none');
    if ($title.length) { clear($title); $title.append($('<strong>').text('Editar Pedido de Carona')); }
  }

  function showOfertaForm() {
    const $loading = $('#loading-message');
    const $pedido = $('#form-pedido-container');
    const $oferta = $('#form-oferta-container');
    const $title = $('#page-title');
    if ($loading.length) $loading.css('display', 'none');
    if ($pedido.length) $pedido.css('display', 'none');
    if ($oferta.length) $oferta.css('display', 'block');
    if ($title.length) { clear($title); $title.append($('<strong>').text('Editar Oferta de Carona')); }
  }

  async function loadVehicles() {
    try {
      const currentUserId = Number(localStorage.getItem("userId"));
      const veiculos = await fetchJSON(`${API_BASE}/vehicles?motoristaId=${currentUserId}`);
      const $select = $('#rideVehicle');
      if (!$select.length) return;
      if (!$select.attr('name')) $select.attr('name', 'veiculo');
      $select.find('option:not(:first)').remove();
      veiculos.forEach(v => {
        const tipoTexto = v.type === 'CAR' ? 'Carro' : 'Motocicleta';
        const texto = `${tipoTexto} - ${v.brand} ${v.model} (${v.licensePlate})`;
        const $opt = $('<option>').attr('value', v.type === 'CAR' ? 'carro' : 'moto')
          .attr('data-seats', v.availableSeats)
          .text(texto);
        $select.append($opt);
      });

      $select.off('change').on('change', function () {
        const $option = $(this).find('option:selected');
        const maxSeats = parseInt($option.data('seats')) || 4;
        const $seats = $('#rideSeats');
        if ($seats.length) {
          $seats.attr('max', maxSeats);
          if (parseInt($seats.val()) > maxSeats) {
            $seats.val(maxSeats);
          }
          $seats.prop('disabled', false);
        }
      });
    } catch {}
  }

  async function loadLocaisComunidade() {
    try {
      const selectedCommunityId = Number(localStorage.getItem("selectedCommunityId"));
      const selectedCommunityName = localStorage.getItem("selectedCommunity");
      if (!selectedCommunityId && !selectedCommunityName) return [];

      const locais = await fetchJSON(`${API_BASE}/locais`);
      return locais.filter(local => {
        if (local.comunidadeId === selectedCommunityId) return true;
        if (selectedCommunityName && local.comunidade === selectedCommunityName) return true;
        return false;
      });
    } catch (error) {
      console.error("Erro ao carregar locais:", error);
      return [];
    }
  }

  async function setupLocaisSelects() {
    const locais = await loadLocaisComunidade();
    
    const selectIds = [
      '#origem-select',
      '#destino-select',
      '#origem-emergencial-select',
      '#destino-emergencial-select'
    ];

    selectIds.forEach(selectId => {
      const $select = $(selectId);
      if (!$select.length) return;

      $select.find('option:not(:first)').remove();

      locais.forEach(local => {
        const $option = $('<option>')
          .val(local.nome)
          .text(`${local.nome}${local.tipo ? ' - ' + local.tipo : ''}`)
          .data('endereco', local.endereco || local.nome);
        $select.append($option);
      });

      const $outroOption = $('<option>')
        .val('outro')
        .text('Outro (digite manualmente)');
      $select.append($outroOption);

      const $container = $select.parent('.input-with-icon');
      const $input = $container.find('input[type="text"]').first();
      
      if (!$input.length) {
        console.warn(`Input não encontrado para ${selectId}`);
        return;
      }
      
      $input.removeAttr('style');
      $select.removeAttr('style');
      
      $select.css({
        'width': '100%',
        'padding': $input.css('padding') || '0.375rem 0.75rem',
        'font-size': $input.css('font-size') || '1rem',
        'border': $input.css('border') || '1px solid #ced4da',
        'border-radius': $input.css('border-radius') || '0.375rem'
      });
      
      if (locais.length === 0) {
        $select.hide();
        $input.show().attr('required', true);
      } else {
        $select.show();
        $input.hide().removeAttr('required');
      }
      
      $select.off('change').on('change', function() {
        const selectedValue = $(this).val();
        
        if (selectedValue === 'outro') {
          $select.css('display', 'none');
          $input.removeAttr('style');
          $input.css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1'
          });
          $input.val('').attr('required', true).prop('disabled', false).prop('readonly', false);
          
          setTimeout(() => {
            if ($input.is(':visible')) {
              $input.focus();
            }
          }, 150);
        } else if (selectedValue) {
          const endereco = $(this).find('option:selected').data('endereco') || $(this).val();
          $input.val(endereco).removeAttr('required');
          $select.css('display', 'block');
          $input.css('display', 'none');
        } else {
          $select.css('display', 'none');
          $input.removeAttr('style').css('display', 'block').val('').attr('required', true);
        }
      });
    });
  }

  function setupPedirCaronaForm() {
    const $form = $('#form-pedir-carona');
    if (!$form.length) return;

    setupLocaisSelects();

    function setDataHoraEmergencial() {
      const agora = new Date();
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      const dataFormatada = agora.toLocaleDateString('pt-BR');
      $('#data-emergencial').val(dataFormatada);
      $('#horario-emergencial-value').val(`${hora}:${minuto}`);
    }

    $('input[name="tipo-carona"]').on('change', function () {
      toggleCaronaType();
      if ($(this).val() === 'emergencial') setDataHoraEmergencial();
    });

    toggleCaronaType();
    if ($('input[name="tipo-carona"]:checked').val() === 'emergencial') setDataHoraEmergencial();

    if (!$('#data').attr('name')) $('#data').attr('name', 'data');
    if (!$('#horario').attr('name')) $('#horario').attr('name', 'horario');
    if (!$('#origem').attr('name')) $('#origem').attr('name', 'origem');
    if (!$('#destino').attr('name')) $('#destino').attr('name', 'destino');
    if (!$('#data-retorno').attr('name')) $('#data-retorno').attr('name', 'data-retorno');
    if (!$('#horario-retorno').attr('name')) $('#horario-retorno').attr('name', 'horario-retorno');

    if (!$('#data-emergencial').attr('name')) $('#data-emergencial').attr('name', 'data-emergencial');
    if (!$('#origem-emergencial').attr('name')) $('#origem-emergencial').attr('name', 'origem-emergencial');
    if (!$('#destino-emergencial').attr('name')) $('#destino-emergencial').attr('name', 'destino-emergencial');
    if (!$('#motivo-emergencial').attr('name')) $('#motivo-emergencial').attr('name', 'motivo-emergencial');

    maskDate('#data, #data-retorno, #data-emergencial');
    maskTime('#horario, #horario-retorno');

    toggleReturnFields($('#precisa-retorno'), $('#nao-precisa-retorno'), $('#retorno-fields'));

    baseValidationConfig($form, 'pedido');

    $form.on('submit', async function (e) {
      e.preventDefault();

      const tipoCarona = $('input[name="tipo-carona"]:checked').val() || 'comum';

      if (tipoCarona === 'emergencial') {
        const $validator = $form.data('validator');
        if ($validator) {
          const validEmergencial = $validator.element('#origem-emergencial') &&
            $validator.element('#destino-emergencial') &&
            $validator.element('#data-emergencial') &&
            $validator.element('#motivo-emergencial');
          if (!validEmergencial) return;
        }
      } else {
        if (!$form.valid()) return;
      }

      const fd = new FormData($form[0]);
      const currentUser = getCurrentUser();

      let data;

      const comunidadeId = Number(localStorage.getItem("selectedCommunityId")) || null;
      if (tipoCarona === 'emergencial') {
        const agora = new Date();
        const hora = String(agora.getHours()).padStart(2, '0');
        const minuto = String(agora.getMinutes()).padStart(2, '0');
        const horarioAtual = fd.get('horario-emergencial-value') || `${hora}:${minuto}`;
        const dataFormatada = fd.get('data-emergencial') || agora.toLocaleDateString('pt-BR');
        const currentUserId = Number(localStorage.getItem("userId"));
        data = {
          tipo: 'pedindo',
          usuario: currentUser,
          criadorId: currentUserId, 
          passageiroId: currentUserId,
          motoristaId: null,
          comunidadeId: comunidadeId,
          rota: {
            origem: $('#origem-emergencial-select').val() === 'outro' 
              ? fd.get('origem-emergencial') 
              : ($('#origem-emergencial-select').val() || fd.get('origem-emergencial') || fd.get('origem')),
            destino: $('#destino-emergencial-select').val() === 'outro'
              ? fd.get('destino-emergencial')
              : ($('#destino-emergencial-select').val() || fd.get('destino-emergencial') || fd.get('destino'))
          },
          data: dataFormatada,
          horario: horarioAtual,
          tipoCarona: 'emergencial',
          motivo: fd.get('motivo-emergencial'),
          precisaRetorno: false,
          dataRetorno: '',
          horarioRetorno: '',
          motoristasCandidatos: [], 
          passageiros: [],
          encomendas: [],
          statusViagem: 'agendada'
        };
      } else {
        const currentUserId = Number(localStorage.getItem("userId"));
        data = {
          tipo: 'pedindo',
          usuario: currentUser,
          criadorId: currentUserId,
          passageiroId: currentUserId,
          motoristaId: null,
          comunidadeId: comunidadeId,
          rota: { 
            origem: $('#origem-select').val() === 'outro' 
              ? fd.get('origem') 
              : ($('#origem-select').val() || fd.get('origem')),
            destino: $('#destino-select').val() === 'outro'
              ? fd.get('destino')
              : ($('#destino-select').val() || fd.get('destino'))
          },
          data: fd.get('data'),
          horario: fd.get('horario'),
          tipoCarona: 'comum',
          precisaRetorno: fd.get('precisa-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno'),
          motoristasCandidatos: [],
          passageiros: [],
          encomendas: [],
          statusViagem: 'agendada'
        };
      }

      try {
        const saved = await saveCaronaToDatabase(data);
        Swal.fire('Sucesso!', 'Pedido de carona criado com sucesso.', 'success').then(() => {
          window.location.href = 'index.html';
        });
      } catch {
        Swal.fire('Erro!', 'Não foi possível criar o pedido de carona.', 'error');
      }
    });
  }

  async function verificarVeiculosUsuario() {
    const currentUserId = Number(localStorage.getItem("userId"));
    if (!currentUserId) return false;
    try {
      const veiculos = await fetchJSON(`${API_BASE}/vehicles?motoristaId=${currentUserId}`);
      return veiculos && veiculos.length > 0;
    } catch {
      return false;
    }
  }

  async function setupOferecerCaronaForm() {
    const $form = $('#form-oferecer-carona');
    if (!$form.length) return;

    await setupLocaisSelects();

    const temVeiculo = await verificarVeiculosUsuario();
    if (!temVeiculo) {
      const result = await Swal.fire({
        title: 'Veículo não cadastrado',
        text: 'Você precisa ter pelo menos um veículo cadastrado para oferecer uma carona.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ir para cadastrar veículo',
        cancelButtonText: 'Fechar',
        confirmButtonColor: '#198754'
      });

      if (result.isConfirmed) {
        window.location.href = '/pages/user/editar.html';
      } else {
        window.location.href = '/pages/caronas/index.html';
      }
      return;
    }

    if (!$('#data').attr('name')) $('#data').attr('name', 'data');
    if (!$('#horario').attr('name')) $('#horario').attr('name', 'horario');
    if (!$('#origem').attr('name')) $('#origem').attr('name', 'origem');
    if (!$('#destino').attr('name')) $('#destino').attr('name', 'destino');
    if (!$('#rideVehicle').attr('name')) $('#rideVehicle').attr('name', 'veiculo');
    if (!$('#rideSeats').attr('name')) $('#rideSeats').attr('name', 'vagas');
    if (!$('#data-retorno').attr('name')) $('#data-retorno').attr('name', 'data-retorno');
    if (!$('#horario-retorno').attr('name')) $('#horario-retorno').attr('name', 'horario-retorno');
    maskDate('#data, #data-retorno');
    maskTime('#horario, #horario-retorno');
    toggleReturnFields($('#incluir-retorno'), $('#nao-incluir-retorno'), $('#retorno-fields'));
    loadVehicles();
    baseValidationConfig($form, 'oferta');
    $form.on('submit', async function (e) {
      e.preventDefault();
      if (!$form.valid()) return;

      const temVeiculo = await verificarVeiculosUsuario();
      if (!temVeiculo) {
        const result = await Swal.fire({
          title: 'Veículo não cadastrado',
          text: 'Você precisa ter pelo menos um veículo cadastrado para oferecer uma carona.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ir para cadastrar veículo',
          cancelButtonText: 'Fechar',
          confirmButtonColor: '#198754'
        });

        if (result.isConfirmed) {
          window.location.href = '/pages/user/editar.html';
        }
        return;
      }

      const fd = new FormData($form[0]);
      
      const $selectedVehicle = $('#rideVehicle option:selected');
      const maxSeats = parseInt($selectedVehicle.data('seats')) || 0;
      const vagasSolicitadas = parseInt(fd.get('vagas')) || parseInt($('#rideSeats').val()) || 1;
      
      if (maxSeats > 0 && vagasSolicitadas > maxSeats) {
        Swal.fire({
          title: 'Quantidade de vagas inválida',
          text: 'O seu veículo não suporta essa quantidade, verifique a quantidade de vagas dele.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }
      const currentUserId = Number(localStorage.getItem("userId"));
      const currentUser = getCurrentUser();
      const comunidadeId = Number(localStorage.getItem("selectedCommunityId")) || null;
      const data = {
        tipo: 'oferecendo',
        usuario: currentUser,
        criadorId: currentUserId, 
        motoristaId: currentUserId, 
        comunidadeId: comunidadeId,
        rota: { 
          origem: $('#origem-select').val() === 'outro' 
            ? fd.get('origem') 
            : ($('#origem-select').val() || fd.get('origem')),
          destino: $('#destino-select').val() === 'outro'
            ? fd.get('destino')
            : ($('#destino-select').val() || fd.get('destino'))
        },
        data: fd.get('data'),
        horario: fd.get('horario'),
        veiculo: fd.get('veiculo') || $('#rideVehicle').val() || '',
        vagas: vagasSolicitadas,
        custo: fd.get('custo') === 'gratuito' ? 'Viagem gratuita' : fd.get('custo') === 'divisao' ? 'Com divisão de custos' : fd.get('custo') === 'fixo' ? `R$ ${fd.get('valor-fixo')} por pessoa` : '',
        podeTrazerEncomendas: fd.get('pode-encomendas') === 'sim',
        incluiRetorno: fd.get('incluir-retorno') === 'sim',
        dataRetorno: fd.get('data-retorno'),
        horarioRetorno: fd.get('horario-retorno'),
        passageiros: [],
        encomendas: [],
        statusViagem: 'agendada'
      };
      try {
        const saved = await saveCaronaToDatabase(data);
        Swal.fire('Sucesso!', 'Carona criada com sucesso.', 'success').then(() => {
          window.location.href = 'index.html';
        });
      } catch {
        Swal.fire('Erro!', 'Não foi possível criar a carona.', 'error');
      }
    });
  }

  async function initializeEditCarona() {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id') || params.get('carona-id');
    const tipo = params.get('tipo');

    if (!id) {
      if (params.has('origem') || params.has('destino')) {
        Swal.fire('Erro', 'O formulário foi submetido incorretamente. Por favor, use o botão de editar para acessar esta página.', 'error').then(() => {
          window.location.href = 'index.html';
        });
        return;
      }
      Swal.fire('Erro', 'Carona não encontrada (ID ausente na URL).', 'error');
      return;
    }

    try {
      const carona = await fetchJSON(`${API_BASE}/caronas/${id}`);
      const currentUserId = Number(localStorage.getItem("userId"));
      
      if (carona.criadorId !== currentUserId) {
        Swal.fire('Atenção', 'Você não tem permissão para editar esta carona.', 'warning').then(() => {
          window.location.href = 'index.html';
        });
        return;
      }
    } catch (e) {
      Swal.fire('Erro', 'Não foi possível verificar as permissões.', 'error');
      return;
    }

    if (tipo === 'pedindo') {
      showPedidoForm();
      loadPedidoData(id);
    } else if (tipo === 'oferecendo') {
      showOfertaForm();
      loadOfertaData(id);
    } else {
      detectCaronaType(id);
    }
    setupFormHandlers(id);
  }

  function setupFormHandlers(id) {
    const $formPedido = $('#form-editar-pedido');
    const $formOferta = $('#form-editar-oferta');


    if ($formPedido.length) {
      maskDate('#data-pedido, #data-retorno-pedido');
      maskTime('#horario-pedido, #horario-retorno-pedido');

      $('input[name="tipo-carona"]').on('change', function () {
        toggleCaronaType();
        const validator = $formPedido.data('validator');
        if (validator) {
          const isEmergencial = $(this).val() === 'emergencial';
          const $motivo = $('#motivo-emergencial-pedido');
          if ($motivo.length) {
            if (isEmergencial) {
              $motivo.rules('add', { required: true });
            } else {
              $motivo.rules('remove');
            }
          }
        }
      });

      baseValidationConfig($formPedido, 'pedido');

      setTimeout(() => {
        const validator = $formPedido.data('validator');
        if (validator && $('#motivo-emergencial-pedido').length) {
          $('#motivo-emergencial-pedido').rules('add', {
            required: function () {
              return $('input[name="tipo-carona"]:checked').val() === 'emergencial';
            },
            messages: {
              required: 'O motivo da carona é obrigatório'
            }
          });
        }
      }, 100);

      $formPedido[0].onsubmit = null;
      $formPedido.off('submit.caronaHandler').on('submit.caronaHandler', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const validator = $formPedido.data('validator');
        if (validator && !$formPedido.valid()) {
          return false;
        }

        const fd = new FormData($formPedido[0]);
        const caronaAtual = await fetchJSON(`${API_BASE}/caronas/${id}`);
        const currentUserId = Number(localStorage.getItem("userId"));
        const data = {
          tipo: 'pedindo',
          usuario: getCurrentUser(),
          criadorId: caronaAtual.criadorId || currentUserId, 
          passageiroId: currentUserId,
          motoristaId: caronaAtual.motoristaId || null,
          rota: { 
            origem: $('#origem-select').val() === 'outro' 
              ? fd.get('origem') 
              : ($('#origem-select').val() || fd.get('origem')),
            destino: $('#destino-select').val() === 'outro'
              ? fd.get('destino')
              : ($('#destino-select').val() || fd.get('destino'))
          },
          data: fd.get('data'),
          horario: fd.get('horario'),
          tipoCarona: fd.get('tipo-carona') || 'comum',
          motivo: fd.get('tipo-carona') === 'emergencial' ? fd.get('motivo-emergencial') : undefined,
          precisaRetorno: fd.get('precisa-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno'),
          motoristasCandidatos: caronaAtual.motoristasCandidatos || [],
          passageiros: caronaAtual.passageiros || [],
          encomendas: caronaAtual.encomendas || [],
          statusViagem: caronaAtual.statusViagem || 'agendada'
        };
        try {
          await fetchJSON(`${API_BASE}/caronas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          Swal.fire('Sucesso!', 'Pedido atualizado com sucesso.', 'success').then(() => {
            window.location.href = 'index.html';
          });
        } catch {
          Swal.fire('Erro!', 'Não foi possível salvar as alterações.', 'error');
        }
        return false;
      });
    }
    if ($formOferta.length) {
      maskDate('#data-oferta, #data-retorno-oferta');
      maskTime('#horario-oferta, #horario-retorno-oferta');
      if (!$('#rideVehicle').attr('name')) $('#rideVehicle').attr('name', 'veiculo');
      if (!$('#rideSeats').attr('name')) $('#rideSeats').attr('name', 'vagas');
      loadVehicles();
      baseValidationConfig($formOferta, 'oferta');

      $formOferta[0].onsubmit = null;
      $formOferta.off('submit.caronaHandler').on('submit.caronaHandler', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        const validator = $formOferta.data('validator');
        if (validator && !$formOferta.valid()) {
          return false;
        }

        const fd = new FormData($formOferta[0]);
        
        const $selectedVehicle = $('#rideVehicle option:selected');
        const maxSeats = parseInt($selectedVehicle.data('seats')) || 0;
        const vagasSolicitadas = parseInt(fd.get('vagas')) || parseInt($('#rideSeats').val()) || 1;
        
        if (maxSeats > 0 && vagasSolicitadas > maxSeats) {
          Swal.fire({
            title: 'Quantidade de vagas inválida',
            text: 'O seu veículo não suporta essa quantidade, verifique a quantidade de vagas dele.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return false;
        }
        
        const caronaAtual = await fetchJSON(`${API_BASE}/caronas/${id}`);
        const currentUserId = Number(localStorage.getItem("userId"));
        const data = {
          tipo: 'oferecendo',
          usuario: getCurrentUser(),
          criadorId: caronaAtual.criadorId || currentUserId, 
          motoristaId: currentUserId, 
          rota: { 
            origem: $('#origem-select').val() === 'outro' 
              ? fd.get('origem') 
              : ($('#origem-select').val() || fd.get('origem')),
            destino: $('#destino-select').val() === 'outro'
              ? fd.get('destino')
              : ($('#destino-select').val() || fd.get('destino'))
          },
          data: fd.get('data'),
          horario: fd.get('horario'),
          veiculo: fd.get('veiculo') || $('#rideVehicle').val() || '',
          vagas: vagasSolicitadas,
          custo: fd.get('custo') === 'gratuito' ? 'Viagem gratuita' : fd.get('custo') === 'divisao' ? 'Com divisão de custos' : fd.get('custo') === 'fixo' ? `R$ ${fd.get('valor-fixo')} por pessoa` : '',
          podeTrazerEncomendas: fd.get('pode-encomendas') === 'sim',
          incluiRetorno: fd.get('incluir-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno'),
          passageiros: caronaAtual.passageiros || [],
          encomendas: caronaAtual.encomendas || [],
          statusViagem: caronaAtual.statusViagem || 'agendada'
        };
        try {
          await fetchJSON(`${API_BASE}/caronas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          Swal.fire('Sucesso!', 'Carona atualizada com sucesso.', 'success').then(() => {
            window.location.href = 'index.html';
          });
        } catch {
          Swal.fire('Erro!', 'Não foi possível salvar as alterações.', 'error');
        }
        return false;
      });
    }
    const $precisa = $('#precisa-retorno');
    const $naoPrecisa = $('#nao-precisa-retorno');
    const $incluir = $('#incluir-retorno');
    const $naoIncluir = $('#nao-incluir-retorno');
    if ($precisa.length && $naoPrecisa.length) {
      $precisa.on('change', () => toggleRetornoFieldsEdit('pedido'));
      $naoPrecisa.on('change', () => toggleRetornoFieldsEdit('pedido'));
    }
    if ($incluir.length && $naoIncluir.length) {
      $incluir.on('change', () => toggleRetornoFieldsEdit('oferta'));
      $naoIncluir.on('change', () => toggleRetornoFieldsEdit('oferta'));
    }
  }


  window.addEventListener('communityChanged', () => {
    const path = window.location.pathname;
    if (path.includes('caronas/index.html')) {
      loadCaronas();
    } else if (path.includes('pedir-carona.html') || path.includes('oferecer-carona.html')) {
      setupLocaisSelects();
    }
  });

  async function route() {
    const path = window.location.pathname;
    if (path.includes('caronas/index.html')) {
      loadCaronas();
      setupFilters();
      setupSearch();
      await setupButtons();
    } else if (path.includes('editar-carona.html')) {
      initializeEditCarona();
    } else if (path.includes('pedir-carona.html')) {
      setupPedirCaronaForm();
    } else if (path.includes('oferecer-carona.html')) {
      await setupOferecerCaronaForm();
    } else {
      if ($('#page-title').length) {
        initializeEditCarona();
      }
    }
  }

  route();
});