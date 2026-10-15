# Prácticas De La Asignatura De Aplicaciones Web
## T.S.U en Desarrollo De Software Multiplataforma
## M.T.I Marco A. Ramírez Hernández

Periodo: Septiembre - Diciembre 2026
---

## 📑 Evidencia del Reto: Despliegue de Portafolio Web

Estudiante: Juan Fernando Hernández López
Carrera: T.S.U. en Desarrollo de Software Multiplataforma (UTXJ)
Proyecto: Mi Primer Portafolio Web Personal
URL Pública: https://250953-cpu.github.io/Practicas_Aplicaciones_Web_250953/

## 🛠️ Procedimiento Realizado

Para lograr la correcta maquetación, corrección y publicación del sitio web se siguieron estos pasos:
1. Estructuración y Maquetación del Proyecto Local:
	• Se estructuró el archivo principal index.html en la raíz utilizando elementos semánticos (<header>, <nav>, <section>, <article>, <footer>).
	• Se diseñó una hoja de estilos css/styles.css aplicando efectos avanzados como fondos fijos (Parallax), efectos de desenfoque translúcido (Glassmorphism / .glass), y transformaciones animadas con :hover.
	• Se configuró el contenedor de la fotografía utilizando display: flex, controlando su resistencia elástica mediante flex-shrink: 0 y forzando la geometría circular con aspect-ratio: 1 / 1.
2. Control de Versiones Continuo con Git:
	• Se gestionaron múltiples confirmaciones de cambios utilizando la terminal local vinculada a la rama de trabajo Practica03.
	• Se utilizaron comandos de indexación y registro como git add . y git commit -m para salvaguardar de forma incremental las fases de diseño del Hero, tarjetas e iconos de redes sociales.
	• Se gestionó la sincronización con el servidor remoto en GitHub mediante git push origin Practica03.
3. Configuración y Despliegue en GitHub Pages:
	• Dentro de la configuración del repositorio remoto en GitHub, se accedió al apartado Settings > Pages.
	• En la sección Build and deployment, se definió el origen como Deploy from a branch.
	• Se seleccionó la rama correspondiente (Practica03) y la carpeta raíz (/root), ejecutando de forma automatizada las GitHub Actions para compilar y generar la URL pública funcional del portafolio.

## ⚠️ Dificultades Encontradas y Soluciones Implementadas

Durante el desarrollo autónomo de la práctica surgieron problemas específicos de maquetación, herencia y control de versiones. A continuación, se detallan las soluciones técnicas aplicadas:

1. Desconfiguración del Bloque de Información en la Portada (Hero Card)

* Dificultad: La información del alumno (título, descripción y botón) se desplazaba de manera incorrecta debajo de la imagen de perfil en lugar de posicionarse a un costado, rompiendo la composición horizontal.
* Causa: El contenedor flexible forzaba el colapso de los elementos debido a la falta de espacio provocada por textos extensos y la ausencia de restricciones de contracción en el elemento vectorizado de la foto.
* Solución: Se implementó flex-shrink: 0; directamente en la clase .perfil para evitar que la imagen circular fuera comprimida por el contenedor elástico. Adicionalmente, se restringieron las dimensiones de la caja de texto mediante un contenedor .hero-contenido regulado con flex: 1;.

2. Invisibilidad de Textos por Contraste Insuficiente (Efecto "Texto Invisible")

* Dificultad: Al cargar la página en el navegador, los títulos de las secciones blancas (como Acerca de mí) y el contenido de los cuatro bloques de datos personales eran imperceptibles o completamente invisibles.
* Causa: Conflicto de especificidad y herencia en CSS. Se había modificado el body con un color gris claro (#CCC), provocando que los textos se fundieran y perdieran contraste sobre las tarjetas y secciones de fondo blanco.
* Solución: Se incrementó la especificidad de las hojas de estilo redefiniendo de forma explícita las reglas .card { color: #222; } y asignando un color oscuro contrastante (color: #1e293b;) a la clase .datos article, devolviendo la legibilidad absoluta a la sección.

3. Deformación y Desborde de Paneles con Imágenes de Fondo (Parallax)

* Dificultad: El recuadro de cristal se visualizaba excesivamente ancho de extremo a extremo de la pantalla, tapando por completo la cabeza del alumno en la imagen de fondo de la portada.
* Causa: Las propiedades max-width e min-height del contenedor Parallax principal estaban sobredimensionadas, provocando un desborde estático y un bloqueo visual del recurso multimedia de fondo.
* Solución: Se compactó la tarjeta controlando sus dimensiones límites a max-width: 580px; y reduciendo el relleno interno vertical (padding: 20px 30px;). Asimismo, se redujeron las dimensiones máximas de la imagen .perfil a un tope de 180px, consiguiendo una tarjeta central minimalista, fina y equilibrada que permite apreciar la fotografía de fondo.

4. Iconos de Redes Sociales Deformes (Caso Especial: YouTube)

* Dificultad: El icono del botón de YouTube se visualizaba de forma tosca, con un relleno sólido asimétrico y sin seguir la estética lineal y traslúcida que sí tenían los logotipos de Instagram y Facebook.
* Causa: El código embebido del SVG original poseía atributos rígidos de dibujo (fill="white" en el polígono y relleno opaco en el path), lo que impedía que respondiera a las transiciones CSS y al estado :hover.
* Solución: Se refactorizó la estructura del vector dentro del HTML reemplazando el bloque por un SVG optimizado de tipo lineal adaptable, configurando los atributos fill="none" y stroke="currentColor". De este modo, el icono responde de manera nativa e inteligente a las tonalidades y animaciones definidas en el archivo CSS.

## 🚀 Conclusión

El desarrollo de este reto individual permitió dominar de forma autodidacta el flujo de trabajo real de un desarrollador web. Se adquirieron conocimientos sólidos en la resolución de problemas lógicos de CSS (Flexbox, especificidad de selectores y diseño adaptativo) y en la implementación de despliegue continuo (CD) mediante GitHub Pages, logrando un portafolio web funcional, pulido y accesible desde cualquier dispositivo.
---
### Tabla de prácticas de la materia

| No. | Nombre | Descripción | Potenciador | Estatus |
|---|---|---|---:|---|
| 1 | Metodología de evaluación de la materia | Transcribir en libreta y comprender la metodología y las fechas de evaluación de la asignatura | 5 | 🟢 Concluida |
| 2 | Mi primera página web | Codificar la primera página web con HTML puro, sin estilos ni funcionalidades | 10 | 🟢 Concluida |
| 3 | Mi Portafolio Web | Codificar y estilizar una página web con los datos del perfil estudiantil y personal | 30 | 🟢 Concluida |
| 4 |Mi Primer Página Web en GitHub Pages.| Hospedaje de la página web| 10 | 🟢 Concluida |
