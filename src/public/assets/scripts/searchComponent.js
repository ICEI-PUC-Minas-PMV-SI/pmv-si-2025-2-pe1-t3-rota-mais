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

document.addEventListener("DOMContentLoaded", () => {
    setupSearchComponent();
});


function setupSearchComponent() {
    const searchContainer = document.querySelector(".search-container");
    if (!searchContainer) return;

    const searchForm = createSafeElement('div', 'search-form d-flex gap-2 align-items-center mb-5 rounded');
    
    const origemGroup = createSafeElement('div', 'input-group');
    const origemSpan = createSafeElement('span', 'input-group-text');
    origemSpan.appendChild(createIcon('bi bi-geo-alt-fill'));
    origemGroup.appendChild(origemSpan);
    
    const origemInput = document.createElement('input');
    origemInput.type = 'text';
    origemInput.id = 'origem';
    origemInput.className = 'form-control';
    origemInput.placeholder = 'De onde?';
    origemGroup.appendChild(origemInput);
    searchForm.appendChild(origemGroup);
    
    const destinoGroup = createSafeElement('div', 'input-group');
    const destinoSpan = createSafeElement('span', 'input-group-text');
    destinoSpan.appendChild(createIcon('bi bi-geo-alt-fill'));
    destinoGroup.appendChild(destinoSpan);
    
    const destinoInput = document.createElement('input');
    destinoInput.type = 'text';
    destinoInput.id = 'destino';
    destinoInput.className = 'form-control';
    destinoInput.placeholder = 'Para onde?';
    destinoGroup.appendChild(destinoInput);
    searchForm.appendChild(destinoGroup);
    
    const dataGroup = createSafeElement('div', 'input-group');
    const dataSpan = createSafeElement('span', 'input-group-text');
    dataSpan.appendChild(createIcon('bi bi-calendar-event'));
    dataGroup.appendChild(dataSpan);
    
    const dataInput = document.createElement('input');
    dataInput.type = 'text';
    dataInput.className = 'form-control';
    dataInput.id = 'data';
    dataInput.placeholder = 'Data';
    dataInput.onfocus = function() { this.type = 'date'; };
    dataInput.onblur = function() { if (!this.value) this.type = 'text'; };
    dataGroup.appendChild(dataInput);
    searchForm.appendChild(dataGroup);
    
    const buscarButton = createSafeElement('button', 'btn btn-primary', 'Procurar');
    buscarButton.id = 'btn-buscar';
    searchForm.appendChild(buscarButton);
    
    searchContainer.appendChild(searchForm);
}