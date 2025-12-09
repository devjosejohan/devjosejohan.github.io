// --- 1. DATOS DEL JUEGO (EXPANDIDOS) ---
const MODULE_WORDS = {
    Windows: {
        words: ["ESCRITORIO", "BARRA", "CARPETA", "EXPLORADOR", "ICONO", "VENTANA", "MOUSE", "TECLADO", "PAPELERA", "INICIO", "ATAJO", "CONFIG"],
        size: 12,
        color: '#17a2b8' 
    },
    Word: {
        words: ["FUENTE", "TABLA", "CINTA", "INDICE", "FORMATO", "PORTADA", "PARRAFO", "ATUENDO", "MARGEN", "IMAGEN", "ESTILO", "GUARDAR"],
        size: 12,
        color: '#007bff' 
    },
    Excel: {
        words: ["CELDA", "FORMULA", "SUMA", "GRAFICO", "HOJA", "FILTRO", "RANGO", "COLUMNA", "FUNCION", "DATO", "LIBRO", "AUTOSUMA"],
        size: 12,
        color: '#28a745' 
    },
    PowerPoint: {
        words: ["DIAPOSITIVA", "TRANSICION", "ANIMACION", "PRESENTACION", "DISENO", "TEXTO", "IMAGEN", "MULTIMEDIA", "PLANTILLA", "MODO"],
        size: 12,
        color: '#ffc107' 
    },
    Internet: {
        words: ["URL", "PHISHING", "NUBE", "NAVEGADOR", "WIFI", "EMAIL", "PROTOCOLO", "BUSCADOR", "SERVIDOR", "DOMINIO", "RED", "SEGURIDAD"],
        size: 14,
        color: '#dc3545' 
    },
    TODOS: {
        words: [], 
        size: 14,
        color: '#4b0082' 
    }
};

const COMPREHENSION_QUESTIONS = [
    // (Mantenemos la lista de preguntas para que el juego funcione)
    { word: "CARPETA", q: "El propósito de una CARPETA es:", options: ["Ejecutar un programa.", "Almacenar y organizar archivos.", "Conectar a internet."], correctIndex: 1 },
    { word: "MOUSE", q: "¿Qué acción principal realiza el MOUSE?", options: ["Escribir texto.", "Navegar y seleccionar elementos.", "Apagar la computadora."], correctIndex: 1 },
    { word: "ESCRITORIO", q: "¿Qué elemento de Windows contiene accesos directos e iconos?", options: ["El Explorador.", "El Panel de Control.", "El Escritorio."], correctIndex: 2 },
    { word: "TECLADO", q: "¿Cuál es la función principal del TECLADO?", options: ["Introducir datos y comandos.", "Hacer clic en los enlaces.", "Mostrar imágenes."], correctIndex: 0 },
    { word: "CINTA", q: "¿Qué contiene la CINTA de Opciones?", options: ["Las pestañas (Inicio, Insertar) y los comandos.", "Solo la Barra de Estado.", "El documento activo."], correctIndex: 0 },
    { word: "FORMULA", q: "¿Con qué carácter debe iniciar una FÓRMULA en Excel?", options: ["#", "=", "$"], correctIndex: 1 },
    { word: "NAVEGADOR", q: "Un NAVEGADOR web es un:", options: ["Programa para crear documentos.", "Programa para acceder a Internet y visualizar páginas.", "Motor de búsqueda."], correctIndex: 1 },
    { word: "URL", q: "¿Qué representa una URL?", options: ["El nombre del servidor.", "La dirección única de una página web.", "El código de fuente."], correctIndex: 1 },
    { word: "PHISHING", q: "El PHISHING busca:", options: ["Mejorar la velocidad de conexión.", "Engañar al usuario para obtener datos confidenciales.", "Instalar software antivirus."], correctIndex: 1 },
    { word: "WIFI", q: "¿Qué tecnología permite la conexión inalámbrica a internet?", options: ["Bluetooth.", "Red de Área Local.", "Wi-Fi."], correctIndex: 2 },
    // **AÑADE AQUÍ EL RESTO DE TUS PREGUNTAS**
];


// --- 2. VARIABLES DE ESTADO Y TEMPORIZADOR ---
let currentModule = 'Windows';
let boardSize = 12;
let grid = []; 
let wordsToFind = [];
let foundWords = [];

let selectionStartCell = null;
let selectionEndCell = null;
let isSelecting = false;
let activeTest = null; 

