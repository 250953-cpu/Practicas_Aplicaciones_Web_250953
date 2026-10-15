// ==========================================================================
// CARRUSEL Y MODAL MULTIMEDIA: JAVASCRIPT BÁSICO, SIN LIBRERÍAS
// ==========================================================================

const tarjetas = [...document.querySelectorAll('.favorito-card')];
const pista = document.getElementById('pista');
const indicadores = document.getElementById('indicadores');
let indice = 0;

// --- CREAR PUNTOS DINÁMICOS DEL CARRUSEL ---
if (indicadores) {
    tarjetas.forEach((tarjeta, i) => {
        const punto = document.createElement('button');
        punto.type = 'button';
        punto.setAttribute('aria-label', `Mostrar favorito ${i + 1}`);
        punto.addEventListener('click', () => mostrar(i));
        indicadores.appendChild(punto);
    });
}

// --- FUNCIÓN PARA MOSTRAR LAS TARJETAS ---
function mostrar(n) {
    if (!pista || tarjetas.length === 0) return;
    
    indice = (n + tarjetas.length) % tarjetas.length;
    pista.style.transform = `translateX(-${indice * 100}%)`;
    
    if (indicadores) {
        [...indicadores.children].forEach((punto, i) => {
            punto.classList.toggle('activo', i === indice);
            punto.setAttribute('aria-current', i === indice ? 'true' : 'false');
        });
    }
}

// --- EVENTOS DE LAS FLECHAS DE NAVEGACIÓN ---
const btnAnterior = document.getElementById('anterior');
const btnSiguiente = document.getElementById('siguiente');

if (btnAnterior) btnAnterior.addEventListener('click', () => mostrar(indice - 1));
if (btnSiguiente) btnSiguiente.addEventListener('click', () => mostrar(indice + 1));

// Iniciar carrusel en la primera posición
mostrar(0);


// ==========================================================================
// LÓGICA DEL MODAL MULTIMEDIA
// ==========================================================================

const modal = document.getElementById('modal-favoritos');
const contenido = document.getElementById('modal-contenido');
const titulo = document.getElementById('modal-titulo');
const cerrar = document.getElementById('cerrar-modal');
let focoAnterior = null;

// --- FUNCIÓN PARA ABRIR EL MODAL ---
function abrir(tarjeta) {
    if (!modal || !contenido || !titulo) return;
    
    focoAnterior = document.activeElement;
    titulo.textContent = tarjeta.dataset.titulo;
    
    const tipo = tarjeta.dataset.tipo;
    const src = tarjeta.dataset.src;
    let visor;
    
    if (tipo === 'video') {
        visor = document.createElement('video');
        visor.controls = true;
        visor.playsInline = true;
        visor.autoplay = true;
    } else if (tipo === 'audio') {
        visor = document.createElement('audio');
        visor.controls = true;
        visor.autoplay = true;
    } else {
        visor = document.createElement('iframe');
        visor.title = 'Vista previa del capítulo PDF';
    }
    
    visor.src = src;
    contenido.replaceChildren(visor);
    modal.hidden = false;
    document.body.classList.add('modal-abierto');
    
    if (cerrar) cerrar.focus();
}

// --- FUNCIÓN PARA CERRAR EL MODAL ---
function cerrarModal() {
    if (!modal || !contenido) return;
    
    contenido.querySelectorAll('video, audio').forEach(media => media.pause());
    contenido.replaceChildren();
    modal.hidden = true;
    document.body.classList.remove('modal-abierto');
    
    if (focoAnterior) focoAnterior.focus();
}

// --- ASIGNACIÓN DE EVENTOS AL MODAL ---
tarjetas.forEach(tarjeta => tarjeta.addEventListener('click', () => abrir(tarjeta)));

if (cerrar) cerrar.addEventListener('click', cerrarModal);

if (modal) {
    modal.addEventListener('click', e => { 
        if (e.target === modal) cerrarModal(); 
    });
}

document.addEventListener('keydown', e => {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') cerrarModal();
});


// ==========================================================================
// AÑO DINÁMICO EN EL FOOTER
// ==========================================================================

const anio = document.getElementById('anio');
if (anio) {
    anio.textContent = `© ${new Date().getFullYear()} - Mi primera página web`;
}
