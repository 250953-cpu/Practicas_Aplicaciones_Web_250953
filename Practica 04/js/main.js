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
           Separa nombre(s), apellido paterno y materno al usar el autocompletado.
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

        inputNombre.addEventListener("input", function (e) {
            if (reorganizandoNombre) return;
            const tipo = e.inputType || "";
            if (tipo.startsWith("delete")) return;
            if (tipo === "insertReplacementText" || tipo === "" || tipo === "insertFromPaste") {
                setTimeout(distribuirDesdeAutocompletado, 80);
            }
        });

        inputNombre.addEventListener("change", function () {
            if (reorganizandoNombre) return;
            const palabras = inputNombre.value.trim().split(/\s+/).filter(Boolean);
            if (palabras.length >= 3 && inputPaterno.value.trim() === "" && inputMaterno.value.trim() === "") {
                setTimeout(distribuirDesdeAutocompletado, 80);
            }
        });

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
           FUNCIONALIDAD 2: VALIDACIÓN DE TELÉFONO INTERNACIONAL (PASO 02)
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

            inputCP.addEventListener("input", function () {
                this.value = this.value.replace(/\D/g, "");
                const match = catalogo.ejemplosMexico.find(e => e.cp === this.value);
                if (match) {
                    if (!inputPais.value.trim()) inputPais.value = "México";
                    inputEstado.value = match.estado;
                    inputCiudad.value = match.ciudad;
                    inputColonia.value = match.colonia;
                }
            });

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
        const itemsStepper = [...tarjetaWizard.querySelectorAll(".stepper-item")];
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
         reproducirSonido(tipo === "warning" ? "error" : "exito");
     }

        function ocultarBanner() {
            banner.hidden = true;
            banner.textContent = "";
        }

        function mensajeDe(el) {
            if (el.type === "checkbox") {
                return el.required && !el.checked ? (el.dataset.mensaje || MSG_OBLIGATORIO) : "";
            }
            const valor = el.value.trim();
            if (valor === "") {
                return el.required ? MSG_OBLIGATORIO : "";
            }

            // Validación de Fecha de Nacimiento (Mayor de edad y no futura)
            if (el.id === "fechaNacimiento") {
                const [anio, mes, dia] = valor.split("-").map(Number);
                const nacimiento = new Date(anio, mes - 1, dia);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                if (nacimiento > hoy) {
                    return "Agrega una fecha actual para poder continuar.";
                }

                let edad = hoy.getFullYear() - nacimiento.getFullYear();
                const difMes = hoy.getMonth() - nacimiento.getMonth();
                const difDia = hoy.getDate() - nacimiento.getDate();
                if (difMes < 0 || (difMes === 0 && difDia < 0)) {
                    edad--;
                }

                if (edad < 18) {
                    return "No puedes continuar con el registro ya que eres menor de edad.";
                }
                return "";
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
                    : "Ingresa una URL válida (ej. https://facebook.com).";
            }

            // Longitud mínima
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

            // Validación extra del Código QR en el Paso 2
            if (n === 2) {
                const archivoQR = qrInput.files[0];
                if (archivoQR && !archivoQR.type.startsWith("image/")) {
                    qrError.textContent = "El archivo seleccionado no es una imagen. Elige un PNG, JPG o WEBP.";
                    qrError.hidden = false;
                    qrVacio.hidden = true;
                    if (!primerInvalido) primerInvalido = qrInput;
                } else if (qrCheck.checked && !archivoQR) {
                    qrError.textContent = "Debes cargar una imagen válida de tu código QR para continuar.";
                    qrError.hidden = false;
                    qrVacio.hidden = true;
                    if (!primerInvalido) primerInvalido = qrInput;
                }
            }

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
           FUNCIONALIDAD 7: NAVEGACIÓN ENTRE PASOS, ENVÍO SIMULADO Y LIMPIEZA (SECCIÓN 01)
           ===================================================================== */
           let registroCompletado = false;
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

        btnSiguiente.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (pasoActual < TOTAL_PASOS) {
                irAPaso(pasoActual + 1);
                return;
            }
            for (let n = 1; n <= TOTAL_PASOS; n++) {
                const invalido = validarPaso(n);
                if (invalido) {
                    if (n !== pasoActual) mostrarPaso(n);
                    mostrarBanner(MSG_BANNER, "warning");
                    invalido.focus();
                    return;
                }
            }
            registroCompletado = true;
            if (btnVistaPractica) {
                btnVistaPractica.disabled = false;
                btnVistaPractica.style.opacity = "1";
                btnVistaPractica.style.cursor = "pointer";
                btnVistaPractica.title = "Ir a Módulos de Práctica";
            }

            mostrarBanner("¡Solicitud enviada con éxito! (Envío simulado: los datos han sido validados correctamente).", "success");
            banner.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        const btnLimpiar = $("btnLimpiar");
        btnLimpiar.addEventListener("click", function () {
            const panelActual = paneles[pasoActual - 1];
            panelActual.querySelectorAll(".field.is-invalid").forEach(c => c.classList.remove("is-invalid"));
            panelActual.querySelectorAll(".field-error").forEach(p => {
                p.hidden = true;
                p.textContent = "";
            });
            panelActual.querySelectorAll("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
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
        /* =====================================================================
           FUNCIONALIDAD 8: BARRA DESPLEGABLE (INTERFAZ Y PERFIL)
           ===================================================================== */
        const btnToggleInterfaz = $("btnToggleInterfaz");
        const btnTogglePerfil = $("btnTogglePerfil");
        const panelInterfaz = $("panelInterfaz");
        const panelPerfil = $("panelPerfil");

        if (btnToggleInterfaz && btnTogglePerfil) {
            btnToggleInterfaz.addEventListener("click", (e) => {
                e.stopPropagation();
                panelInterfaz.hidden = !panelInterfaz.hidden;
                panelPerfil.hidden = true;
            });

            btnTogglePerfil.addEventListener("click", (e) => {
                e.stopPropagation();
                panelPerfil.hidden = !panelPerfil.hidden;
                panelInterfaz.hidden = true;
            });

            document.addEventListener("click", (e) => {
                if (!panelInterfaz.contains(e.target) && e.target !== btnToggleInterfaz) {
                    panelInterfaz.hidden = true;
                }
                if (!panelPerfil.contains(e.target) && e.target !== btnTogglePerfil) {
                    panelPerfil.hidden = true;
                }
            });
        }

        // Controles de Interfaz en vivo (Colores y Volumen)
        const fontColorInput = $("fontColor");
        const bgColorInput = $("backgroundColor");
        const volumeSlider = $("soundsVolume");
        const volumeTexto = $("volumenTexto");
        const btnMute = $("muteSounds");
        const btnResetTheme = $("resetTheme");

        if (fontColorInput && bgColorInput) {
            fontColorInput.addEventListener("input", (e) => {
                const color = e.target.value;
                document.body.style.color = color;
                document.documentElement.style.setProperty("--text-light-main", color);
                document.documentElement.style.setProperty("--text-light-secondary", color);
            });
            bgColorInput.addEventListener("input", (e) => {
                document.body.style.backgroundColor = e.target.value;
            });
            btnResetTheme.addEventListener("click", () => {
                fontColorInput.value = "#ffffff";
                bgColorInput.value = "#0f172a";
                document.body.style.color = "";
                document.body.style.backgroundColor = "";
                document.documentElement.style.removeProperty("--text-light-main");
                document.documentElement.style.removeProperty("--text-light-secondary");
            });
        }
        // Generador de sonidos nativo (Web Audio API) controlado por la barra de volumen
        let audioCtx = null;
        function reproducirSonido(tipo = "paso") {
            if (!volumeSlider) return;
            const nivel = parseInt(volumeSlider.value, 10);
            if (isNaN(nivel) || nivel <= 0) return;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === "suspended") audioCtx.resume();

            const volumen = (nivel / 100) * 0.25; // Volumen máximo suave y agradable
            const ahora = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            if (tipo === "error") {
                osc.type = "triangle";
                osc.frequency.setValueAtTime(190, ahora);
                osc.frequency.exponentialRampToValueAtTime(130, ahora + 0.18);
                gain.gain.setValueAtTime(volumen, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.2);
                osc.start(ahora);
                osc.stop(ahora + 0.2);
            } else if (tipo === "exito") {
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, ahora); // Do5
                osc.frequency.setValueAtTime(659.25, ahora + 0.11); // Mi5
                gain.gain.setValueAtTime(volumen, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.28);
                osc.start(ahora);
                osc.stop(ahora + 0.28);
            } else {
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, ahora); // La4
                gain.gain.setValueAtTime(volumen * 0.7, ahora);
                gain.gain.exponentialRampToValueAtTime(0.001, ahora + 0.1);
                osc.start(ahora);
                osc.stop(ahora + 0.1);
            }
        }

        if (volumeSlider && btnMute) {
            volumeSlider.addEventListener("input", () => {
                volumeTexto.textContent = `${volumeSlider.value}%`;
            });
            volumeSlider.addEventListener("change", () => {
                reproducirSonido("paso");
            });
            btnMute.addEventListener("click", () => {
                volumeSlider.value = 0;
                volumeTexto.textContent = "0% (Silenciado)";
            });
        }

        // Foto de Perfil (Solo imágenes, alerta si suben otro archivo)
        const inputFotoPerfil = $("userPhoto");
        const previewFotoPerfil = $("previewUserPhoto");
        const errorFotoPerfil = $("error-userPhoto");
        const nombreArchivoFoto = $("nombreArchivoFoto");
        let urlFotoPerfil = null;

        if (inputFotoPerfil) {
            inputFotoPerfil.addEventListener("change", () => {
                const archivo = inputFotoPerfil.files[0];
                errorFotoPerfil.hidden = true;
                errorFotoPerfil.textContent = "";

                if (!archivo) return;

                if (!archivo.type.startsWith("image/")) {
                    errorFotoPerfil.textContent = "Archivo no permitido. Selecciona únicamente una imagen (PNG, JPG o WEBP).";
                    errorFotoPerfil.hidden = false;
                    inputFotoPerfil.value = "";
                    return;
                }

                if (urlFotoPerfil) URL.revokeObjectURL(urlFotoPerfil);
                urlFotoPerfil = URL.createObjectURL(archivo);
                previewFotoPerfil.src = urlFotoPerfil;
                nombreArchivoFoto.textContent = archivo.name;
            });
        }
        /* =====================================================================
           FUNCIONALIDAD 9: VALIDACIÓN DE RFC (SAT) Y CONSTANCIA FISCAL
           ===================================================================== */
        const inputRFC = $("rfc");
        const inputConstancia = $("fiscalSituacion");

        // Autocorrección en vivo: convierte a mayúsculas y elimina espacios
        if (inputRFC) {
            inputRFC.addEventListener("input", function () {
                this.value = this.value.toUpperCase().replace(/\s+/g, "");
            });
        }

        function validarRFCCompleto(valor) {
            if (!valor) return "El RFC es obligatorio.";
            if (/[^A-ZÑ&0-9]/.test(valor)) {
                return "No se permiten espacios, guiones, puntos, acentos ni símbolos especiales (solo letras A-Z, Ñ, & y números).";
            }
            if (valor.length < 12 || valor.length > 13) {
                return "El RFC debe tener exactamente 12 caracteres (Persona Moral) o 13 caracteres (Persona Física) con homoclave.";
            }

            // Validar estructura: 3 o 4 letras + 6 dígitos fecha + 3 caracteres homoclave
            const regexSAT = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z0-9]{3})$/;
            const match = valor.match(regexSAT);
            if (!match) {
                return "Formato inválido. Verifica iniciales, fecha válida (AAMMDD) y homoclave de 3 caracteres (Ej. GODE561231GR8).";
            }

            // Validar días reales del mes (ej. no aceptar 31 de febrero o 31 de abril)
            const anio = parseInt(match[2], 10);
            const mes = parseInt(match[3], 10);
            const dia = parseInt(match[4], 10);
            const diasPorMes = [31, (anio % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (dia > diasPorMes[mes - 1]) {
                return "La fecha (AAMMDD) dentro del RFC no corresponde a un día válido del calendario.";
            }

            return "";
        }

        // Validar Constancia de Situación Fiscal (Documentos o Imágenes, NO videos)
        function validarConstanciaFiscal() {
            const errorEl = $("error-fiscalSituacion");
            const campo = inputConstancia.closest(".field");
            const archivo = inputConstancia.files[0];
            let msg = "";

            if (!archivo) {
                msg = "Debes adjuntar tu Constancia de Situación Fiscal (documento o imagen).";
            } else {
                const tiposPermitidos = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ];
                const esImagen = archivo.type.startsWith("image/");
                const esDocumento = tiposPermitidos.includes(archivo.type) || /\.(pdf|doc|docx)$/i.test(archivo.name);

                if (!esImagen && !esDocumento) {
                    msg = "Archivo no permitido. Solo se aceptan documentos (PDF, Word) o imágenes (PNG, JPG, WEBP). No se permiten videos.";
                }
            }

            if (campo) campo.classList.toggle("is-invalid", msg !== "");
            if (errorEl) {
                errorEl.textContent = msg;
                errorEl.hidden = msg === "";
            }
            return msg === "";
        }

        if (inputConstancia) {
            inputConstancia.addEventListener("change", validarConstanciaFiscal);
        }
        /* =====================================================================
           FUNCIONALIDAD 10: WIZARD DE 4 PASOS PARA MÓDULOS DE PRÁCTICA (SECCIÓN 02)
           ===================================================================== */
        const formPractica = $("formPractica");
        if (formPractica) {
            const tarjetaPrac = $("practicaWizard");
            const panelesPrac = [...formPractica.querySelectorAll(".practica-panel")];
            const itemsPrac = [...document.querySelectorAll("#practicaStepperList .stepper-item")];
            const barraPrac = $("practicaProgress");
            const bannerPrac = $("bannerPractica");
            const btnPracAnt = $("btnPracAnterior");
            const btnPracSig = $("btnPracSiguiente");
            const btnPracSigTxt = $("btnPracSiguienteTexto");
            const btnPracSigIco = $("btnPracSiguienteIcono");
            const btnPracLimpiar = $("btnPracLimpiar");
            let pasoPrac = 1;

         function mostrarBannerPrac(texto, tipo) {
             bannerPrac.textContent = texto;
             bannerPrac.className = "form-banner is-" + tipo;
             bannerPrac.hidden = false;
             reproducirSonido(tipo === "warning" ? "error" : "exito");
             }
            function ocultarBannerPrac() {
                bannerPrac.hidden = true;
                bannerPrac.textContent = "";
            }

            // Filtro de Citas (Paso 1 Práctica)
            const radioMes = $("appoimentByMonth");
            const radioSemana = $("appoimentByWeek");
            const inputMes = $("filtroMes");
            const inputSemana = $("filtroSemana");
            const btnVerCitas = $("verCitas");
            const tituloTablaCitas = $("tituloTablaCitas");

            function validarFiltroCitas() {
                const errMes = $("error-filtroMes");
                const errSem = $("error-filtroSemana");
                const campoMes = inputMes.closest(".field") || inputMes.parentElement;
                const campoSem = inputSemana.closest(".field") || inputSemana.parentElement;

                if (errMes) errMes.hidden = true;
                if (errSem) errSem.hidden = true;
                if (campoMes) campoMes.classList.remove("is-invalid");
                if (campoSem) campoSem.classList.remove("is-invalid");

                if (radioMes.checked && !inputMes.value) {
                    if (errMes) {
                        errMes.textContent = "Selecciona un mes para continuar.";
                        errMes.hidden = false;
                    }
                    if (campoMes) campoMes.classList.add("is-invalid");
                    return inputMes;
                }
                if (radioSemana.checked && !inputSemana.value) {
                    if (errSem) {
                        errSem.textContent = "Selecciona una semana para continuar.";
                        errSem.hidden = false;
                    }
                    if (campoSem) campoSem.classList.add("is-invalid");
                    return inputSemana;
                }
                return null;
            }

            radioMes.addEventListener("change", () => {
                inputMes.disabled = false;
                inputMes.required = true;
                inputSemana.disabled = true;
                inputSemana.required = false;
                inputSemana.value = "";
                if ($("error-filtroSemana")) $("error-filtroSemana").hidden = true;
                const cSem = inputSemana.closest(".field") || inputSemana.parentElement;
                if (cSem) cSem.classList.remove("is-invalid");
            });

            radioSemana.addEventListener("change", () => {
                inputMes.disabled = true;
                inputMes.required = false;
                inputMes.value = "";
                inputSemana.disabled = false;
                inputSemana.required = true;
                if ($("error-filtroMes")) $("error-filtroMes").hidden = true;
                const cMes = inputMes.closest(".field") || inputMes.parentElement;
                if (cMes) cMes.classList.remove("is-invalid");
            });

            btnVerCitas.addEventListener("click", () => {
                const invalido = validarFiltroCitas();
                if (invalido) {
                    invalido.focus();
                    return;
                }
                if (radioMes.checked) {
                    const [anio, mes] = inputMes.value.split("-");
                    const nombresMeses = [
                        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                    ];
                    const nombreMes = nombresMeses[parseInt(mes, 10) - 1];
                    tituloTablaCitas.textContent = `Las citas programadas para ${nombreMes} de ${anio} son:`;
                               } else {
                    const [anio, semana] = inputSemana.value.split("-W");
                    const numSemana = parseInt(semana, 10);
                    tituloTablaCitas.textContent = `Las citas programadas para Semana ${numSemana} del ${anio} son:`;
                }

            });

            inputMes.addEventListener("change", () => { if (inputMes.value) validarFiltroCitas(); });
            inputSemana.addEventListener("change", () => { if (inputSemana.value) validarFiltroCitas(); });


            // Solicitud de Herramientas (Paso 4 Práctica)
            const selectPieza = $("selectPieza");
            const inputCantidad = $("toolQuantity");
            const btnRequestTool = $("requestTool");

            btnRequestTool.addEventListener("click", () => {
                const errPieza = $("error-selectPieza");
                const errCant = $("error-toolQuantity");
                let valido = true;

                if (!selectPieza.value) {
                    errPieza.textContent = "Debes elegir una pieza antes de solicitar.";
                    errPieza.hidden = false;
                    selectPieza.closest(".field").classList.add("is-invalid");
                    valido = false;
                } else {
                    errPieza.hidden = true;
                    selectPieza.closest(".field").classList.remove("is-invalid");
                }

                const cantidad = parseInt(inputCantidad.value, 10);
                if (isNaN(cantidad) || cantidad <= 0) {
                    errCant.textContent = "Ingresa una cantidad mayor a 0.";
                    errCant.hidden = false;
                    inputCantidad.closest(".field").classList.add("is-invalid");
                    valido = false;
                } else {
                    errCant.hidden = true;
                    inputCantidad.closest(".field").classList.remove("is-invalid");
                }

                if (!valido) return;

                const catRadio = document.querySelector('input[name="resourceCategory"]:checked');
                const categoria = catRadio ? catRadio.value : "Refacción";
                const nombrePieza = selectPieza.options[selectPieza.selectedIndex].text;
                const tbody = $("tbodyHerramientas");

                const nuevaFila = document.createElement("tr");
                nuevaFila.innerHTML = `<td>${tbody.rows.length + 1}.</td><td>${nombrePieza}</td><td>${categoria}</td><td>${cantidad}</td><td>piezas</td>`;
                tbody.appendChild(nuevaFila);

                const totalEl = $("totalUnidades");
                totalEl.textContent = parseInt(totalEl.textContent, 10) + cantidad;

                mostrarBannerPrac(`Herramienta solicitada: ${cantidad} pieza(s) de "${nombrePieza}" (${categoria}) agregada(s) a la lista.`, "success");

                selectPieza.selectedIndex = 0;
                inputCantidad.value = "";
            });
            // Validación por paso de la Sección 02
            function validarPasoPractica(n) {
                if (n === 1) {
                    return validarFiltroCitas();
                }
                if (n === 2) {
                    const errRFC = $("error-rfc");
                    const msgRFC = validarRFCCompleto(inputRFC.value.trim());
                    inputRFC.closest(".field").classList.toggle("is-invalid", msgRFC !== "");
                    errRFC.textContent = msgRFC;
                    errRFC.hidden = msgRFC === "";
                    const constanciaOk = validarConstanciaFiscal();
                    if (msgRFC !== "") return inputRFC;
                    if (!constanciaOk) return inputConstancia;
                }
                if (n === 3) {
                    const camposCita = [$("dateAppoiment"), $("locations"), $("descritionText")];
                    let primero = null;
                    camposCita.forEach(c => {
                        const err = $("error-" + c.id);
                        const vacio = c.value.trim() === "";
                        c.closest(".field").classList.toggle("is-invalid", vacio);
                        err.textContent = vacio ? MSG_OBLIGATORIO : "";
                        err.hidden = !vacio;
                        if (vacio && !primero) primero = c;
                    });
                    return primero;
                }
             if (n === 4) {
                 const filasActuales = $("tbodyHerramientas").rows.length;
                 if (filasActuales > 4 && !selectPieza.value && inputCantidad.value.trim() === "") {
                     return null;
                 }
                 const errPieza = $("error-selectPieza");
                 const errCant = $("error-toolQuantity");
                 const cantidad = parseInt(inputCantidad.value, 10);
                 if (!selectPieza.value) {
                     errPieza.textContent = "Debes elegir una pieza.";
                     errPieza.hidden = false;
                     selectPieza.closest(".field").classList.add("is-invalid");
                     return selectPieza;
                 }
                 if (isNaN(cantidad) || cantidad <= 0) {
                     errCant.textContent = "La cantidad debe ser mayor a 0.";
                     errCant.hidden = false;
                     inputCantidad.closest(".field").classList.add("is-invalid");
                     return inputCantidad;
                 }
             }
                return null;
            }

            function mostrarPasoPrac(n, desplazar = true) {
                pasoPrac = n;
                panelesPrac.forEach((p, i) => { p.hidden = i !== n - 1; });
                itemsPrac.forEach((li, i) => {
                    const num = i + 1;
                    li.classList.toggle("is-active", num === n);
                    li.classList.toggle("is-done", num < n);
                    li.querySelector(".step-icon").textContent = num < n ? "check" : li.dataset.icon;
                });
                barraPrac.style.width = ((n - 1) / 3) * 100 + "%";
                btnPracAnt.disabled = n === 1;
                btnPracSigTxt.textContent = n === 4 ? "Finalizar Práctica" : "Siguiente";
                btnPracSigIco.textContent = n === 4 ? "check_circle" : "arrow_forward";
                ocultarBannerPrac();
                panelesPrac[n - 1].querySelector(".panel-head").after(bannerPrac);
                if (desplazar) tarjetaPrac.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            function irAPasoPrac(destino) {
                if (destino <= pasoPrac) { mostrarPasoPrac(destino); return; }
                for (let i = pasoPrac; i < destino; i++) {
                    const inv = validarPasoPractica(i);
                    if (inv) {
                        if (i !== pasoPrac) mostrarPasoPrac(i);
                        mostrarBannerPrac(MSG_BANNER, "warning");
                        inv.focus();
                        return;
                    }
                }
                mostrarPasoPrac(destino);
            }

            btnPracAnt.addEventListener("click", (e) => {
                e.preventDefault();
                if (pasoPrac > 1) mostrarPasoPrac(pasoPrac - 1);
            });

            itemsPrac.forEach(li => {
                li.addEventListener("click", (e) => {
                    e.preventDefault();
                    irAPasoPrac(Number(li.dataset.step));
                });
            });

            btnPracSig.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const campoInvalido = validarPasoPractica(pasoPrac);
                if (campoInvalido) {
                    mostrarBannerPrac(MSG_BANNER, "warning");
                    campoInvalido.focus();
                    return;
                }

                if (pasoPrac < 4) {
                    mostrarPasoPrac(pasoPrac + 1);
                    return;
                }

                for (let i = 1; i <= 4; i++) {
                    const inv = validarPasoPractica(i);
                    if (inv) {
                        mostrarPasoPrac(i);
                        mostrarBannerPrac(MSG_BANNER, "warning");
                        inv.focus();
                        return;
                    }
                }
                mostrarBannerPrac("¡Módulos de práctica completados y validados correctamente!", "success");
            });

            btnPracLimpiar.addEventListener("click", (e) => {
                e.preventDefault();
                const panel = panelesPrac[pasoPrac - 1];
                panel.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
                panel.querySelectorAll(".field-error").forEach(el => { el.hidden = true; el.textContent = ""; });
                panel.querySelectorAll("input, select, textarea").forEach(el => {
                    if (el.type === "radio") el.checked = el.defaultChecked;
                    else if (el.tagName === "SELECT") el.selectedIndex = 0;
                    else el.value = el.defaultValue;
                });
                if (pasoPrac === 1) {
                    inputMes.disabled = false;
                    inputSemana.disabled = true;
                }
                if (pasoPrac === 4) {
                    const tbody = $("tbodyHerramientas");
                    while (tbody.rows.length > 4) {
                        tbody.deleteRow(tbody.rows.length - 1);
                    }
                    $("totalUnidades").textContent = "10";
                }
                ocultarBannerPrac();
            });
            mostrarPasoPrac(1, false);
        }

        /* =====================================================================
           FUNCIONALIDAD 11: CAMBIO DE VISTA (REGISTRO VS MÓDULOS DE PRÁCTICA)
           ===================================================================== */
        const btnVistaRegistro = $("btnVistaRegistro");
        const btnVistaPractica = $("btnVistaPractica");
        const vistaRegistro = $("vistaRegistro");
        const vistaPractica = $("vistaPractica");

        if (btnVistaRegistro && btnVistaPractica && vistaRegistro && vistaPractica) {
            btnVistaPractica.style.opacity = "0.55";
            btnVistaPractica.style.cursor = "not-allowed";
            btnVistaPractica.title = "Completa y envía primero tu Solicitud de Registro";

            btnVistaRegistro.addEventListener("click", () => {
                vistaRegistro.hidden = false;
                vistaPractica.hidden = true;
                btnVistaRegistro.className = "btn-primary";
                btnVistaPractica.className = "btn-outline";
            });

            btnVistaPractica.addEventListener("click", () => {
                if (!registroCompletado) {
                    mostrarBanner("Debes completar y enviar las 4 secciones de 'Registro Usuario' antes de acceder a los Módulos de Práctica.", "warning");
                    banner.scrollIntoView({ behavior: "smooth", block: "center" });
                    return;
                }
                vistaRegistro.hidden = true;
                vistaPractica.hidden = false;
                btnVistaPractica.className = "btn-primary";
                btnVistaRegistro.className = "btn-outline";
            });
        }
        // Inicialización al cargar la página
        limpiarEdad();
        limpiarQR();
        sincronizarRedes();
        actualizarReglasClave();
        mostrarPaso(1, false);
    });
})();
