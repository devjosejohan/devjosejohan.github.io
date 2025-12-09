// --- 1. DATOS Y VARIABLES DE ESTADO ---
let selectedModule = "Word";
let gameDifficulty = "Fácil"; // Dificultad inicial por defecto
let currentCard = "";
let currentTask = "";
let feedbackLog = {}; 

let players = [];
let current_player_index = 0;
let playerScores = {};
let currentScore = 0;

let gameOptions = {
    pointValue: 1,
    subtractValue: 1
};

/* MÓDULOS Y TEMAS EXPANDIDOS */
const modules = {
    Word: ["Cinta de Opciones", "Formato de fuente", "Alineación de párrafo", "Guardar Documento", "Marca de agua", "Índice", "Portapapeles", "Atajos", "Insertar Tabla", "Barra de herramientas", "Diseño de Página", "Tabla de Contenido"],
    Excel: ["Celda", "Filas y Columnas", "Autorrelleno", "Hoja de Cálculo", "Función Suma", "Promedio", "Libro de Excel", "Fórmulas Básicas", "Gráficos", "Diseño de Tablas", "Filtros y Orden", "Referencias Absolutas ($)"],
    PowerPoint: ["Diapositivas", "Diseños", "Transiciones", "Animaciones", "Insertar multimedia", "Vistas de presentación", "Patrón de Diapositivas", "Modo Orador"],
    Windows: ["Mouse", "Partes del teclado", "Escritorio", "Barra de Tareas", "Gestor de archivos", "Carpetas", "Iconos", "Ventana", "Computadora", "Botón de Inicio", "Panel de Control", "Administrador de Tareas"],
    Internet: ["Navegador web", "Motor de Búsqueda", "URL", "Correo Electrónico", "Nube (Cloud)", "Descargas", "VPN", "Phishing", "Dominio (.com, .org)", "Protocolo HTTP/S", "Cookies", "IP"],
    All: []
};

/* TAREAS DEL CUBO: Añadida 'Enseña al Profe' (Solo Dificultad Difícil) */
const ALL_CUBE_TASKS = ["Explica", "Dibuja", "Ejemplifica", "Falso o Verdadero", "Describe 3 características", "Menciona 3 usos", "Actúa / Demuestra", "Enseña al Profe"];

/* ASIGNACIÓN DE TAREAS POR DIFICULTAD (NUEVO) */
const DIFFICULTY_TASKS = {
    "Fácil": ["Explica", "Dibuja", "Falso o Verdadero", "Actúa / Demuestra"],
    "Medio": ["Explica", "Dibuja", "Falso o Verdadero", "Actúa / Demuestra", "Describe 3 características", "Menciona 3 usos"],
    "Difícil": ALL_CUBE_TASKS // Usa todas las tareas
};

// --- PREGUNTAS DE FALSO O VERDADERO (VoF) y DEFINICIONES (Expandidas) ---
const VO_F_QUESTIONS = {
    "Guardar Documento": { q: "Para guardar un documento por primera vez, solo puedes usar 'Guardar como'.", a: false }, 
    "Diseño de Página": { q: "El 'Diseño de Página' solo permite cambiar el color de fondo del documento.", a: false }, // Falso: márgenes, orientación, tamaño
    "Fórmulas Básicas": { q: "Todas las fórmulas en Excel deben comenzar con el signo de dólar ($).", a: false }, 
    "Referencias Absolutas ($)": { q: "Usar $A$10 significa que la celda cambiará si se arrastra la fórmula.", a: false }, // Falso, se mantiene fija
    "Transiciones": { q: "Las transiciones de PowerPoint son los movimientos que tienen los textos e imágenes dentro de una diapositiva.", a: false }, // Falso, son movimientos entre diapositivas
    "Patrón de Diapositivas": { q: "El Patrón de Diapositivas es donde se guarda una copia de la presentación antes de editarla.", a: false }, // Falso, define el diseño maestro
    "Gestor de archivos": { q: "El 'Gestor de archivos' es la única forma de ver los archivos en la computadora.", a: true }, 
    "Administrador de Tareas": { q: "El Administrador de Tareas solo sirve para ver qué programas están abiertos.", a: false }, // Falso, también procesos, rendimiento, etc.
    "VPN": { q: "Usar una VPN garantiza el 100% de anonimato en Internet y te protege de todo ciberataque.", a: false }, 
    "Cookies": { q: "Las cookies son archivos de texto que almacenan tus contraseñas automáticamente.", a: false }, // Falso, solo almacenamiento de sesión/preferencias
    // ... más preguntas ...
};

