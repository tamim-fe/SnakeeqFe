const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverOverlay = document.getElementById('game-over-overlay');
const startOverlay = document.getElementById('start-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const submitBtn = document.getElementById('submit-score');
const playerNameInput = document.getElementById('player-name');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let isGameOver = false;

highScoreElement.textContent = highScore;

// Initialize Game
function init() {
    snake = [{ x: 10, y: 10 }];
    generateFood();
    dx = 1;
    dy = 0;
    score = 0;
    isGameOver = false;
    scoreElement.textContent = score;
    gameOverOverlay.classList.add('hidden');
    startOverlay.classList.add('hidden');
    fetchLeaderboard();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, 100);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Check if food spawned on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function draw() {
    moveSnake();
    if (checkCollision()) {
        endGame();
        return;
    }

    // Clear Canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize); ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#ff9e64'; // Food color
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff9e64';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#73daca' : '#41a6b5';
        ctx.shadowBlur = index === 0 ? 10 : 0;
        ctx.shadowColor = '#73daca';

        ctx.beginPath();
        const r = 4; // Corner radius
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        const w = gridSize - 2;
        const h = gridSize - 2;
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverOverlay.classList.remove('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

// Controls
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
    }
});

// Event Listeners
startBtn.addEventListener('click', init);
restartBtn.addEventListener('click', init);

submitBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim() || 'Anonymous';
    submitBtn.disabled = true;
    submitBtn.textContent = 'SAVING...';

    try {
        await submitScore(name, score);
        submitBtn.textContent = 'SAVED!';
        setTimeout(() => {
            fetchLeaderboard();
            init(); // Automaticaly restart after save
        }, 1000);
    } catch (error) {
        submitBtn.textContent = 'ERROR';
        submitBtn.disabled = false;
    }
});

// Initial Fetch
fetchLeaderboard();
