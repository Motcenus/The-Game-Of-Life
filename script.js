// script.js
const rows = 50;
const cols = 50;
const grid = document.getElementById('grid');
const cells = [];
let interval;
let speed = 100;

function createGrid() {
    grid.innerHTML = '';
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', () => cell.classList.toggle('active'));
        grid.appendChild(cell);
        cells.push(cell);
    }
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / cols);
    const col = index % cols;

    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if ((r !== row || c !== col) && r >= 0 && r < rows && c >= 0 && c < cols) {
                neighbors.push(r * cols + c);
            }
        }
    }
    return neighbors;
}

function updateGrid() {
    const newState = cells.map(cell => cell.classList.contains('active') ? 1 : 0);
    
    const nextState = newState.slice();
    for (let i = 0; i < cells.length; i++) {
        const neighbors = getNeighbors(i);
        const liveNeighbors = neighbors.filter(n => newState[n] === 1).length;

        if (newState[i] === 1) {
            nextState[i] = (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
        } else {
            nextState[i] = (liveNeighbors === 3) ? 1 : 0;
        }
    }
    
    for (let i = 0; i < cells.length; i++) {
        if (nextState[i] === 1) {
            cells[i].classList.add('active');
        } else {
            cells[i].classList.remove('active');
        }
    }
}

document.getElementById('start').addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(updateGrid, speed);
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
});

document.getElementById('clear').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    cells.forEach(cell => cell.classList.remove('active'));
});

document.getElementById('random').addEventListener('click', () => {
    cells.forEach(cell => cell.classList.toggle('active', Math.random() > 0.7));
});

document.getElementById('speed').addEventListener('input', (event) => {
    speed = parseInt(event.target.value, 10);
    if (interval) {
        clearInterval(interval);
        interval = setInterval(updateGrid, speed);
    }
});

createGrid();
