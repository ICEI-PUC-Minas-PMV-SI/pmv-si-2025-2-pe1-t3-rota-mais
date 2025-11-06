$(function () {
  const API_URL = 'http://localhost:3000';


  if (typeof $.validator !== 'undefined' && $.validator.methods) {
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
  } else {
    setTimeout(function () {
      if (typeof $.validator !== 'undefined' && $.validator.methods) {
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
      }
    }, 100);
  }

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
    const saved = localStorage.getItem('currentUser');
    if (saved) return JSON.parse(saved);
    const def = { nome: 'João Silva', avatar: 'https://static.vecteezy.com/system/resources/thumbnails/019/879/186/small_2x/user-icon-on-transparent-background-free-png.png', email: '' };
    localStorage.setItem('currentUser', JSON.stringify(def));
    return def;
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

  function hasReturn() {
    if ($('input[name="precisa-retorno"]:checked')) {
      $('#retorno-fields').show();
    } else {
      $('#retorno-fields').hide();
    }
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
    addRule('data', { required: true }, 'A data é obrigatória');
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
        }
      }, 'A data de retorno é obrigatória');
      addRule('horario-retorno', {
        required: function () {
          const precisa = $('input[name="precisa-retorno"]:checked').val();
          return precisa === 'sim';
        },
        pattern: /^([0-1]\d|2[0-3]):([0-5]\d)$/
      }, 'O horário de retorno é obrigatório e deve estar no formato HH:MM');

      addRule('origem-emergencial', { required: true }, 'O local de partida é obrigatório');
      addRule('destino-emergencial', { required: true }, 'O local de destino é obrigatório');
      addRule('data-emergencial', { required: true }, 'A data é obrigatória');
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
        }
      }, 'A data de retorno é obrigatória');
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
    } catch (error) {
      console.error('Erro ao configurar validação:', error);
      return null;
    }
  }

  function buildCaronaCard(carona) {
    const tipo = carona.tipo === 'oferecendo' ? 'oferecendo' : 'pedindo';
    const user = carona.usuario || getCurrentUser();
    const action = tipo === 'oferecendo' ? 'está oferecendo uma carona' : 'está pedindo uma carona';
    const $card = el('div', 'carona-card p-4 rounded mb-3 position-relative');

    const agora = Date.now();
    const idadeCarona = agora - (carona.id || 0);
    const ehRecente = idadeCarona < 300000;

    if (ehRecente || carona.tipoCarona === 'emergencial') {
      $card.css({
        'border-left': '5px solid #dc3545',
        'background-color': '#ffeaea',
        'border': '2px solid #dc3545',
        'box-shadow': '0 2px 8px rgba(220, 53, 69, 0.2)'
      });

      const badgeText = carona.tipoCarona === 'emergencial' ? 'Emergencial' : 'Nova';
      const $badge = $('<span>').addClass('badge bg-danger').css({
        'position': 'absolute',
        'top': '10px',
        'right': '10px',
        'font-size': '0.75rem',
        'z-index': '10'
      }).text(badgeText);
      $card.prepend($badge);
    }

    const $header = el('div', 'd-flex align-items-center gap-2 mb-3');
    const $img = $('<img>').addClass('user-avatar-card').attr('src', user.avatar).attr('alt', user.nome || 'Usuário');
    const $user = el('span', 'carona-user', `${user.nome || 'Usuário'} ${action}`);
    $header.append($img, $user);
    const $rota = el('div', `carona-rota ${tipo} d-flex align-items-center gap-2 mb-3`);
    const $h2 = el('h2');
    const origem = carona.rota && carona.rota.origem ? carona.rota.origem : '';
    const destino = carona.rota && carona.rota.destino ? carona.rota.destino : '';
    const $h2Text1 = document.createTextNode('De ');
    const $strongOrigem = $('<strong>').text(origem);
    const $h2Text2 = document.createTextNode(' para ');
    const $strongDestino = $('<strong>').text(destino);
    $h2.append($h2Text1, $strongOrigem[0], $h2Text2, $strongDestino[0]);
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
    const $editBtn = el('button', 'btn btn-success d-flex align-items-center gap-2 rounded-3 border-0 p-2');
    $editBtn.attr('type', 'button');
    $editBtn.append(icon('bi bi-pencil'), el('span', null, 'Editar'));
    $editBtn.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = `editar-carona.html?id=${carona.id}&tipo=${carona.tipo}`;
    });
    const $actionBtn = el('button', `${tipo === 'oferecendo' ? 'btn-participar' : 'btn-oferecer'} d-flex align-items-center gap-2 rounded-3 border-0 p-2`);
    $actionBtn.attr('type', 'button');
    if (tipo === 'oferecendo') {
      $actionBtn.append(icon('bi bi-check-circle'), el('span', null, ' Participar da viagem'));
      $actionBtn.on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        participarViagem(carona.id);
      });
    } else {
      $actionBtn.append(icon('bi bi-car-front'), el('span', null, ' Oferecer carona'));
      $actionBtn.on('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        oferecerCarona(carona.id);
      });
    }
    $btns.append($detailsBtn, $editBtn, $actionBtn);
    $card.append($header, $rota, $details);
    if ($custo) $card.append($custo);
    $card.append($btns);
    return $card;
  }

  async function loadCaronas() {
    const $container = $('#caronas-container');
    if (!$container.length) return;
    try {
      const caronas = await fetchJSON(`${API_URL}/caronas`);
      clear($container);
      if (!caronas.length) {
        emptyState($container, 'bi bi-car-front', 'Nenhuma carona disponível no momento', '#d1d5db');
        return;
      }
      const caronasOrdenadas = caronas.sort((a, b) => (b.id || 0) - (a.id || 0));
      caronasOrdenadas.forEach(c => $container.append(buildCaronaCard(c)));
    } catch (e) {
      emptyState($container, 'bi bi-exclamation-triangle', 'Erro ao carregar caronas');
    }
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
      const caronas = await fetchJSON(`${API_URL}/caronas`);
      const list = filter && filter !== 'todos' ? caronas.filter(c => c.tipo === filter) : caronas;
      clear($container);
      if (!list.length) {
        const msg = filter === 'oferecendo' ? 'Nenhuma oferta de carona disponível' : filter === 'pedindo' ? 'Nenhum pedido de carona disponível' : 'Nenhuma carona disponível no momento';
        emptyState($container, 'bi bi-car-front', msg, '#d1d5db');
        return;
      }
      const listOrdenada = list.sort((a, b) => (b.id || 0) - (a.id || 0));
      listOrdenada.forEach(c => $container.append(buildCaronaCard(c)));
    } catch (e) { }
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
      const caronas = await fetchJSON(`${API_URL}/caronas`);
      let filtered = caronas;
      if (origem) filtered = filtered.filter(c => c.rota && c.rota.origem && c.rota.origem.toLowerCase().includes(origem.toLowerCase()));
      if (destino) filtered = filtered.filter(c => c.rota && c.rota.destino && c.rota.destino.toLowerCase().includes(destino.toLowerCase()));
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
      filteredOrdenado.forEach(c => $container.append(buildCaronaCard(c)));
    } catch (e) { }
  }

  function setupButtons() {
    const $pedir = $('#btn-pedir-carona');
    const $oferecer = $('#btn-oferecer-carona');
    if ($pedir.length) $pedir.on('click', () => { window.location.href = 'pedir-carona.html'; });
    if ($oferecer.length) $oferecer.on('click', () => { window.location.href = 'oferecer-carona.html'; });
  }

  async function getNomeCarona(id) {
    const c = await fetchJSON(`${API_URL}/caronas/${id}`);
    return c.usuario && c.usuario.nome ? c.usuario.nome : 'Usuário';
  }

  async function participarViagem(caronaId) {
    const nome = await getNomeCarona(caronaId);
    Swal.fire({
      title: 'Participar da Viagem',
      text: `Deseja participar da viagem de ${nome}?`,
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
      await fetchJSON(`${API_URL}/caronas/${caronaId}`);
      const nome = await getNomeCarona(caronaId);
      Swal.fire({
        title: 'Oferecer Carona',
        text: `Deseja oferecer carona para ${nome}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, oferecer',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Sucesso!', `Sua oferta foi enviada para ${nome}.`, 'success');
        }
      });
    } catch (err) {
      Swal.fire('Erro', 'Não foi possível carregar os dados da carona.', 'error');
    }
  }

  function getCustoText(tipo, valor) {
    if (tipo === 'gratuito') return 'Viagem gratuita';
    if (tipo === 'divisao') return 'Com divisão de custos';
    if (tipo === 'fixo') return `R$ ${valor} por pessoa`;
    return '';
  }

  async function saveCaronaToDatabase(caronaData) {
    if (caronaData.rota && caronaData.rota.origem && caronaData.rota.destino) {
      const origem = caronaData.rota.origem;
      const destino = caronaData.rota.destino;
      caronaData.subtitle = `De ${origem} para ${destino}`;
    }
    if (!caronaData.usuario) caronaData.usuario = getCurrentUser();
    if (!caronaData.id) caronaData.id = Date.now();
    return await fetchJSON(`${API_URL}/caronas`, {
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
      const pedido = await fetchJSON(`${API_URL}/caronas/${id}`);
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
      const oferta = await fetchJSON(`${API_URL}/caronas/${id}`);
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
      const carona = await fetchJSON(`${API_URL}/caronas/${id}`);
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
      const veiculos = await fetchJSON(`${API_URL}/vehicles`);
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
    } catch (e) {
      console.error('Erro ao carregar veículos:', e);
    }
  }

  function setupPedirCaronaForm() {
    const $form = $('#form-pedir-carona');
    if (!$form.length) return;

    $('input[name="tipo-carona"]').on('change', function () {
      toggleCaronaType();
      if ($(this).val() === 'emergencial') {
        const agora = new Date();
        const hora = String(agora.getHours()).padStart(2, '0');
        const minuto = String(agora.getMinutes()).padStart(2, '0');
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        $('#data-emergencial').val(dataFormatada);
        $('#horario-emergencial-value').val(`${hora}:${minuto}`);
      }
    });

    toggleCaronaType();

    if ($('input[name="tipo-carona"]:checked').val() === 'emergencial') {
      const agora = new Date();
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      const dataFormatada = agora.toLocaleDateString('pt-BR');
      $('#data-emergencial').val(dataFormatada);
      $('#horario-emergencial-value').val(`${hora}:${minuto}`);
    }

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
    $('input[name="precisa-retorno"]').on('change', hasReturn);

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

      if (tipoCarona === 'emergencial') {
        const agora = new Date();
        const hora = String(agora.getHours()).padStart(2, '0');
        const minuto = String(agora.getMinutes()).padStart(2, '0');
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        const horarioAtual = fd.get('horario-emergencial-value') || `${hora}:${minuto}`;

        data = {
          tipo: 'pedindo',
          usuario: currentUser,
          rota: {
            origem: fd.get('origem-emergencial') || fd.get('origem'),
            destino: fd.get('destino-emergencial') || fd.get('destino')
          },
          data: fd.get('data-emergencial') || dataFormatada,
          horario: horarioAtual,
          tipoCarona: 'emergencial',
          motivo: fd.get('motivo-emergencial'),
          precisaRetorno: false,
          dataRetorno: '',
          horarioRetorno: ''
        };
      } else {
        data = {
          tipo: 'pedindo',
          usuario: currentUser,
          rota: { origem: fd.get('origem'), destino: fd.get('destino') },
          data: fd.get('data'),
          horario: fd.get('horario'),
          tipoCarona: 'comum',
          precisaRetorno: fd.get('precisa-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno')
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

  function setupOferecerCaronaForm() {
    const $form = $('#form-oferecer-carona');
    if (!$form.length) return;
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
      const fd = new FormData($form[0]);
      const currentUser = getCurrentUser();
      const data = {
        tipo: 'oferecendo',
        usuario: currentUser,
        rota: { origem: fd.get('origem'), destino: fd.get('destino') },
        data: fd.get('data'),
        horario: fd.get('horario'),
        veiculo: fd.get('veiculo') || $('#rideVehicle').val() || '',
        vagas: parseInt(fd.get('vagas')) || parseInt($('#rideSeats').val()) || 1,
        custo: getCustoText(fd.get('custo'), fd.get('valor-fixo')),
        podeTrazerEncomendas: fd.get('pode-encomendas') === 'sim',
        incluiRetorno: fd.get('incluir-retorno') === 'sim',
        dataRetorno: fd.get('data-retorno'),
        horarioRetorno: fd.get('horario-retorno')
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

  function initializeEditCarona() {
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

    $('input[name="precisa-retorno"]').on('change', hasReturn);

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

        console.log('Salvando pedido de carona...', id);
        const fd = new FormData($formPedido[0]);
        const data = {
          tipo: 'pedindo',
          usuario: getCurrentUser(),
          rota: { origem: fd.get('origem'), destino: fd.get('destino') },
          data: fd.get('data'),
          horario: fd.get('horario'),
          tipoCarona: fd.get('tipo-carona') || 'comum',
          motivo: fd.get('tipo-carona') === 'emergencial' ? fd.get('motivo-emergencial') : undefined,
          precisaRetorno: fd.get('precisa-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno')
        };
        try {
          await fetchJSON(`${API_URL}/caronas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          Swal.fire('Sucesso!', 'Pedido atualizado com sucesso.', 'success').then(() => {
            window.location.href = 'index.html';
          });
        } catch (error) {
          console.error('Erro ao salvar pedido:', error);
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

        console.log('Salvando oferta de carona...', id);
        const fd = new FormData($formOferta[0]);
        const data = {
          tipo: 'oferecendo',
          usuario: getCurrentUser(),
          rota: { origem: fd.get('origem'), destino: fd.get('destino') },
          data: fd.get('data'),
          horario: fd.get('horario'),
          veiculo: fd.get('veiculo') || $('#rideVehicle').val() || '',
          vagas: parseInt(fd.get('vagas')) || parseInt($('#rideSeats').val()) || 1,
          custo: getCustoText(fd.get('custo'), fd.get('valor-fixo')),
          podeTrazerEncomendas: fd.get('pode-encomendas') === 'sim',
          incluiRetorno: fd.get('incluir-retorno') === 'sim',
          dataRetorno: fd.get('data-retorno'),
          horarioRetorno: fd.get('horario-retorno')
        };
        try {
          await fetchJSON(`${API_URL}/caronas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          Swal.fire('Sucesso!', 'Carona atualizada com sucesso.', 'success').then(() => {
            window.location.href = 'index.html';
          });
        } catch (error) {
          console.error('Erro ao salvar oferta:', error);
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

  async function loadViagens() {
    const $container = $('#viagens-container');
    if (!$container.length) return;
    try {
      const viagens = await fetchJSON(`${API_URL}/viagens`);
      clear($container);
      if (!viagens.length) {
        emptyState($container, 'bi bi-briefcase', 'Nenhuma viagem cadastrada', '#d1d5db');
        return;
      }
      viagens.forEach(v => $container.append(buildViagemCard(v)));
    } catch (e) { }
  }

  function buildViagemCard({ title, subtitle, footer, buttonText, buttonColor, icon: iconCls }) {
    const $card = el('div', 'viagem-card');
    const $title = el('p', 'card-title', title || '');
    const $sub = el('h3', 'card-subtitle', subtitle || '');
    const $footer = el('p', 'card-footer');
    if (iconCls) $footer.append(icon(iconCls));
    $footer.append(document.createTextNode(iconCls ? ' ' : ''));
    $footer.append(document.createTextNode(footer || ''));
    const $btn = el('button', 'btn-info');
    if (buttonColor) $btn.css('background', buttonColor);
    if (iconCls) $btn.append(icon(iconCls), document.createTextNode(' '));
    $btn.append(document.createTextNode(buttonText || 'Ação'));
    $card.append($title, $sub, $footer, $btn);
    return $card;
  }

  function route() {
    const path = window.location.pathname;
    if (path.includes('caronas/index.html')) {
      loadCaronas();
      setupFilters();
      setupSearch();
      setupButtons();
    } else if (path.includes('editar-carona.html')) {
      initializeEditCarona();
    } else if (path.includes('pedir-carona.html')) {
      setupPedirCaronaForm();
    } else if (path.includes('oferecer-carona.html')) {
      setupOferecerCaronaForm();
    } else if (path.includes('viagem.html')) {
      loadViagens();
    } else {
      if ($('#page-title').length) {
        initializeEditCarona();
      }
    }
  }

  route();
});