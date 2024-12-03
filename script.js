document.addEventListener('DOMContentLoaded', () => {
    // Eventos para el login
    document.getElementById('entrarBtn').addEventListener('click', login);
    document.getElementById('password').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            login();
        }
    });

    // Evento para mostrar el contenedor de cédula al seleccionar un archivo
    document.getElementById('fileInput').addEventListener('change', toggleCedulaContainer);

    // Eventos para buscar persona y regresar
    document.getElementById('buscarBtn').addEventListener('click', buscarPersona);
    document.getElementById('regresarBtn').addEventListener('click', regresar);

    // Evento para generar constancia
    document.getElementById('generateBtn').addEventListener('click', generarConstancia);

    // Evento para regresar al formulario desde la constancia
    document.getElementById('regresarConstanciaBtn').addEventListener('click', regresarConstancia);
});

let personas = []; // Almacena los datos del CSV

// Función de Login
function login() {
    const passwordInput = document.getElementById('password').value;
    if (passwordInput === 'Incess2024') {
        toggleVisibility('formContainer', 'loginContainer', 'passwordError', false);
    } else {
        toggleVisibility('passwordError', false);
    }
}

// Función para mostrar y ocultar elementos
function toggleVisibility(...elements) {
    elements.forEach(element => {
        if (typeof element === 'string') {
            const elem = document.getElementById(element);
            if (elem) {
                elem.classList.toggle('hidden');
            }
        }
    });
}

// Función para mostrar el contenedor de cédula al seleccionar un archivo
function toggleCedulaContainer() {
    const file = document.getElementById('fileInput').files[0];
    const cedulaContainer = document.getElementById('cedulaContainer');
    if (file) {
        cedulaContainer.classList.remove('hidden');
    } else {
        cedulaContainer.classList.add('hidden');
    }
}

// Función de regreso al formulario
function regresar() {
    toggleVisibility('cedulaContainer', 'resultado', 'generateBtn');
    document.getElementById('fileInput').value = ''; // Reiniciar el input de archivo
}

