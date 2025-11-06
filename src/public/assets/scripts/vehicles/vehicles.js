$(document).ready(function () {
    const API_URL = 'http://localhost:3000';

    async function fetchJSON(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return await res.json();
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
            if ($seatsInput.val() === '1') {
                $seatsInput.val('');
            }
        }
    });

    $('#licensePlate').on('input', function () {
        let value = $(this).val().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 7) value = value.substring(0, 7);
        $(this).val(value);
    });

    $('#vehicleForm').on('submit', async function (e) {
        e.preventDefault();

        if (!validateVehicleForm()) {
            return;
        }

        try {
            const type = $('input[name="type"]:checked').val();
            const brand = $('#brand').val();
            const model = $('#model').val().trim();
            const color = $('#color').val().trim();
            const licensePlate = $('#licensePlate').val().trim().toUpperCase();
            const availableSeats = parseInt($('#availableSeats').val());

            const vehicleData = {
                type: type,
                brand: brand,
                model: model,
                color: color,
                licensePlate: licensePlate,
                availableSeats: availableSeats,
                id: Date.now()
            };

            await fetchJSON(`${API_URL}/vehicles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData)
            });

            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Veículo cadastrado com sucesso!',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            const modalElement = document.getElementById('modal-vehicle');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    $(modalElement).one('hidden.bs.modal', function () {
                        $('.modal-backdrop').remove();
                        $('body').removeClass('modal-open');
                        $('body').css({
                            'overflow': '',
                            'padding-right': ''
                        });
                    });
                    modal.hide();
                } else {
                    $(modalElement).modal('hide');
                }
            }

            setTimeout(() => {
                const $backdrop = $('.modal-backdrop');
                if ($backdrop.length) {
                    $backdrop.remove();
                    $('body').removeClass('modal-open');
                    $('body').css({
                        'overflow': '',
                        'padding-right': ''
                    });
                }
            }, 500);

            $('#vehicleForm')[0].reset();
            $('#availableSeats').removeAttr('readonly');

            if (typeof loadVehicles === 'function') {
                loadVehicles();
            }

        } catch (error) {
            console.error('Erro ao cadastrar veículo:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'Não foi possível cadastrar o veículo. Tente novamente.'
                });
            } else {
                alert('Erro ao cadastrar veículo: ' + error.message);
            }
        }
    });

    async function loadVehicles() {
        try {
            const vehicles = await fetchJSON(`${API_URL}/vehicles`);
            const $container = $('#vehicles-list');

            if (!vehicles || vehicles.length === 0) {
                $container.html('<p class="text-muted">Nenhum veículo cadastrado.</p>');
                return;
            }

            let html = '';
            vehicles.forEach(vehicle => {
                const typeText = vehicle.type === 'CAR' ? 'Carro' : 'Motocicleta';
                html += `
                    <div class="d-flex gap-3 align-items-center mb-2 vehicle-item" data-id="${vehicle.id}">
                        <div class="col-md-4">
                            <select class="form-select" disabled>
                                <option ${vehicle.type === 'CAR' ? 'selected' : ''}>Carro</option>
                                <option ${vehicle.type === 'MOTORCYCLE' ? 'selected' : ''}>Moto</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <input type="text" class="form-control" value="${vehicle.licensePlate}" disabled>
                        </div>
                        <button type="button" class="btn btn-outline-danger delete-vehicle" data-id="${vehicle.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
            });

            $container.html(html);
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
        }
    }

    window.loadVehicles = loadVehicles;

    $(document).on('click', '.delete-vehicle', async function () {
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
                    await fetchJSON(`${API_URL}/vehicles/${vehicleId}`, {
                        method: 'DELETE'
                    });
                    loadVehicles();
                } catch (error) {
                    console.error('Erro ao excluir veículo:', error);
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro!',
                            text: 'Não foi possível excluir o veículo.'
                        });
                    }
                }
            }
        });
    });


    if ($('#vehicles-list').length > 0) {
        loadVehicles();
    }
});