const DEFINICIONES = {
    "Cinta de Opciones": "Es el panel superior que contiene todas las pestañas (Inicio, Insertar, etc.) y los comandos organizados por grupos.",
    "Referencias Absolutas ($)": "En Excel, el símbolo de dólar ($) se usa para fijar una fila o columna en una fórmula, impidiendo que cambie al ser arrastrada.",
    "Patrón de Diapositivas": "Es la plantilla maestra en PowerPoint que controla el diseño, las fuentes y los fondos de toda la presentación de manera uniforme.",
    "Administrador de Tareas": "Es la utilidad de Windows que permite ver los procesos activos, el rendimiento del sistema y cerrar aplicaciones que no responden.",
    "Cookies": "Pequeños archivos de texto que un sitio web guarda en tu PC para recordar información sobre ti (preferencias, inicio de sesión) en futuras visitas.",
    // ... más definiciones ...
};


// --- IMPLEMENTACIÓN DE LÓGICA ---

// --- NUEVA FUNCIÓN: Toggle Theme ---
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
}

function registerPlayers() {
    // ... (Lógica de registro de jugadores idéntica a V7.1) ...
    const numPlayers = parseInt(prompt("¿Cuántos jugadores o equipos van a participar? (Mínimo 1)", 1));
    if (isNaN(numPlayers) || numPlayers < 1) {
        alert("Número de jugadores no válido.");
        return;
    }
    players = [];
    playerScores = {};
    for (let i = 0; i < numPlayers; i++) {
        let name = prompt(`Introduce el nombre del Jugador/Equipo ${i + 1}:`);
        if (name) {
            players.push(name);
            playerScores[name] = 0;
        }
    }
    if (players.length > 0) {
        current_player_index = 0;
        alert(`¡${players.length} jugadores registrados! El juego comienza con ${players[0]}.`);
    } else {
        players = [];
        alert("Volviendo a modo individual.");
    }
    updatePlayerDisplay();
    resetRound();
}

function updatePlayerDisplay() {
    // ... (Lógica de actualización de jugadores idéntica a V7.1) ...
    const playerNameElement = document.getElementById("current-player-name");
    const scoreElement = document.getElementById("score-display");

    if (!players.length) {
        playerNameElement.textContent = "Individual (Sin registro)";
        playerNameElement.style.color = "#8B0000";
        scoreElement.textContent = `Puntuación: ${currentScore}`;
    } else {
        const currentPlayerName = players[current_player_index];
        currentScore = playerScores[currentPlayerName];
        playerNameElement.textContent = currentPlayerName;
        playerNameElement.style.color = "#006400";
        scoreElement.textContent = `Puntuación: ${currentScore}`;
    }
    
    // Actualizar display de dificultad
    document.getElementById("current-difficulty").textContent = gameDifficulty.toUpperCase();
}

function nextPlayer() {
    // ... (Lógica de cambio de jugador idéntica a V7.1) ...
    if (players.length) {
        if (current_player_index === players.length - 1) {
            console.log("\n--- RESUMEN DE PUNTUACIONES ---");
            for (const [player, score] of Object.entries(playerScores)) {
                console.log(`  ${player}: ${score} puntos`);
            }
            console.log("---------------------------------");
        }
        current_player_index = (current_player_index + 1) % players.length;
        alert(`Turno para ${players[current_player_index]}.`);
    }
    updatePlayerDisplay();
    resetRound();
}

function updateFeedbackLogDisplay() {
    // ... (Lógica de actualización del log idéntica a V7.1) ...
    const listElement = document.getElementById('feedback-list');
    listElement.innerHTML = '';
    let hasContent = false;

    const sortedFeedback = Object.entries(feedbackLog)
        .map(([card, data]) => ({ 
            card, 
            difficultCount: data['Difícil'] || 0,
            masteryCount: data['Maestría'] || 0 // Usamos 'Maestría' para el botón 'Fácil'
        }))
        // Ordenar por el número de veces que requiere refuerzo
        .sort((a, b) => b.difficultCount - a.difficultCount); 

    for (const item of sortedFeedback) {
        // Mostrar todos los temas que han sido jugados para el contexto del tutor
        const p = document.createElement('p');
        p.innerHTML = `<span class="${item.difficultCount > item.masteryCount ? 'difficult-item' : ''}">${item.card}</span> (R: ${item.difficultCount} / M: ${item.masteryCount})`;
        listElement.appendChild(p);
        hasContent = true;
    }

    if (!hasContent) {
        listElement.innerHTML = '<p>Temas más difíciles aparecerán aquí...</p>';
    }
}

function getModuleCards() {
    // ... (Lógica de obtención de cartas idéntica a V7.1) ...
    if (selectedModule === "All") return Object.values(modules).flat();
    return modules[selectedModule];
}