// Función para buscar persona
function buscarPersona() {
    const fileInput = document.getElementById('fileInput');
    const cedulaInput = document.getElementById('cedulaInput').value.trim();

    if (!fileInput.files.length) {
        alert('Por favor, selecciona un archivo CSV.');
        return;
    }
    if (!cedulaInput) {
        alert('Por favor, ingrese una Cédula o ID.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        
        // Usamos PapaParse para leer el archivo CSV
        const parsed = Papa.parse(data, { header: true, skipEmptyLines: true });
        personas = parsed.data;

        // Encontramos a la persona por cédula
        const persona = personas.find(p => p['Cedula'] === cedulaInput);
        if (persona) {
            const nombre = persona['Nombre'] || 'Nombre no disponible';
            const apellido = persona['Apellido'] || 'Apellido no disponible';

            // Mostrar resultado y habilitar generar constancia
            document.getElementById('resultado').textContent = `Persona encontrada: ${nombre} ${apellido}`;
            toggleVisibility('resultado', 'generateBtn');
        } else {
            alert('No se encontró una persona con esa Cédula o ID.');
            toggleVisibility('resultado', 'generateBtn', true);
        }
    };
    reader.readAsText(fileInput.files[0]);
}

function generarConstancia() {
    const cedulaInput = document.getElementById('cedulaInput').value.trim();
    const persona = personas.find(p => p['Cedula'] === cedulaInput);

    if (!persona) {
        alert("No se ha encontrado la persona. Por favor, verifica la cédula.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'letter');  // Cambiar a formato CARTA (8.5" x 11")

    // Márgenes especificados (en milímetros)
    const marginTop = 25;  // Superior: 25 mm (2.5 cm)
    const marginBottom = 25;  // Inferior: 25 mm (2.5 cm)
    const marginLeft = 30;  // Izquierdo: 30 mm (3 cm)
    const marginRight = 30;  // Derecho: 30 mm (3 cm)

    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();

    // Configurar la fuente a Times New Roman
    doc.setFont("times", "normal");

    // --- ENCABEZADO ---
    const encabezadoRuta = 'images/imagen1.jpeg';  // Reemplaza con la ruta de tu imagen
    if (encabezadoRuta) {
        doc.addImage(encabezadoRuta, 'JPEG', 0, 0, docWidth, 20); // El encabezado tiene una altura de 20
    }

    // Título de la constancia (centrado, un poco más bajo)
    doc.setFontSize(18);
    const tituloY = marginTop + 15;  // Ajustamos el título para que esté más abajo
    doc.text('CONSTANCIA', docWidth / 2, tituloY, { align: 'center' });

    // Subrayar el título de la constancia (centrado)
    const tituloX = (docWidth - doc.getTextWidth('CONSTANCIA')) / 2;
    const subrayadoY = tituloY + 3; // Un poco más abajo para el subrayado
    const tituloAncho = doc.getTextWidth('CONSTANCIA');
    doc.setLineWidth(0.5);
    doc.line(tituloX, subrayadoY, tituloX + tituloAncho, subrayadoY);

    // --- TEXTO DE LA CONSTANCIA ---
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    const fechaTexto = `los ${day} días del mes de ${month} de ${year}`;

    // Unidad curricular con validación de caracteres especiales
    let unidadCurricular = persona['Denominacion de la Formacion'] || 'No disponible';
    unidadCurricular = unidadCurricular.replace(/[^\x20-\x7E\u00C0-\u017F]/g, '');  // Permite acentos y caracteres especiales latinos

    // Combinamos todo el texto en la variable 'texto' (incluyendo datos CSV)
    const texto = `La Coordinación del Centro de Formación Socialista Carora, INCES Región-Lara hace constar, por medio de la presente, que el (a) ciudadano(a): ${persona['Nombre'].toUpperCase()} ${persona['Apellido'].toUpperCase()}, Portador(a) de la Cédula de Identidad V- ${persona['Cedula']}, participó en la formación de la Unidad Curricular: ${unidadCurricular}, con una duración ${persona['Horas']} horas, con fecha de inicio el: ${persona['Fecha de Inicio']} y fecha de término el: ${persona['Fecha de Cierre']}.

Constancia que se expide a petición de parte interesada en el Municipio Torres, Parroquia Trinidad Samuel, Estado Lara a ${fechaTexto}.


                                                                Atentamente

    
                                                                ___________
                                                                Jesus Campos
                                                               Jefe de Centro
                     Según el orden administrativo N OA-2024-02-29 de fecha 15-02-2024;`;

    // --- Función para justificar el texto ---
    function justificarTexto(doc, texto, marginLeft, marginRight, docWidth, startY) {
        doc.setFontSize(11); // Fuente tamaño 11
        const lines = doc.splitTextToSize(texto, docWidth - marginLeft - marginRight); // Ajuste de tamaño de línea
        let yOffset = startY; // Usamos el valor de startY para ajustar la posición de inicio del texto

        const lineHeight = 1.5 * 5.85; // Interlineado doble con espaciado anterior 5.85 cm
        const lineSpacing = lineHeight; // Usamos la misma medida para el espaciado

        lines.forEach(line => {
            const lineWidth = doc.getTextWidth(line);
            const words = line.split(' ');

            // Verificamos si la línea tiene más de una palabra
            if (words.length > 1) {
                const spaceToAdd = (docWidth - marginLeft - marginRight - lineWidth) / (words.length - 1); // Calcular el espacio a añadir entre palabras

                // Limitar la cantidad de espacio que se puede añadir (ajustar el factor de control)
                const maxSpace = Math.min(spaceToAdd, 4); // Limitar la cantidad de espacio
                const justifiedLine = words.join(' '.repeat(Math.max(maxSpace, 1)));
                doc.text(justifiedLine, marginLeft, yOffset);
            } else {
                doc.text(line, marginLeft, yOffset); // Si solo tiene una palabra, no la justificamos
            }

            yOffset += lineSpacing; // Ajuste para el interlineado
        });

        return yOffset; // Retorna la última posición Y para continuar con el siguiente texto
    }

    // --- Ajuste de la posición inicial para el texto ---
    const espacioExtra = 20; // 0.8 cm = 15 mm
    let startY = tituloY + 20 + espacioExtra; // 15 mm abajo del título

    // Justificamos el texto principal
    let yOffset = justificarTexto(doc, texto, marginLeft, marginRight, docWidth, startY);

    yOffset += 12; // Ajuste para el pie de página

    const piePaginaRuta = 'images/imagen2.jpeg';  // Reemplaza con la ruta de tu imagen
    if (piePaginaRuta) {
        doc.addImage(piePaginaRuta, 'JPEG', 0, docHeight - 20, docWidth, 20); // El pie de página tiene una altura de 20
    }

    // Guardar el PDF
    doc.save(`constancia_${persona['Nombre'].replace(/\s/g, '_')}_${persona['Apellido'].replace(/\s/g, '_')}.pdf`);
}
