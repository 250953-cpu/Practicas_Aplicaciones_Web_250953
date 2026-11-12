(function () {
    // 1. Mensaje inicial en consola
    console.log("Hola Mundo, desde JavaScript - Sistema MecaGest cargado.");

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("formRegistro");
        if (!form) return;

        // Función auxiliar rápida para obtener elementos por su ID
        const $ = (id) => document.getElementById(id);

        // Mensajes estándar de validación
        const MSG_OBLIGATORIO = "Este campo es obligatorio.";
        const MSG_BANNER = "Completa correctamente los campos obligatorios antes de continuar.";

          /* =====================================================================
           DISTRIBUCIÓN AUTOMÁTICA DE NOMBRE(S) Y APELLIDOS (PASO 01)
           Solo actúa cuando el navegador inserta una sugerencia de autocompletado
           en Nombre(s). Si el usuario edita o borra manualmente, no mueve nada.
           ===================================================================== */
        const inputNombre = $("nombre");
        const inputPaterno = $("apPaterno");
        const inputMaterno = $("apMaterno");
        let reorganizandoNombre = false;

        function agruparApellidos(palabras) {
            const particulas = new Set(["de", "del", "la", "las", "los", "san", "santa", "y"]);
            const bloques = [];
            let i = 0;
            while (i < palabras.length) {
                let actual = palabras[i];
                while (i + 1 < palabras.length && particulas.has(palabras[i].toLowerCase())) {
                    i++;
                    actual += " " + palabras[i];
                }
                bloques.push(actual);
                i++;
            }
            return bloques;
        }

        function distribuirDesdeAutocompletado() {
            if (reorganizandoNombre) return;
            reorganizandoNombre = true;

            const palabrasNombre = inputNombre.value.trim().split(/\s+/).filter(Boolean);
            let palabras = [];

            if (palabrasNombre.length >= 2) {
                palabras = palabrasNombre;
            } else {
                const crudo = [inputNombre.value, inputPaterno.value, inputMaterno.value]
                    .map(v => v.trim())
                    .filter(Boolean)
                    .join(" ");

                for (const p of crudo.split(/\s+/).filter(Boolean)) {
                    if (palabras.length === 0 || palabras[palabras.length - 1].toLowerCase() !== p.toLowerCase()) {
                        palabras.push(p);
                    }
                }
            }

            const bloques = agruparApellidos(palabras);

            if (bloques.length >= 3) {
                const materno = bloques.pop();
                const paterno = bloques.pop();
                inputNombre.value = bloques.join(" ");
                inputPaterno.value = paterno;
                inputMaterno.value = materno;
            } else if (bloques.length === 2) {
                const paterno = bloques.pop();
                inputNombre.value = bloques.join(" ");
                inputPaterno.value = paterno;
                inputMaterno.value = "";
            }

            if (inputPaterno.value.trim() !== "" &&
                inputMaterno.value.trim().toLowerCase() === inputPaterno.value.trim().toLowerCase()) {
                inputMaterno.value = "";
            }

            validarCampo(inputNombre);
            validarCampo(inputPaterno);
            validarCampo(inputMaterno);

            setTimeout(() => { reorganizandoNombre = false; }, 100);
        }

        // Solo dispara cuando el navegador inserta una sugerencia de autocompletado en Nombre(s)
        inputNombre.addEventListener("input", function (e) {
            if (reorganizandoNombre) return;
            const tipo = e.inputType || "";
            if (tipo.startsWith("delete")) return;

            if (tipo === "insertReplacementText" || tipo === "") {
                setTimeout(distribuirDesdeAutocompletado, 80);
            }
        });

        // Reevalúa al instante si el usuario escribe manualmente el mismo apellido
        inputPaterno.addEventListener("input", () => {
            if (!reorganizandoNombre && inputMaterno.value.trim() !== "") {
                validarCampo(inputMaterno);
            }
        });
        /* =====================================================================
           FUNCIONALIDAD 1: CÁLCULO Y VALIDACIÓN DE MAYORÍA DE EDAD (PASO 01)
           Calcula la edad exacta según la fecha seleccionada y cambia el color.
           ===================================================================== */
        const fechaNacimiento = $("fechaNacimiento");
        const resultadoEdad = $("resultadoEdad");
        const TEXTO_EDAD_INICIAL = "Selecciona una fecha para calcular tu edad.";

        function limpiarEdad() {
            resultadoEdad.classList.remove(
                "edad-estado--mayor",
                "edad-estado--menor",
                "edad-estado--error"
            );
            resultadoEdad.textContent = TEXTO_EDAD_INICIAL;
        }

        fechaNacimiento.addEventListener("change", function () {
            limpiarEdad();
            if (fechaNacimiento.value === "") return;

            const [anio, mes, dia] = fechaNacimiento.value.split("-").map(Number);
            const nacimiento = new Date(anio, mes - 1, dia);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (nacimiento > hoy) {
                resultadoEdad.textContent = "Error: no se puede calcular la edad. La fecha es futura.";
                resultadoEdad.classList.add("edad-estado--error");
                return;
            }

            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
            const diferenciaDias = hoy.getDate() - nacimiento.getDate();

            if (diferenciaMeses < 0 || (diferenciaMeses === 0 && diferenciaDias < 0)) {
                edad--;
            }

            if (edad >= 18) {
                resultadoEdad.textContent = `Eres mayor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--mayor");
            } else {
                resultadoEdad.textContent = `Eres menor de edad. Tienes ${edad} años.`;
                resultadoEdad.classList.add("edad-estado--menor");
            }
        });

          /* =====================================================================
           FUNCIONALIDAD 2: VALIDACIÓN DE TELÉFONO INTERNACIONAL
           - Bloquea cualquier carácter que no sea número (0-9).
           ===================================================================== */
        const numTelefonico = $("numTelefonico");
        const ladaPais = $("ladaPais");

        numTelefonico.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
        });

        // Reevalúa el número si el usuario cambia de país después de haber escrito
        ladaPais.addEventListener("change", function () {
            if (numTelefonico.value.trim() !== "") {
                validarCampo(numTelefonico);
            }
        });
        /* =====================================================================
           FUNCIONALIDAD 3: CONTROL DINÁMICO DE REDES SOCIALES (PASO 02)
           Activa o desactiva los campos URL/QR según su checkbox y los limpia al desmarcar.
           ===================================================================== */
        const qrInput = $("whatsAppQR");
        const qrCheck = $("checkWhatsApp");

        const redes = [
            { check: $("checkFacebook"), campo: $("urlFacebook") },
            { check: $("checkLinkedIn"), campo: $("urlLinkedIn") },
            { check: qrCheck, campo: qrInput }
        ];

        function sincronizarRed(red, enfocar) {
            const { check, campo } = red;
            campo.disabled = !check.checked;

            if (!check.checked) {
                if (campo === qrInput) {
                    qrInput.value = "";
                    limpiarQR();
                } else {
                    campo.value = "";
                    validarCampo(campo);
                }
            } else if (enfocar && campo !== qrInput) {
                campo.focus();
            }
        }

        redes.forEach(red => {
            red.check.addEventListener("change", () => sincronizarRed(red, true));
        });

        const sincronizarRedes = () => redes.forEach(red => sincronizarRed(red, false));

        /* =====================================================================
           FUNCIONALIDAD 4: VISTA PREVIA LOCAL DEL CÓDIGO QR (PASO 02)
           Valida que el archivo sea imagen, muestra la miniatura, marca el check
           automáticamente y habilita el botón para quitarla.
           ===================================================================== */
        const qrVacio = $("qrEmpty");
        const qrImagen = $("qrImage");
        const qrError = $("qrError");
        const qrNombre = $("qrFileName");
        const qrQuitar = $("qrRemove");
        const TEXTO_QR_INICIAL = "Solo vista previa local; no se envía al servidor.";
        let qrUrl = null;

        function limpiarQR() {
            if (qrUrl) {
                URL.revokeObjectURL(qrUrl);
                qrUrl = null;
            }
            qrImagen.removeAttribute("src");
            qrImagen.hidden = true;
            qrVacio.hidden = false;
            qrNombre.textContent = TEXTO_QR_INICIAL;
            qrQuitar.hidden = true;
            qrError.hidden = true;
            qrError.textContent = "";
        }

        qrInput.addEventListener("change", function () {
            const archivo = qrInput.files[0];
            limpiarQR();
            if (!archivo) return;

            if (!archivo.type.startsWith("image/")) {
                qrError.textContent = "El archivo seleccionado no es una imagen. Elige un PNG, JPG o WEBP.";
                qrError.hidden = false;
                qrVacio.hidden = true;
                qrInput.value = "";
                return;
            }

            qrUrl = URL.createObjectURL(archivo);
            qrImagen.src = qrUrl;
            qrImagen.hidden = false;
            qrVacio.hidden = true;
            qrNombre.textContent = "Archivo: " + archivo.name;
            qrQuitar.hidden = false;
            qrCheck.checked = true;
        });

        qrQuitar.addEventListener("click", function () {
            qrInput.value = "";
            limpiarQR();
        });

        /* =====================================================================
           FUNCIONALIDAD 5: VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL Y BOTÓN OJITO (PASO 03)
           Evalúa 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
           ===================================================================== */
        const MSG_CLAVE = "La contraseña debe cumplir las 5 reglas indicadas abajo.";
        const passwordInput = $("password");
        const confirmarPasswordInput = $("confirmarPassword");
        const listaReglas = $("reglasContrasena");

        function reglasClave(valor) {
            return {
                longitud: valor.length >= 8,
                mayuscula: /[A-ZÁÉÍÓÚÑ]/.test(valor),
                minuscula: /[a-záéíóúñ]/.test(valor),
                numero: /\d/.test(valor),
                especial: /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(valor)
            };
        }

        function actualizarReglasClave() {
            const estado = reglasClave(passwordInput.value);
            listaReglas.querySelectorAll("li").forEach(li => {
                li.classList.toggle("is-ok", estado[li.dataset.regla]);
            });
        }

        passwordInput.addEventListener("input", function () {
            actualizarReglasClave();
            if (confirmarPasswordInput.value !== "") {
                validarCampo(confirmarPasswordInput);
            }
        });
        confirmarPasswordInput.addEventListener("input", function () {
            if (confirmarPasswordInput.value !== "") {
                validarCampo(confirmarPasswordInput);
            }
        });

        // Alternar visibilidad (mostrar / ocultar) al dar clic en el icono del ojo
        document.querySelectorAll(".toggle-pass").forEach(btn => {
            btn.addEventListener("click", function () {
                const input = $(btn.dataset.target);
                const icono = btn.querySelector(".material-symbols-outlined");
                const mostrar = input.type === "password";

                input.type = mostrar ? "text" : "password";
                icono.textContent = mostrar ? "visibility_off" : "visibility";
            });
        });
        /* =====================================================================
           CATÁLOGO DE DOMICILIOS (PASO 04)
           Carga países, estados, ciudades, colonias y autocompleta según CP o ciudad
           ===================================================================== */
        const catalogo = window.MECAGEST_DOMICILIOS;
        const inputPais = $("pais");
        const inputEstado = $("estado");
        const inputCiudad = $("ciudad");
        const inputColonia = $("colonia");
        const inputCP = $("codigoPostal");

        function llenarDatalist(idLista, arreglo) {
            const dl = $(idLista);
            if (!dl) return;
            dl.innerHTML = [...new Set(arreglo)]
                .map(item => `<option value="${item}"></option>`)
                .join("");
        }

        if (catalogo && inputPais) {
            llenarDatalist("listaPaises", catalogo.paises);
            llenarDatalist("listaEstados", catalogo.estadosMexico);
            llenarDatalist("listaCiudades", catalogo.ejemplosMexico.map(e => e.ciudad));
            llenarDatalist("listaColonias", catalogo.ejemplosMexico.map(e => e.colonia));
            llenarDatalist("listaCP", catalogo.ejemplosMexico.map(e => e.cp));

            // Si escribe o elige un Código Postal de los ejemplos, autocompleta País, Estado, Ciudad y Colonia
            inputCP.addEventListener("input", function () {
                this.value = this.value.replace(/\D/g, ""); // Solo números en CP
                const match = catalogo.ejemplosMexico.find(e => e.cp === this.value);
                if (match) {
                    if (!inputPais.value.trim()) inputPais.value = "México";
                    inputEstado.value = match.estado;
                    inputCiudad.value = match.ciudad;
                    inputColonia.value = match.colonia;
                }
            });

            // Si selecciona una ciudad del catálogo, autocompleta Estado, CP y Colonia
            inputCiudad.addEventListener("change", function () {
                const match = catalogo.ejemplosMexico.find(
                    e => e.ciudad.toLowerCase() === this.value.trim().toLowerCase()
                );
                if (match) {
                    if (!inputPais.value.trim()) inputPais.value = "México";
                    inputEstado.value = match.estado;
                    if (!inputCP.value.trim()) inputCP.value = match.cp;
                    if (!inputColonia.value.trim()) inputColonia.value = match.colonia;
                }
            });
        }

        /* =====================================================================
           FUNCIONALIDAD 6: MOTOR DE VALIDACIÓN DE CAMPOS Y WIZARD DE 4 PASOS
           ===================================================================== */
        const TOTAL_PASOS = 4;
        const tarjetaWizard = $("registroWizard");
        const paneles = [...form.querySelectorAll(".wizard-panel")];
        const itemsStepper = [...document.querySelectorAll(".stepper-item")];
        const barraProgreso = $("wizardProgress");
        const banner = $("bannerFormulario");
        const btnAnterior = $("btnAnterior");
        const btnSiguiente = $("btnSiguiente");
        const btnSiguienteTexto = $("btnSiguienteTexto");
        const btnSiguienteIcono = $("btnSiguienteIcono");
        let pasoActual = 1;

        function mostrarBanner(texto, tipo) {
            banner.textContent = texto;
            banner.className = "form-banner is-" + tipo;
            banner.hidden = false;
        }

        function ocultarBanner() {
            banner.hidden = true;
            banner.textContent = "";
        }

        // Evalúa cada campo individual y devuelve su mensaje de error (o "" si está bien)
        function mensajeDe(el) {
            if (el.type === "checkbox") {
                return el.required && !el.checked ? (el.dataset.mensaje || MSG_OBLIGATORIO) : "";
            }

            const valor = el.value.trim();

            if (valor === "") {
                return el.required ? MSG_OBLIGATORIO : "";
            }

            // Validación de Apellido Materno (no repetir el Paterno)
            if (el.id === "apMaterno") {
                const paterno = $("apPaterno").value.trim().toLowerCase();
                if (paterno !== "" && valor.toLowerCase() === paterno) {
                    return "El apellido materno no puede ser igual al apellido paterno. Corrígelo o déjalo vacío si no tienes segundo apellido.";
                }
                return "";
            }

            // Validación específica del teléfono según el país seleccionado
            if (el.id === "numTelefonico") {
                const lada = $("ladaPais").value;
                if ((lada === "+52" || lada === "+1") && !/^\d{10}$/.test(valor)) {
                    return `Para ${lada} debes ingresar exactamente 10 dígitos numéricos (ej: 7641234567).`;
                }
                if (!/^\d{7,12}$/.test(valor)) {
                    return "Ingresa un número válido de entre 7 y 12 dígitos sin espacios ni letras.";
                }
                return "";
            }
            // Validación de contraseña y confirmación
            if (el.id === "password") {
                return Object.values(reglasClave(el.value)).every(Boolean) ? "" : MSG_CLAVE;
            }
            if (el.id === "confirmarPassword") {
                return el.value === passwordInput.value ? "" : "Las contraseñas no coinciden.";
            }

            // Validación nativa de Email y URL
            if (el.validity.typeMismatch) {
                return el.type === "email"
                    ? "Ingresa un correo electrónico válido."
                    : "Ingresa una URL válida (ej. https://www.facebook.com/usuario).";
            }

            // Longitud mínima (como el usuario de 4 caracteres)
            if (el.minLength > 0 && valor.length < el.minLength) {
                return `Utiliza al menos ${el.minLength} caracteres.`;
            }

            return "";
        }

        function validarCampo(el) {
            const contenedor = el.closest(".field");
            if (!contenedor) return true;

            const mensaje = mensajeDe(el);
            const errorEl = $("error-" + el.id);

            contenedor.classList.toggle("is-invalid", mensaje !== "");
            el.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");

            if (errorEl) {
                errorEl.textContent = mensaje;
                errorEl.hidden = mensaje === "";
            }
            return mensaje === "";
        }

        function camposDePaso(n) {
            return [...paneles[n - 1].querySelectorAll(
                "input:not([type='file']):not([type='hidden']), select, textarea"
            )];
        }

        function validarPaso(n) {
            let primerInvalido = null;
            camposDePaso(n).forEach(el => {
                if (!validarCampo(el) && !primerInvalido) {
                    primerInvalido = el;
                }
            });
            return primerInvalido;
        }

        function reevaluar(e) {
            const contenedor = e.target.closest(".field");
            if (contenedor && contenedor.classList.contains("is-invalid")) {
                validarCampo(e.target);
            }
        }
        form.addEventListener("input", reevaluar);
        form.addEventListener("change", reevaluar);

        form.addEventListener("focusout", function (e) {
            const el = e.target;
            const contenedor = el.closest && el.closest(".field");
            if (!contenedor || el.type === "checkbox") return;
            if (el.value.trim() !== "" || contenedor.classList.contains("is-invalid")) {
                validarCampo(el);
            }
        });

        /* =====================================================================
           FUNCIONALIDAD 7: NAVEGACIÓN ENTRE PASOS, ENVÍO SIMULADO Y LIMPIEZA
           ===================================================================== */
        function mostrarPaso(n, desplazar = true) {
            pasoActual = n;

            paneles.forEach((panel, i) => {
                panel.hidden = i !== n - 1;
            });

            itemsStepper.forEach((li, i) => {
                const num = i + 1;
                li.classList.toggle("is-active", num === n);
                li.classList.toggle("is-done", num < n);
                li.querySelector(".step-icon").textContent = num < n ? "check" : li.dataset.icon;
            });

            barraProgreso.style.width = ((n - 1) / (TOTAL_PASOS - 1)) * 100 + "%";

            btnAnterior.disabled = n === 1;
            const esUltimo = n === TOTAL_PASOS;
            btnSiguienteTexto.textContent = esUltimo ? "Enviar Solicitud" : "Siguiente";
            btnSiguienteIcono.textContent = esUltimo ? "check_circle" : "arrow_forward";

            ocultarBanner();
            paneles[n - 1].querySelector(".panel-head").after(banner);

            if (desplazar) {
                tarjetaWizard.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }

        function irAPaso(destino) {
            if (destino <= pasoActual) {
                mostrarPaso(destino);
                return;
            }
            for (let n = pasoActual; n < destino; n++) {
                const invalido = validarPaso(n);
                if (invalido) {
                    if (n !== pasoActual) mostrarPaso(n);
                    mostrarBanner(MSG_BANNER, "warning");
                    invalido.focus();
                    return;
                }
            }
            mostrarPaso(destino);
        }

        btnAnterior.addEventListener("click", () => mostrarPaso(pasoActual - 1));
        itemsStepper.forEach(li => {
            li.addEventListener("click", () => irAPaso(Number(li.dataset.step)));
        });

        // Evento al dar clic en "Siguiente" o "Enviar Solicitud"
        btnSiguiente.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (pasoActual < TOTAL_PASOS) {
                irAPaso(pasoActual + 1);
                return;
            }

            // En el Paso 4, verifica todos los pasos antes de mostrar el éxito
            for (let n = 1; n <= TOTAL_PASOS; n++) {
                const invalido = validarPaso(n);
                if (invalido) {
                    if (n !== pasoActual) mostrarPaso(n);
                    mostrarBanner(MSG_BANNER, "warning");
                    invalido.focus();
                    return;
                }
            }

            // Mensaje verde de éxito simulado al completar todo
            mostrarBanner("¡Solicitud enviada con éxito! (Envío simulado: los datos han sido validados correctamente).", "success");
            banner.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        // Evento al dar clic en "Limpiar": reinicia ÚNICAMENTE el paso actual sin cambiar de sección
        const btnLimpiar = $("btnLimpiar");
        btnLimpiar.addEventListener("click", function () {
            const panelActual = paneles[pasoActual - 1];

            // 1. Limpiar mensajes y bordes de error solo dentro del paso actual
            panelActual.querySelectorAll(".field.is-invalid").forEach(c => c.classList.remove("is-invalid"));
            panelActual.querySelectorAll(".field-error").forEach(p => {
                p.hidden = true;
                p.textContent = "";
            });
            panelActual.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));

            // 2. Restablecer los valores de cada campo del paso actual a su estado inicial
            panelActual.querySelectorAll("input, select, textarea").forEach(el => {
                if (el.type === "checkbox" || el.type === "radio") {
                    el.checked = el.defaultChecked;
                } else if (el.tagName === "SELECT") {
                    const optDefault = [...el.options].find(o => o.defaultSelected);
                    el.selectedIndex = optDefault ? optDefault.index : 0;
                } else {
                    el.value = el.defaultValue;
                }
            });

            // 3. Limpiar componentes especiales según el paso en el que estés
            if (pasoActual === 1) {
                limpiarEdad();
            } else if (pasoActual === 2) {
                limpiarQR();
                sincronizarRedes();
            } else if (pasoActual === 3) {
                actualizarReglasClave();
                passwordInput.type = "password";
                confirmarPasswordInput.type = "password";
                document.querySelectorAll(".toggle-pass .material-symbols-outlined").forEach(ic => {
                    ic.textContent = "visibility";
                });
            }

            ocultarBanner();
        });

        // Inicialización al cargar la página
        limpiarEdad();
        limpiarQR();
        sincronizarRedes();
        actualizarReglasClave();
        mostrarPaso(1, false);
    });
})();