function resetRound() {
    // ... (Lógica de reseteo de ronda idéntica a V7.1) ...
    currentCard = "";
    currentTask = "";
    document.getElementById("btn-cube").disabled = true;
    document.getElementById("btn-plus").disabled = true;
    document.getElementById("btn-minus").disabled = true;
    document.getElementById("btn-easy").disabled = true;
    document.getElementById("btn-hard").disabled = true;
    
    document.getElementById("task-title").textContent = "";
    document.getElementById("task-body").textContent = "";
    document.getElementById("error-tip").textContent = "";
    document.getElementById("help-text").textContent = "";
    document.getElementById("card-name").innerHTML = "Esperando Carta...";
}

function animateScoreChange(isPositive) {
    // ... (Lógica de animación de puntuación idéntica a V7.1) ...
    const scoreElement = document.getElementById("score-display");
    const originalColor = scoreElement.style.color;
    const tempColor = isPositive ? '#00ff00' : '#ff0000';
    
    scoreElement.style.color = tempColor;
    setTimeout(() => {
        scoreElement.style.color = originalColor;
    }, 300);
}

function animateCardDraw(element, originalText) {
    // ... (Lógica de animación de carta idéntica a V7.1) ...
    element.innerHTML = 'Carta (Tema): <span style="color:#ff8c00;">SACANDO...</span>';
    setTimeout(() => {
        element.innerHTML = originalText;
    }, 500);
}

function selectCard() {
    const cards = getModuleCards();
    if (!cards || cards.length === 0) {
        alert("Error: El módulo no tiene cartas.");
        return;
    }

    currentCard = cards[Math.floor(Math.random() * cards.length)];
    
    document.getElementById("task-title").textContent = "";
    document.getElementById("task-body").textContent = "";
    document.getElementById("error-tip").textContent = "";
    document.getElementById("help-text").textContent = "";
    
    // RESALTE DE TEMA: Usamos un span para aplicar el estilo de resaltado (bold y color)
    animateCardDraw(document.getElementById("card-name"), `Carta (Tema): <span style="color: #f1c40f; font-weight: bold;">${currentCard}</span>`);

    document.getElementById("btn-cube").disabled = false;
    console.log(`Turno: Carta '${currentCard}'`);
}

function rollCube() {
    if (!currentCard) {
        alert("Primero debes sacar una carta.");
        return;
    }
    
    // FILTRAR TAREAS SEGÚN DIFICULTAD (NUEVO)
    const availableTasks = DIFFICULTY_TASKS[gameDifficulty];
    currentTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];

    const [explanation, errorTip] = getTaskExplanation(currentCard, currentTask);

    document.getElementById("task-title").textContent = `TAREA: ${currentTask.toUpperCase()}`;
    document.getElementById("task-body").textContent = explanation;
    document.getElementById("error-tip").textContent = errorTip;
    
    document.getElementById("btn-plus").disabled = false;
    document.getElementById("btn-minus").disabled = false;
    document.getElementById("btn-easy").disabled = false;
    document.getElementById("btn-hard").disabled = false;
    document.getElementById("btn-cube").disabled = true; 

    console.log(`Tarea: ${currentTask}`);
}

// --- FUNCIÓN CENTRAL DE EXPLICACIÓN DE TAREAS (ACTUALIZADA) ---
function getTaskExplanation(carta, tarea) {
    let explanation = "";
    let errorTip = "";

    switch (tarea) {
        case "Explica": explanation = `Objetivo: Define el concepto de '${carta}', su propósito y da un ejemplo práctico.`; break;
        case "Dibuja": explanation = `Objetivo: Representa visualmente '${carta}' haciendo un boceto rápido (en un pizarrón o papel).`; break;
        case "Ejemplifica": explanation = `Objetivo: Muestra un escenario real o práctico donde se aplica '${carta}' (puedes usar el computador).`; break;
        case "Describe 3 características": explanation = `Objetivo: Indica 3 rasgos distintivos o cualidades esenciales de '${carta}'.`; break;
        case "Menciona 3 usos": explanation = `Objetivo: Da 3 ejemplos de la utilidad de '${carta}' en la práctica diaria.`; break;
        
        case "Falso o Verdadero":
            const vofEntry = VO_F_QUESTIONS[carta];
            if (vofEntry) {
                explanation = `Objetivo: Determina si la siguiente afirmación es verdadera (V) o falsa (F).`;
                errorTip = `Pregunta (El Tutor dice): "${vofEntry.q}" | Respuesta Correcta: ${vofEntry.a ? 'VERDADERO' : 'FALSO'}`;
            } else {
                explanation = `Objetivo: El profesor debe hacer una pregunta de Falso o Verdadero sobre '${carta}'.`;
                errorTip = `Pregunta: Tutor, crea una pregunta VoF para ${carta}.`;
            }
            break;
        
        case "Actúa / Demuestra":
            explanation = `Objetivo: ¡ACCIÓN! Simula o demuestra físicamente, sin usar el mouse, cómo usarías o accederías a '${carta}'.`;
            break;
            
        case "Enseña al Profe":
            explanation = `Objetivo: (DIFICULTAD EXPERTO) Asume el rol de tutor. Explica un concepto relacionado con '${carta}' que NO esté en la carta. ¡Demuestra tu maestría!`;
            break;
    }
    return [explanation, errorTip];
}

