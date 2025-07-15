
const boardSize = 8;
const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const shapesContainer = document.getElementById('shapes');
const successSound = document.getElementById('successSound');
const failSound = document.getElementById('failSound');
const placeSound = document.getElementById('placeSound');

let grid = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
bestEl.textContent = bestScore;

const colors = ['#ff6f61', '#6a1b9a', '#009688', '#fbc02d', '#ff7043', '#29b6f6'];
const shapeTemplates = [
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1]],
  [[1, 1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
];

function createBoard() {
  board.innerHTML = '';
  grid = [];
  for (let i = 0; i < boardSize * boardSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
    grid.push(cell);
  }
}

function getIndex(x, y) {
  return y * boardSize + x;
}

function generateShapes() {
  shapesContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const shape = shapeTemplates[Math.floor(Math.random() * shapeTemplates.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const div = document.createElement('div');
    div.className = 'shape';
    div.style.gridTemplateColumns = `repeat(${shape[0].length}, 20px)`;
    div.draggable = true;

    shape.forEach(row => row.forEach(cell => {
      const s = document.createElement('div');
      s.className = 'shape-cell';
      s.style.background = color;
      s.style.visibility = cell ? 'visible' : 'hidden';
      div.appendChild(s);
    }));

    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('shape', JSON.stringify(shape));
      e.dataTransfer.setData('color', color);
    });

    shapesContainer.appendChild(div);
  }
}

board.addEventListener('dragover', e => e.preventDefault());
board.addEventListener('drop', placeShape);

function placeShape(e) {
  const shape = JSON.parse(e.dataTransfer.getData('shape'));
  const color = e.dataTransfer.getData('color');
  const rect = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / 44);
  const y = Math.floor((e.clientY - rect.top) / 44);

  if (canPlace(shape, x, y)) {
    applyShape(shape, x, y, color);
    generateShapes();
    checkFullLines();
    placeSound.play();
  } else {
    failSound.play();
    showMessage('No se puede colocar aquí 😓', 'error');
  }
}

function canPlace(shape, x, y) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const xi = x + j;
        const yi = y + i;
        if (xi >= boardSize || yi >= boardSize || grid[getIndex(xi, yi)].classList.contains('filled')) {
          return false;
        }
      }
    }
  }
  return true;
}

function applyShape(shape, x, y, color) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const cell = grid[getIndex(x + j, y + i)];
        cell.classList.add('filled');
        cell.style.background = color;
        score++;
      }
    }
  }
  scoreEl.textContent = score;
}

function checkFullLines() {
  let removed = false;

  for (let i = 0; i < boardSize; i++) {
    let rowFull = true;
    let colFull = true;
    for (let j = 0; j < boardSize; j++) {
      if (!grid[getIndex(j, i)].classList.contains('filled')) rowFull = false;
      if (!grid[getIndex(i, j)].classList.contains('filled')) colFull = false;
    }

    if (rowFull) {
      for (let j = 0; j < boardSize; j++) {
        grid[getIndex(j, i)].classList.remove('filled');
        grid[getIndex(j, i)].style.background = '#ddd';
      }
      removed = true;
    }
    if (colFull) {
      for (let j = 0; j < boardSize; j++) {
        grid[getIndex(i, j)].classList.remove('filled');
        grid[getIndex(i, j)].style.background = '#ddd';
      }
      removed = true;
    }
  }

  if (removed) {
    successSound.play();
    showMessage('¡Bien hecho! 🌟');
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
      bestEl.textContent = bestScore;
    }
  }

  // Fin de juego si no se puede colocar nada
  if (!hasPossibleMove()) {
    showMessage('¡Juego terminado! 😢', 'error');
  }
}

function hasPossibleMove() {
  const shapes = document.querySelectorAll('.shape');
  return shapes.length > 0; // Simplificado: en juego real se verifican posibilidades
}

function showMessage(text, type = 'success') {
  message.textContent = text;
  message.classList.remove('hidden');
  message.style.background = type === 'error' ? '#e74c3c' : '#2ecc71';
  setTimeout(() => {
    message.classList.add('hidden');
  }, 2500);
}

document.getElementById('reset').addEventListener('click', () => {
  score = 0;
  scoreEl.textContent = score;
  createBoard();
  generateShapes();
  message.classList.add('hidden');
});

// Inicializar juego
createBoard();
generateShapes();