let isTimeTrial = false;
let timerSeconds = 180; 
let timerInterval = null; 
let randomModeInterval = null; 

// NUEVO: Variables de control de vida/recompensa
let correctStreak = 0; // Contador de respuestas correctas seguidas
let customTimerDuration = 180; // Duración del timer en segundos (por defecto 3 min)


// --- 3. FUNCIONES DE INTERFAZ Y FLUJO ---

function updateStatusDisplay() {
    document.getElementById('found-count').textContent = foundWords.length;
}

// Lógica del temporizador (MEJORADA PARA DURACIÓN PERSONALIZADA)
function startTimer() {
    stopTimer();
    timerSeconds = customTimerDuration; 
    document.getElementById('timer-display').classList.remove('hidden');
    
    // Formatear la duración inicial
    const initialMinutes = Math.floor(customTimerDuration / 60);
    const initialSeconds = customTimerDuration % 60;
    document.getElementById('timer-display').textContent = `${String(initialMinutes).padStart(2, '0')}:${String(initialSeconds).padStart(2, '0')}`;

    timerInterval = setInterval(() => {
        timerSeconds--;
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = display;

        if (timerSeconds <= 0) {
            stopTimer();
            showLossMessage();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function showLossMessage() {
    const lossMessage = document.getElementById('win-message');
    lossMessage.querySelector('h2').textContent = `¡TIEMPO AGOTADO! ⏱️`;
    lossMessage.querySelector('p').textContent = `Solo encontraste ${foundWords.length} de ${wordsToFind.length} palabras. ¡Intenta de nuevo!`;
    lossMessage.classList.remove('hidden');
    document.getElementById('gameplay-area').style.opacity = 0.2; 
}

// **NUEVO: Lógica de Recompensa**
function checkReward(isCorrect) {
    if (isCorrect) {
        correctStreak++;
        if (correctStreak >= 5) {
            showReward('💎 ¡Objeto Raro ganado: Dominio de Bits!');
            correctStreak = 0; // Reiniciar después de la recompensa
        }
    } else {
        correctStreak = 0; // Reiniciar si falla
    }
}

function showReward(message) {
    const rewardElement = document.getElementById('reward-message');
    rewardElement.textContent = message;
    rewardElement.classList.remove('hidden');

    // Desaparecer después de 3 segundos (la animación CSS maneja el resto)
    setTimeout(() => {
        rewardElement.classList.add('hidden');
    }, 3000); 
}


// **NUEVO: Lógica de Refresco Automático para Modo Aleatorio (Mantenida)**
function startRandomModeInterval() {
    if (randomModeInterval) {
        clearInterval(randomModeInterval);
    }
    randomModeInterval = setInterval(() => {
        document.getElementById('game-message').textContent = '¡REFRESCANDO TABLERO! Nuevas palabras aparecen...';
        setTimeout(() => {
            generateRandomBoard();
        }, 500); 
    }, 15000); 
}

function stopRandomModeInterval() {
    if (randomModeInterval) {
        clearInterval(randomModeInterval);
        randomModeInterval = null;
    }
}

function generateRandomBoard() {
    const availableModules = Object.keys(MODULE_WORDS).filter(key => key !== 'TODOS');
    let allWords = [];
    availableModules.forEach(key => allWords.push(...MODULE_WORDS[key].words));
    
    const numWordsToPick = 8;
    let mixedWords = [];
    
    while (mixedWords.length < numWordsToPick && allWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const randomWord = allWords.splice(randomIndex, 1)[0]; 
        mixedWords.push(randomWord);
    }

    MODULE_WORDS.TODOS.words = mixedWords;
    wordsToFind = mixedWords;
    foundWords = [];
    
    const containerColor = MODULE_WORDS.TODOS.color;
    document.documentElement.style.setProperty('--module-main-color', containerColor);
    document.documentElement.style.setProperty('--module-shadow-color', containerColor + '80'); 

    const list = document.getElementById('word-list');
    list.innerHTML = wordsToFind.map(word => `<li id="word-${word}">${word}</li>`).join('');

    document.getElementById('total-count').textContent = wordsToFind.length;
    document.getElementById('found-count').textContent = 0;
    
    generateGrid();
    setupGridListeners();
    document.getElementById('game-message').textContent = '¡Búsqueda Galáctica iniciada!';
}


function loadModule() {
    stopRandomModeInterval(); 

    currentModule = document.getElementById('module-select').value;
    
    if (currentModule !== 'TODOS') {
        boardSize = MODULE_WORDS[currentModule].size;
        wordsToFind = MODULE_WORDS[currentModule].words;
    }

    foundWords = [];
    
    const containerColor = MODULE_WORDS[currentModule].color;
    document.documentElement.style.setProperty('--module-main-color', containerColor);
    document.documentElement.style.setProperty('--module-shadow-color', containerColor + '80'); 

    const list = document.getElementById('word-list');
    list.innerHTML = wordsToFind.map(word => `<li id="word-${word}">${word}</li>`).join('');
    
    document.getElementById('word-search-grid').innerHTML = '';
    document.getElementById('total-count').textContent = wordsToFind.length;
    document.getElementById('found-count').textContent = 0;
    document.getElementById('game-message').textContent = `Módulo ${currentModule} cargado. ¡Presiona Iniciar Búsqueda!`;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('comprehension-test').classList.add('hidden');
    document.getElementById('win-message').classList.add('hidden'); 
    document.getElementById('timer-display').classList.add('hidden');
    stopTimer(); 

    document.getElementById('gameplay-area').classList.add('hidden');
    document.getElementById('menu-area').classList.remove('hidden');
}


function startGame(timeTrial) {
    stopTimer(); 
    stopRandomModeInterval();

    if (document.getElementById('module-select').value === 'TODOS') {
        generateRandomBoard();
        startRandomModeInterval();
    } else {
        loadModule(); 
        generateGrid();
        setupGridListeners();
    }
    
    isTimeTrial = timeTrial;
    
    if (isTimeTrial) {
        startTimer();
        document.getElementById('timer-display').classList.remove('hidden');
        document.getElementById('game-message').textContent = '⏱️ ¡TIEMPO CORRE! ¡Encuéntralas todas!';
    } else {
        document.getElementById('game-message').textContent = '¡Búsqueda Galáctica iniciada!';
    }
    
    document.getElementById('start-btn').disabled = true;
    
    document.getElementById('menu-area').classList.add('hidden');
    document.getElementById('gameplay-area').classList.remove('hidden');
}

function goToMenu() {
    stopTimer();
    stopRandomModeInterval();
    document.getElementById('win-message').classList.add('hidden');
    document.getElementById('gameplay-area').style.opacity = 1;
    loadModule();
}

function nextLevel() {
    document.getElementById('win-message').classList.add('hidden');
    document.getElementById('gameplay-area').style.opacity = 1;
    startGame(isTimeTrial); 
}

// --- 4. LÓGICA DE GENERACIÓN DE LA CUADRÍCULA (Mantenida de V2.2) ---
function generateGrid() {
    grid = Array(boardSize).fill(0).map(() => Array(boardSize).fill(''));
    placeWordsOptimized(grid, wordsToFind);
    
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            if (grid[y][x] === '') {
                grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
    renderGrid();
}

function placeWordsOptimized(grid, words) {
    const directions = [
        [0, 1], [1, 0], [1, 1], 
        [0, -1], [-1, 0], [-1, -1] 
    ];

    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 500) {
            attempts++;
            
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * boardSize);
            const startY = Math.floor(Math.random() * boardSize);
            
            if (canPlaceOptimized(grid, word, startX, startY, dir)) {
                for (let i = 0; i < word.length; i++) {
                    grid[startY + i * dir[1]][startX + i * dir[0]] = word[i];
                }
                placed = true;
            }
        }
    });
}

function canPlaceOptimized(grid, word, x, y, dir) {
    for (let i = 0; i < word.length; i++) {
        const currentX = x + i * dir[0];
        const currentY = y + i * dir[1];
        
        if (currentX < 0 || currentX >= boardSize || currentY < 0 || currentY >= boardSize) {
            return false;
        }
        
        if (grid[currentY][currentX] !== '' && grid[currentY][currentX] !== word[i]) {
            return false;
        }
    }
    return true;
}


function renderGrid() {
    const gridElement = document.getElementById('word-search-grid');
    gridElement.innerHTML = '';
    
    gridElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cell-${x}-${y}`;
            cell.textContent = grid[y][x];
            cell.dataset.x = x;
            cell.dataset.y = y;
            gridElement.appendChild(cell);
        }
    }
}

// --- 5. LÓGICA DE SELECCIÓN Y DERECCIÓN ---
function setupGridListeners() {
    const gridElement = document.getElementById('word-search-grid');
    document.body.onmouseup = handleMouseUp; 
    gridElement.onmousedown = handleMouseDown;
    gridElement.onmouseover = handleMouseMove;
    gridElement.ondragstart = () => false; 
}

function handleMouseDown(e) {
    if (e.target.classList.contains('grid-cell') && !e.target.classList.contains('found')) {
        isSelecting = true;
        selectionStartCell = e.target;
        highlightSelection(selectionStartCell, selectionStartCell);
        document.getElementById('word-search-grid').classList.add('selecting');
    }
}

function handleMouseUp(e) {
    if (isSelecting) {
        isSelecting = false;
        document.getElementById('word-search-grid').classList.remove('selecting');

        let endCell = e.target.classList.contains('grid-cell') ? e.target : selectionEndCell;
        
        if (selectionStartCell && endCell) {
            checkWord(selectionStartCell, endCell);
        } else {
            clearHighlight(true);
        }
        
        selectionStartCell = null;
        selectionEndCell = null;
    }
}

function handleMouseMove(e) {
    if (isSelecting && e.target.classList.contains('grid-cell')) {
        highlightSelection(selectionStartCell, e.target);
        selectionEndCell = e.target;
    }
}

function highlightSelection(startCell, endCell) {
    clearHighlight(false); 
    
    const startX = parseInt(startCell.dataset.x);
    const startY = parseInt(startCell.dataset.y);
    const endX = parseInt(endCell.dataset.x);
    const endY = parseInt(endCell.dataset.y);
    
    const dx = Math.sign(endX - startX);
    const dy = Math.sign(endY - startY);
    
    const isHorizontal = dy === 0 && dx !== 0;
    const isVertical = dx === 0 && dy !== 0;
    const isDiagonal = Math.abs(endX - startX) === Math.abs(endY - startY) && dx !== 0 && dy !== 0;

    if (!isHorizontal && !isVertical && !isDiagonal && !(dx === 0 && dy === 0)) {
        startCell.classList.add('highlight');
        return; 
    }

    let x = startX;
    let y = startY;
    
    while (true) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        if (cell && !cell.classList.contains('found')) {
            cell.classList.add('highlight');
        }
        
        if (x === endX && y === endY) break;
        
        if (x !== endX) x += dx;
        if (y !== endY) y += dy;
        
        if (Math.abs(x - startX) > boardSize || Math.abs(y - startY) > boardSize) break;
    }
}

function clearHighlight() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        if (!cell.classList.contains('found') && !cell.classList.contains('failed')) {
            cell.classList.remove('highlight');
        }
    });
}

// --- 6. VERIFICACIÓN Y PRUEBA DE COMPRENSIÓN (Solución de Bug de Bloqueo) ---
function getSelectedWord(startCell, endCell) {
    const startX = parseInt(startCell.dataset.x);
    const startY = parseInt(startCell.dataset.y);
    const endX = parseInt(endCell.dataset.x);
    const endY = parseInt(endCell.dataset.y);

    const dx = Math.sign(endX - startX);
    const dy = Math.sign(endY - startY);
    
    let word = "";
    let cells = [];
    let x = startX;
    let y = startY;

    while (true) {
        const cell = document.getElementById(`cell-${x}-${y}`);
        word += cell.textContent;
        cells.push(cell);

        if (x === endX && y === endY) break;
        
        if (x !== endX) x += dx;
        if (y !== endY) y += dy;
    }
    return { word, cells };
}

function checkWord(startCell, endCell) {
    // BUG FIX: Detener el refresco automático mientras la prueba está activa
    if (randomModeInterval) {
        stopRandomModeInterval(); 
    }
    
    const { word, cells } = getSelectedWord(startCell, endCell);
    const reversedWord = word.split('').reverse().join('');
    
    let foundWord = wordsToFind.find(w => w === word || w === reversedWord);

    if (foundWord && !foundWords.includes(foundWord)) {
        const questionData = COMPREHENSION_QUESTIONS.find(q => q.word === foundWord);
        
        if (questionData) {
            document.querySelectorAll('.grid-cell.failed').forEach(cell => cell.classList.remove('failed'));
            
            activeTest = { word: foundWord, cells, question: questionData };
            showComprehensionTest();
            
        } else {
            document.getElementById('game-message').textContent = `¡Encontraste '${foundWord}'! (Agrega una pregunta de comprensión para esta palabra.)`;
            markWordFound(foundWord, cells);
            clearHighlight();
            if (currentModule === 'TODOS') { startRandomModeInterval(); } // Reanudar si no hay test
        }
        
    } else {
        document.getElementById('game-message').textContent = 'Palabra no válida, ya encontrada o dirección incorrecta.';
        clearHighlight();
        if (currentModule === 'TODOS') { startRandomModeInterval(); } // Reanudar si falla la selección
    }
}

function showComprehensionTest() {
    document.getElementById('word-search-grid').style.opacity = 0.5; 
    
    const testArea = document.getElementById('comprehension-test');
    const question = activeTest.question;
    
    document.getElementById('test-question').textContent = `Palabra: ${activeTest.word}. ${question.q}`;
    
    const optionsContainer = document.getElementById('test-options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.onclick = () => submitAnswer(index, btn, question.correctIndex); 
        optionsContainer.appendChild(btn);
    });
    
    testArea.classList.remove('hidden');
}

function submitAnswer(selectedIndex, selectedButton, correctIndex) {
    if (!activeTest) return;
    
    const allButtons = document.querySelectorAll('#test-options button');
    let isCorrect = selectedIndex === correctIndex;

    // Ejecutar lógica de recompensa
    checkReward(isCorrect); 

    if (isCorrect) {
        selectedButton.classList.add('correct');
        markWordFound(activeTest.word, activeTest.cells);
        document.getElementById('game-message').textContent = `¡Respuesta Correcta! '${activeTest.word}' añadido.`;
        
        if (foundWords.length === wordsToFind.length) {
            stopTimer(); 
            showWinMessage();
        }

    } else {
        selectedButton.classList.add('incorrect-selected');
        allButtons[correctIndex].classList.add('correct');
        
        document.getElementById('game-message').textContent = `Respuesta Incorrecta. Penalidad: ¡Busca la palabra de nuevo!`;
        
        activeTest.cells.forEach(cell => cell.classList.add('failed'));
    }
    
    allButtons.forEach(btn => btn.disabled = true);
    
    setTimeout(() => {
        activeTest = null;
        document.getElementById('comprehension-test').classList.add('hidden');
        document.getElementById('word-search-grid').style.opacity = 1; 
        
        if (!isCorrect) {
             document.querySelectorAll('.grid-cell.failed').forEach(cell => cell.classList.remove('failed'));
        }
        clearHighlight();
        
        // BUG FIX: Reanudar el modo aleatorio después de que el test termine
        if (currentModule === 'TODOS') { startRandomModeInterval(); }
        
    }, 1500); 
}


function markWordFound(word, cells) {
    foundWords.push(word);
    updateStatusDisplay();
    
    document.getElementById(`word-${word}`).classList.add('found-word');
    
    cells.forEach(cell => {
        cell.classList.add('found');
        cell.classList.remove('highlight');
        cell.classList.remove('failed'); 
    });
}

function showWinMessage() {
    stopTimer();
    stopRandomModeInterval();
    const winMessage = document.getElementById('win-message');
    document.getElementById('completed-module-name').textContent = currentModule;
    winMessage.classList.remove('hidden');
    document.getElementById('gameplay-area').style.opacity = 0.2; 
}


// --- 7. AJUSTES (NUEVO) Y INICIALIZACIÓN ---

// Lógica para abrir el menú de ajustes
function openSettings() {
    // Usamos prompt/confirm para simplificar la ventana de ajustes
    
    // 1. Duración del temporizador
    let newDuration = prompt(`Establecer duración del Contrarreloj (en segundos, actual: ${customTimerDuration}s):`, customTimerDuration);
    newDuration = parseInt(newDuration);
    
    if (!isNaN(newDuration) && newDuration > 0) {
        customTimerDuration = newDuration;
        alert(`Duración del Contrarreloj ajustada a ${customTimerDuration / 60} minutos.`);
    } else if (newDuration !== null) {
         alert("Duración no válida. Usando valor anterior.");
    }

    // 2. Tema Claro/Oscuro
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    const changeTheme = confirm(`El tema actual es ${currentTheme.toUpperCase()}. ¿Deseas cambiarlo a ${newTheme.toUpperCase()}?`);
    
    if (changeTheme) {
        toggleTheme();
    }
}


function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
}


window.onload = () => {
    // Asegurar que el módulo TODOS esté disponible en el selector
    const select = document.getElementById('module-select');
    if (!select.querySelector('option[value="TODOS"]')) {
        const option = document.createElement('option');
        option.value = 'TODOS';
        option.textContent = 'TODOS (ALEATORIO DINÁMICO)';
        select.appendChild(option);
    }
    
    loadModule(); 
};