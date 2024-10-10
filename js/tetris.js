document.addEventListener('DOMContentLoaded', function() {
    const gameConsole = document.getElementById('game-console');
    const gameStatus = document.getElementById('game-status');
    const nextTetrominoConsole = document.getElementById('next-tetromino');
    const scoreDisplay = document.getElementById('score');
    const linesDisplay = document.getElementById('lines');
    const levelDisplay = document.getElementById('level');
    const play_pauseButton = document.getElementById('play-pause');
    const totalSquare = 200;
    const width = 10; // width = number of columns
    let totalScore = 0, level = 1, totalClearedlines = 0;

    // The Tetrominoes
    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const jTetromino = [
        [1, width+1, width*2+1, width*2],
        [0, width, width+1, width+2],
        [1, 2, width+1, 2*width+1],
        [width, width+1, width+2, width*2+2]
    ];

    const lTetromino = [
        [1, width+1, width*2+1, width*2+2],
        [width, width+1, width+2, width*2],
        [0, 1, width+1, width*2+1],
        [2, width, width+1, width+2]
    ];

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const sTetromino = [
        [1, 2, width, width+1],
        [1, width+1, width+2, width*2+2],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1]
    ];

    const tTetromino = [
        [0, 1, 2, width+1],
        [2, width+1, width+2, width*2+2],
        [width+1, 2*width, 2*width+1, width*2+2],
        [0, width, width+1, width*2]
    ];

    const zTetromino = [
        [0, 1, width+1, width+2],
        [2, width+1, width+2, width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [1, width, width+1, width*2]
    ];

    const tetrominoes = [oTetromino, jTetromino, lTetromino, tTetromino, iTetromino, sTetromino,  zTetromino];
    const tetrominoeNames = ['oTetromino', 'jTetromino', 'lTetromino', 'tTetromino', 'iTetromino', 'sTetromino', 'zTetromino'];
    let squares, isStart = false, isGameOver = false, dropTimer, dropInterval = 1000;
    let CTI; // CTI: Current Tetromino Information
    let NTI; // NTI: Next Tetromino Information
    
    // Function to create grid
    function createGrid() {
        for (let i = 0; i < totalSquare; i++) {
            const cell = document.createElement('div');
            gameConsole.appendChild(cell);
        }

        squares = Array.from(document.querySelectorAll('#game-console div'));
    }

    createGrid();

    // Generate a random up-next Tetromino
    function generateUpNextTetromino() {
        let randomIndex1 = Math.floor(Math.random() * tetrominoes.length);
        let randomIndex2 = Math.floor(Math.random() * 4);

        NTI = {
            index: randomIndex1,
            rotation: randomIndex2,
            tetromino: tetrominoes[randomIndex1][randomIndex2],
            tetrominoName: tetrominoeNames[randomIndex1],
            currentPosition: 4
        };
    }

    // Draw the up-next Tetromino
    function drawUpNextTetromino() {
        let gridSize = 3;
        if(NTI.tetrominoName === 'iTetromino')
            gridSize = 4;
        else if(NTI.tetrominoName === 'oTetromino')
            gridSize = 2;

        let temp = 0, grid = '';
        NTI.tetromino.forEach(index => {
            newIndex = gridSize * Math.floor(index / 10) + (index % 10);   // calculate index for (gridSize x gridSize) grid
            for(let i = temp; i < newIndex; i++)
                grid += '<div></div>'

            grid += '<div class="' + NTI.tetrominoName + '"></div>'
            temp = newIndex + 1;
        });

        for(let i = temp; i < gridSize * gridSize; i++)
            grid += '<div></div>'

        nextTetrominoConsole.style.width = 35 * gridSize + 'px';
        nextTetrominoConsole.style.height = 35 * gridSize + 'px';
        nextTetrominoConsole.innerHTML = grid;
    }

    generateUpNextTetromino();
    drawUpNextTetromino();

    play_pauseButton.addEventListener('click', () => {
        if(dropTimer) {
            clearInterval(dropTimer);
            dropTimer = null;
            gameStatus.innerText = 'Paused';
        } else if(isStart) {
            dropTimer = setInterval(moveDown, dropInterval);
            gameStatus.innerText = '';
        } else {
            isStart = true;
            CTI = NTI;
            drawTetromino();
            generateUpNextTetromino();
            drawUpNextTetromino();
            dropTimer = setInterval(moveDown, dropInterval);
        }
        
        play_pauseButton.classList.toggle('swap-button');
    });

    // Draw Tetromino
    function drawTetromino() {
        CTI.tetromino.forEach(index => {
            squares[CTI.currentPosition + index].classList.add(CTI.tetrominoName);
        });
    }

    // Undraw Tetromino
    function undrawTetromino() {
        CTI.tetromino.forEach(index => {
            squares[CTI.currentPosition + index].classList.remove(CTI.tetrominoName);
        });
    }

    // Control the current Tetromino
    document.addEventListener('keydown', function(event) {
        if(!isGameOver) {
            if(event.key === 's' || event.key === 'S' || event.code === 'ArrowDown') {
                moveDown();
            } else if(event.key === 'a' || event.key === 'A' || event.code === 'ArrowLeft') {
                moveLeft();
            } else if(event.key === 'd' || event.key === 'D' || event.code === 'ArrowRight') {
                moveRight();
            } else if(event.key === 'w' || event.key === 'W' || event.code === 'ArrowUp') {
                rotate();
            }
        }
    });

    // Move the current Tetromino down
    function moveDown() {
        if(!collision('down')) {
            undrawTetromino();
            CTI.currentPosition += width;
            drawTetromino();
        } else {
            // Freeze Tetromino and generate a new one
            CTI.tetromino.forEach(index => squares[CTI.currentPosition + index].classList.add('filled'));
            checkCompleteLines();
            CTI = NTI;
            gameOver();
            drawTetromino();
            generateUpNextTetromino();
            drawUpNextTetromino();
        }
    }

    // Move the current Tetromino left
    function moveLeft() {
        if(!collision('left')) {
            undrawTetromino();
            CTI.currentPosition -= 1;
            drawTetromino();
        }
    }

    // Move the current Tetromino right
    function moveRight() {
        if(!collision('right')) {
            undrawTetromino();
            CTI.currentPosition += 1;
            drawTetromino();
        }
    }

    function rotate() {
        undrawTetromino();
        CTI.rotation += 1;
        
        if(CTI.rotation == 4)
            CTI.rotation = 0;

        CTI.tetromino = tetrominoes[CTI.index][CTI.rotation];
        checkRotatedPosition();
        drawTetromino();
    }

    function checkRotatedPosition(P) {
        P = P || CTI.currentPosition;    // get current position.  Then, check if the piece is near the left side.
        if((P + 1) % width < 4) {        // add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
            if (collision('right')) {       // use actual position to check if it's flipped over to right side
                CTI.currentPosition += 1;   // if so, add one to wrap it back around
                checkRotatedPosition(P);    // check again.  Pass position from start, since long block might need to move more.
            }
        } else if (P % width > 5) {
            if (collision('left')){
                CTI.currentPosition -= 1;
                checkRotatedPosition(P);
            }
        }
    }
    
    // Check collision
    function collision(type) {
        if(type === 'down' && CTI.tetromino.some(index => CTI.currentPosition + index + width >= totalSquare || squares[CTI.currentPosition + index + width].classList.contains('filled')))
            return true;
        else if(type === 'left' && CTI.tetromino.some(index => (CTI.currentPosition + index) % width === 0 || squares[CTI.currentPosition + index - 1].classList.contains('filled')))
            return true;
        else if(type === 'right' && CTI.tetromino.some(index => (CTI.currentPosition + index) % width === width - 1 || squares[CTI.currentPosition + index + 1].classList.contains('filled')))
            return true;
        else
            return false;
    }

    // Game over function
    function gameOver() {
        if(CTI.tetromino.some(index => squares[CTI.currentPosition + index].classList.contains('filled'))) {
            isGameOver = true;
            clearInterval(dropTimer);
            gameStatus.innerText = 'Game Over';
            play_pauseButton.classList.toggle('swap-button');

            play_pauseButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    // Check complete lines, destroy them, and update score
    function checkCompleteLines() {
        let linesCleared = 0;
        for(let i = 0; i < totalSquare; i += width) {
            const indexes = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if(indexes.every(index => squares[index].classList.contains('filled'))) {
                indexes.forEach(index => squares[index].className = '');
                const removedSquares = squares.splice(i, width);
                squares = removedSquares.concat(squares);
                linesCleared++;
            }
        }

        if(linesCleared > 0) {
            squares.forEach(square => gameConsole.appendChild(square));
            updateScore(linesCleared);
        }
    }

    // Update score and others info
    function updateScore(linesCleared) {
        if(linesCleared == 1)
            totalScore += 100 * level;
        else if(linesCleared == 2)
            totalScore += 300 * level;
        else if(linesCleared == 3)
            totalScore += 500 * level;
        else
            totalScore += 800 * level;

        totalClearedlines += linesCleared;
        level = Math.floor(totalClearedlines / 10) + 1

        scoreDisplay.innerText = totalScore;
        linesDisplay.innerText = totalClearedlines;
        levelDisplay.innerText = level;
        adjustDropSpeed(level);
    }

    function adjustDropSpeed(level) {
        clearInterval(dropTimer);
        dropInterval = 1000 - (level - 1) * 50; // Increase speed with level
        dropInterval = Math.max(dropInterval, 100); // Set a minimum speed
        dropTimer = setInterval(moveDown, dropInterval);
    }
});