function scoreAction(points) {
    // ... (Lógica de puntuación idéntica a V7.1) ...
    if (!currentCard) return;

    if (players.length) {
        const playerName = players[current_player_index];
        playerScores[playerName] += points;
        currentScore = playerScores[playerName];
    } else {
        currentScore += points;
    }

    updatePlayerDisplay();
    animateScoreChange(points > 0);

    document.getElementById("btn-plus").disabled = true;
    document.getElementById("btn-minus").disabled = true;

    alert(`Puntuación: ${currentScore}\n\nAhora, registra el nivel de reto.`);
}

function logFeedback(difficulty) {
    // El botón 'Fácil' ahora registra 'Maestría'
    const logKey = difficulty === 'Fácil' ? 'Maestría' : 'Difícil'; 
    
    if (!currentCard) return;

    if (!feedbackLog[currentCard]) feedbackLog[currentCard] = { 'Difícil': 0, 'Maestría': 0 };
    feedbackLog[currentCard][logKey] += 1;
    console.log(`\nFeedback registrado: ${currentCard} fue ${logKey}`);

    updateFeedbackLogDisplay(); 

    if (logKey === "Difícil") {
        const definition = DEFINICIONES[currentCard] || "No hay una definición rápida disponible para este tema.";
        document.getElementById("help-text").textContent = `📌 AYUDA RÁPIDA (${currentCard}): ${definition}`;
        alert("Ayuda activada. ¡Revisa la definición!");
    } else {
        document.getElementById("help-text").textContent = "¡Excelente dominio del tema! Continúa así.";
    }

    document.getElementById("btn-easy").disabled = true;
    document.getElementById("btn-hard").disabled = true;
    
    if (players.length) {
        nextPlayer();
    } else {
        resetRound();
    }
}

function openOptions() {
    const newPointValue = parseInt(prompt("Puntos por respuesta Correcta:", gameOptions.pointValue));
    const newSubtractValue = parseInt(prompt("Puntos a restar por Incorrecto:", gameOptions.subtractValue));

    if (!isNaN(newPointValue) && newPointValue > 0 && !isNaN(newSubtractValue) && newSubtractValue > 0) {
        gameOptions.pointValue = newPointValue;
        gameOptions.subtractValue = newSubtractValue;

        document.getElementById("btn-plus").textContent = `Correcto (+${gameOptions.pointValue})`;
        document.getElementById("btn-minus").textContent = `Incorrecto (-${gameOptions.subtractValue})`;
        alert("Opciones de puntuación actualizadas.");
    } else {
        alert("Valores de puntuación no válidos. Usando configuración anterior.");
    }
    
    // LÓGICA DE MODO OSCURO CORREGIDA: Alterna el modo actual
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    const changeTheme = confirm(`El tema actual es ${currentTheme.toUpperCase()}. ¿Deseas cambiarlo a ${newTheme.toUpperCase()}?`);
    
    if (changeTheme) {
        toggleTheme();
    }
}

function resetGame() {
    // ... (Lógica de reseteo total idéntica a V7.1) ...
    if (confirm("¿Estás seguro de que quieres borrar la puntuación, el registro y los jugadores?")) {
        currentScore = 0;
        feedbackLog = {}; 
        players = [];
        playerScores = {};
        current_player_index = 0;

        updateFeedbackLogDisplay(); 
        updatePlayerDisplay();
        
        // Redirigir al menú principal en lugar de resetear aquí
        alert("Juego reseteado. Volviendo al menú principal.");
        window.location.href = 'index.html'; 
    }
}

window.onload = function() {
    // Carga la dificultad guardada o usa "Fácil"
    const storedDifficulty = localStorage.getItem('gameDifficulty');
    if (storedDifficulty) {
        gameDifficulty = storedDifficulty;
        document.getElementById("current-difficulty").textContent = gameDifficulty.toUpperCase();
    } else {
        // Si no hay dificultad, forzamos al usuario a pasar por el menú
        window.location.href = 'index.html';
        return;
    }
    document.getElementById("module-select").value = "Word"; 
    updatePlayerDisplay();
    updateFeedbackLogDisplay();
};