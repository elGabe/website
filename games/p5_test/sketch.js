
let prev_dt;

const GAME_WIDTH    = 640;
const GAME_HEIGHT   = 480;

let grid;
let w = 2;
let cols, rows;

function make2DArrray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

function setup() {
    createCanvas(GAME_WIDTH, GAME_HEIGHT);
    prev_dt = new Date().getTime();

    // Create grid
    cols = width / w;
    rows = height / w;
    grid = make2DArrray(cols, rows);
}

function draw() {

    // Calculate dt
    const now = new Date().getTime();
    let dt = now - prev_dt;
    prev_dt = now;
    // Convert dt to milliseconds
    dt *= 0.001;

    update(dt);
    render();
}

function update(dt) {

    if (mouseIsPressed) {
        if (keyIsDown(32)) {
            removeSand();
        } else {
            createSand();
        }
    }

    let nextGrid = make2DArrray(cols, rows);

    for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
            
        if (j > rows - 1) {
            return;
        }

        let state = grid[i][j];
        
        if (state != 1) {
            continue;
        }
        
        let below = grid[i][j+1];

        let dir = 1;

        if (random(1) < 0.5) {
            dir *= -1;
        }

        let belowA, belowB;

        if (i + dir >= 0 && i + dir <= cols - 1) {
            belowA = grid[i+dir][j+1];
        }

        if (i - dir >= 0 && i - dir <= cols - 1) {
            belowB = grid[i-dir][j+1];
        }

        if (below == 0) {
            nextGrid[i][j] = 0;
            nextGrid[i][j + 1] = 1;
        } else if (belowA == 0) {
            nextGrid[i][j] = 0;
            nextGrid[i+dir][j+1] = 1;
        } else if (belowB == 0) {
            nextGrid[i][j] = 0;
            nextGrid[i-dir][j+1] = 1;
        } else {
            nextGrid[i][j] = 1;
        }
    }
    }

    grid = nextGrid;
}

function render() {
    background(0);

    noStroke();
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * w;
            let y = j * w;
            if (grid[i][j] == 0) {
                continue;
            }
            fill(color(218, 148, 30));
            square(x, y, w);
        }
    }
}

const matrix = 32;

function createSand() {
    let mouseCol = floor(mouseX/w);
    let mouseRow = floor(mouseY/w);
    let extent = floor(matrix/2);
    for (let i = -extent; i <= extent; i++) {
    for (let j = -extent; j <= extent; j++) {
        if (random(1) > 0.3) {
            continue;
        }
        let col = mouseCol + i;
        let row = mouseRow + j;
        if (col >= 0 && col <= cols - 1 && row >= 0 && row <= rows - 1) {
            grid[col][row] = 1;
        }
    }
    }
}

function removeSand() {
    let mouseCol = floor(mouseX/w);
    let mouseRow = floor(mouseY/w);
    let extent = floor(matrix/2);
    for (let i = -extent; i <= extent; i++) {
    for (let j = -extent; j <= extent; j++) {
        let col = mouseCol + i;
        let row = mouseRow + j;
        if (col >= 0 && col <= cols - 1 && row >= 0 && row <= rows - 1) {
            grid[col][row] = 0;
        }
    }
    }
}