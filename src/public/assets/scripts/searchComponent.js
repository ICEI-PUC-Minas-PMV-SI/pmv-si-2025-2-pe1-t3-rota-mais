document.addEventListener("DOMContentLoaded", () => {
    setupSearchComponent();
});


function setupSearchComponent() {
    const searchContainer = document.querySelector(".search-container");
    if (!searchContainer) return;

    searchContainer.innerHTML = `

        <div class="search-form d-flex gap-2 align-items-center mb-5 rounded">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-geo-alt-fill"></i>
            </span>
            <input type="text" id="origem" class="form-control" placeholder="De onde?" />
          </div>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-geo-alt-fill"></i>
            </span>
            <input type="text" id="destino" class="form-control" placeholder="Para onde?" />
          </div>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-calendar-event"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="data"
              placeholder="Data"
              onfocus="(this.type='date')"
              onblur="if(!this.value)this.type='text'"
            />
          </div>
          <button class="btn btn-primary" id="btn-buscar">Procurar</button>
        </div>
    `;
}