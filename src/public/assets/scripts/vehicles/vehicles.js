$(document).ready(function () {
    const currentUserId = Number(localStorage.getItem('userId'));
    let editingVehicleId = null;

    async function fetchJSON(url, opts = {}) {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }

    async function atualizarRoleUsuario() {
        try {
            const veiculos = await fetchJSON(`${API_BASE}/vehicles?motoristaId=${currentUserId}`);
            const temVeiculo = veiculos && veiculos.length > 0;
            const novaRole = temVeiculo ? 'motorista' : 'passageiro';

            const user = await fetchJSON(`${API_BASE}/users/${currentUserId}`);
            if (user.role !== novaRole) {
                await fetchJSON(`${API_BASE}/users/${currentUserId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: novaRole })
                });
            }
        } catch (err) {
            console.error('Erro ao atualizar role do usuário:', err);
        }
    }

    function validateVehicleForm() {
        let isValid = true;
        $('.invalid-feedback').hide();
        $('.form-control, .form-select').removeClass('is-invalid');

        const brand = $('#brand').val();
        if (!brand || brand === 'Selecione uma marca') {
            $('#brand').addClass('is-invalid');
            $('#brandError').show();
            isValid = false;
        }

        const model = $('#model').val().trim();
        if (!model) {
            $('#model').addClass('is-invalid');
            $('#modelError').show();
            isValid = false;
        }

        const color = $('#color').val().trim();
        if (!color) {
            $('#color').addClass('is-invalid');
            $('#colorError').show();
            isValid = false;
        }

        const licensePlate = $('#licensePlate').val().trim().toUpperCase();
        if (!licensePlate) {
            $('#licensePlate').addClass('is-invalid');
            $('#licensePlateError').show();
            isValid = false;
        } else {
            const plateOldRegex = /^[A-Z]{3}[0-9]{4}$/;
            const plateMercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
            if (!plateOldRegex.test(licensePlate) && !plateMercosulRegex.test(licensePlate)) {
                $('#licensePlate').addClass('is-invalid');
                $('#licensePlateError').text('Formato de placa inválido').show();
                isValid = false;
            }
        }

        const type = $('input[name="type"]:checked').val();
        const availableSeats = parseInt($('#availableSeats').val());
        if (!availableSeats || availableSeats < 1) {
            $('#availableSeats').addClass('is-invalid');
            $('#seatsError').text('* esse campo é obrigatório').show();
            isValid = false;
        } else {
            if (type === 'MOTORCYCLE' && availableSeats !== 1) {
                $('#availableSeats').addClass('is-invalid');
                $('#seatsError').text('Motocicleta deve ter apenas 1 assento').show();
                isValid = false;
            } else if (type === 'CAR' && availableSeats > 4) {
                $('#availableSeats').addClass('is-invalid');
                $('#seatsError').text('Carro pode ter no máximo 4 assentos').show();
                isValid = false;
            }
        }

        return isValid;
    }

    $('input[name="type"]').on('change', function () {
        const type = $(this).val();
        const $seatsInput = $('#availableSeats');
        const $seatsHelp = $('#seatsHelp');

        if (type === 'MOTORCYCLE') {
            $seatsInput.val(1).attr('max', 1).attr('readonly', true);
            $seatsHelp.text('Motocicleta: apenas 1 assento.');
        } else {
            $seatsInput.attr('max', 4).removeAttr('readonly');
            $seatsHelp.text('Carro: até 4 assentos. Motocicleta: apenas 1 assento.');
            if ($seatsInput.val() === '1') $seatsInput.val('');
        }
    });

    $('#licensePlate').on('input', function () {
        let value = $(this).val().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 7) value = value.substring(0, 7);
        $(this).val(value);
    });

    function resetForm() {
        editingVehicleId = null;
        $('#vehicleForm')[0].reset();
        $('#availableSeats').removeAttr('readonly');
        $('#staticBackdropLabel').text('Cadastro de Veículo');
        $('input[name="type"][value="CAR"]').prop('checked', true);
        $('#car').trigger('change');
    }

    function loadVehicleData(vehicle) {
        editingVehicleId = vehicle.id;
        $('#staticBackdropLabel').text('Editar Veículo');

        $(`input[name="type"][value="${vehicle.type}"]`).prop('checked', true);
        $('#car').trigger('change');

        $('#brand').val(vehicle.brand || '');

        $('#model').val(vehicle.model || '');

        $('#color').val(vehicle.color || '');

        $('#licensePlate').val(vehicle.licensePlate || '');

        $('#availableSeats').val(vehicle.availableSeats || 1);
    }

    $(document).on('click', '.edit-vehicle', async function () {
        const vehicleId = $(this).data('id');

        try {
            const vehicle = await fetchJSON(`${API_BASE}/vehicles/${vehicleId}`);
            loadVehicleData(vehicle);

            const modalElement = document.getElementById('modal-vehicle');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Erro', 'Não foi possível carregar os dados do veículo.', 'error');
        }
    });

    $('#modal-vehicle').on('hidden.bs.modal', function () {
        resetForm();
    });

    $('[data-bs-target="#modal-vehicle"]').on('click', function () {
        resetForm();
    });

    $('#vehicleForm').on('submit', async function (e) {
        e.preventDefault();
        if (!validateVehicleForm()) return;

        try {
            const type = $('input[name="type"]:checked').val();
            const brand = $('#brand').val();
            const model = $('#model').val().trim();
            const color = $('#color').val().trim();
            const licensePlate = $('#licensePlate').val().trim().toUpperCase();
            const availableSeats = parseInt($('#availableSeats').val());

            const vehicleData = {
                motoristaId: currentUserId || null,
                type,
                brand,
                model,
                color,
                licensePlate,
                availableSeats
            };

            if (editingVehicleId) {
                await fetchJSON(`${API_BASE}/vehicles/${editingVehicleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleData)
                });

                await Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Veículo atualizado com sucesso!', timer: 1500, showConfirmButton: false });
            } else {
                vehicleData.id = Date.now();

                await fetchJSON(`${API_BASE}/vehicles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vehicleData)
                });

                await atualizarRoleUsuario();

                await Swal.fire({ icon: 'success', title: 'Sucesso!', text: 'Veículo cadastrado com sucesso!', timer: 1500, showConfirmButton: false });
            }

            const modalElement = document.getElementById('modal-vehicle');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
            }

            resetForm();
            loadVehicles();

        } catch (err) {
            console.error(err);
            Swal.fire('Erro', editingVehicleId ? 'Não foi possível atualizar o veículo.' : 'Não foi possível cadastrar o veículo.', 'error');
        }
    });

    async function loadVehicles() {
        try {
            const list = await fetchJSON(`${API_BASE}/vehicles?motoristaId=${currentUserId}`);
            const $container = $('#vehicles-list');
            $container.empty();

            if (!list || list.length === 0) {
                $container.html('<p class="text-muted">Nenhum veículo cadastrado.</p>');
                return;
            }

            list.forEach(vehicle => {
                const typeText = vehicle.type === 'CAR' ? 'Carro' : 'Motocicleta';
                const $item = $(`
                    <div class="d-flex gap-3 align-items-center mb-2 vehicle-item" data-id="${vehicle.id}">
                        <div class="col-md-3">
                            <select class="form-select" disabled>
                                <option ${vehicle.type === 'CAR' ? 'selected' : ''}>Carro</option>
                                <option ${vehicle.type === 'MOTORCYCLE' ? 'selected' : ''}>Moto</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="text" class="form-control" value="${vehicle.brand || ''} ${vehicle.model || ''}" disabled>
                        </div>
                        <div class="col-md-2">
                            <input type="text" class="form-control" value="${vehicle.licensePlate}" disabled>
                        </div>
                        <button type="button" class="btn btn-outline-primary edit-vehicle" data-id="${vehicle.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-vehicle" data-id="${vehicle.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `);
                $container.append($item);
            });

        } catch (err) {
            console.error('Erro carregar veículos', err);
        }
    }

    $(document).on('click', '.delete-vehicle', function () {
        const vehicleId = $(this).data('id');

        Swal.fire({
            title: 'Excluir veículo?',
            text: 'Tem certeza que deseja excluir este veículo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, excluir'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetchJSON(`${API_BASE}/vehicles/${vehicleId}`, { method: 'DELETE' });

                    await atualizarRoleUsuario();

                    loadVehicles();
                } catch (err) {
                    console.error(err);
                    Swal.fire('Erro', 'Não foi possível excluir o veículo.', 'error');
                }
            }
        });
    });

    window.loadVehicles = loadVehicles;

    loadVehicles();
});
