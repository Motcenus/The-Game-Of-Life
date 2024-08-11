// script.js
let rows = 50;
let cols = 50;
let cellSize = 20;
const grid = document.getElementById('grid');
const cells = [];
let lastFrameTime = 0;
let speed = 100; // milliseconds per frame
let isDrawing = false;
let isRunning = false;

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function blendColors(color1, color2, ratio) {
    const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = color2.match(/\d+/g).map(Number);

    const r = Math.floor(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.floor(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.floor(b1 * (1 - ratio) + b2 * ratio);

    return `rgb(${r}, ${g}, ${b})`;
}

class Cell {
    constructor(element) {
        this.element = element;
        this.isActive = false;
        this.color = getRandomColor();
    }

    activate() {
        this.isActive = true;
        this.updateColor();
    }

    deactivate() {
        this.isActive = false;
        this.updateColor();
    }

    updateColor() {
        this.element.style.backgroundColor = this.isActive ? this.color : 'white';
    }
}

function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    cells.length = 0; // Clear the cells array

    for (let i = 0; i < rows * cols; i++) {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.style.width = `${cellSize}px`;
        cellElement.style.height = `${cellSize}px`;
        const cell = new Cell(cellElement);

        cellElement.addEventListener('mousedown', () => {
            isDrawing = true;
            cell.activate();
        });
        cellElement.addEventListener('mouseup', () => isDrawing = false);
        cellElement.addEventListener('mousemove', () => {
            if (isDrawing) cell.activate();
        });

        grid.appendChild(cellElement);
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
    const newState = cells.map(cell => ({
        isActive: cell.isActive,
        color: cell.color
    }));

    const nextState = newState.map(state => ({ ...state }));
    for (let i = 0; i < cells.length; i++) {
        const neighbors = getNeighbors(i);
        const activeNeighbors = neighbors.filter(n => newState[n].isActive);

        if (newState[i].isActive) {
            nextState[i].isActive = (activeNeighbors.length === 2 || activeNeighbors.length === 3);
        } else {
            nextState[i].isActive = (activeNeighbors.length === 3);
        }

        if (nextState[i].isActive) {
            const neighborColors = activeNeighbors.map(n => newState[n].color);
            nextState[i].color = neighborColors.length
                ? neighborColors.reduce((acc, color) => blendColors(acc, color, 1 / neighborColors.length), nextState[i].color)
                : newState[i].color;
        } else {
            nextState[i].color = getRandomColor(); // Optionally, assign a new random color when deactivating
        }
    }

    for (let i = 0; i < cells.length; i++) {
        cells[i].isActive = nextState[i].isActive;
        cells[i].color = nextState[i].color;
        cells[i].updateColor();
    }
}

function animate(currentTime) {
    if (isRunning) {
        if (currentTime - lastFrameTime >= speed) {
            updateGrid();
            lastFrameTime = currentTime;
        }
        requestAnimationFrame(animate);
    }
}

function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(animate);
    }
}

function stopSimulation() {
    isRunning = false;
}

function clearGrid() {
    stopSimulation();
    cells.forEach(cell => cell.deactivate());
}

function randomizeGrid() {
    cells.forEach(cell => {
        if (Math.random() > 0.7) cell.activate();
        else cell.deactivate();
    });
}

function updateSettings() {
    rows = parseInt(document.getElementById('canvasSize').value, 10);
    cols = rows; // Make it square
    cellSize = parseInt(document.getElementById('blockSize').value, 10);
    createGrid();
}

document.getElementById('start').addEventListener('click', startSimulation);
document.getElementById('stop').addEventListener('click', stopSimulation);
document.getElementById('clear').addEventListener('click', clearGrid);
document.getElementById('random').addEventListener('click', randomizeGrid);
document.getElementById('speed').addEventListener('input', (event) => {
    speed = parseInt(event.target.value, 10);
});
document.getElementById('canvasSize').addEventListener('change', updateSettings);
document.getElementById('blockSize').addEventListener('change', updateSettings);

createGrid();
