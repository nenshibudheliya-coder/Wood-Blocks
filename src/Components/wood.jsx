import { useState, useCallback, useEffect, useRef } from "react";
import '../css/wood.css';

const GRID_SIZE = 8;

const PIECES = [
    { id: "L1", shape: [[1, 0], [1, 0], [1, 1]], color: "#f3e5ab" },
    { id: "L2", shape: [[0, 1], [0, 1], [1, 1]], color: "#f3e5ab" },
    { id: "L3", shape: [[1, 1], [1, 0], [1, 0]], color: "#f3e5ab" },
    { id: "L4", shape: [[1, 1], [0, 1], [0, 1]], color: "#f3e5ab" },
    { id: "T1", shape: [[1, 1, 1], [0, 1, 0]], color: "#f3e5ab" },
    { id: "T2", shape: [[0, 1], [1, 1], [0, 1]], color: "#f3e5ab" },
    { id: "S1", shape: [[1, 1], [1, 0], [1, 0]], color: "#f3e5ab" },
    { id: "I1", shape: [[1], [1], [1], [1]], color: "#f3e5ab" },
    { id: "I2", shape: [[1, 1, 1, 1]], color: "#f3e5ab" },
    { id: "I3", shape: [[1], [1], [1]], color: "#f3e5ab" },
    { id: "I4", shape: [[1, 1, 1]], color: "#f3e5ab" },
    { id: "O1", shape: [[1, 1], [1, 1]], color: "#f3e5ab" },
    { id: "O2", shape: [[1]], color: "#f3e5ab" },
    { id: "Z1", shape: [[1, 0], [1, 1], [0, 1]], color: "#f3e5ab" },
    { id: "Z2", shape: [[0, 1], [1, 1], [1, 0]], color: "#f3e5ab" },
    { id: "J1", shape: [[1, 0], [1, 0], [1, 1]], color: "#f3e5ab" },
    { id: "C1", shape: [[1, 1], [1, 0], [1, 1]], color: "#f3e5ab" },
    { id: "U1", shape: [[1, 0, 1], [1, 1, 1]], color: "#f3e5ab" },
];

function randomPiece() {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
}

function generateInitialQueue() {
    return [randomPiece(), randomPiece(), randomPiece()];
}

function emptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

function canPlace(grid, piece, row, col) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                const gr = row + r;
                const gc = col + c;
                if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
                if (grid[gr][gc]) return false;
            }
        }
    }
    return true;
}

function placePiece(grid, piece, row, col) {
    const newGrid = grid.map(r => [...r]);
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                newGrid[row + r][col + c] = piece.color;
            }
        }
    }
    return newGrid;
}

function clearLines(grid) {
    let cleared = 0;
    let newGrid = grid.map(r => [...r]);

    const fullRows = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r].every(cell => cell !== null)) fullRows.push(r);
    }

    const fullCols = [];
    for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid.every(row => row[c] !== null)) fullCols.push(c);
    }

    for (const r of fullRows) {
        for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = null;
        cleared++;
    }
    for (const c of fullCols) {
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = null;
        cleared++;
    }

    return { newGrid, cleared };
}

function hasAnyValidMove(grid, pieces) {
    for (const piece of pieces) {
        if (!piece) continue;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (canPlace(grid, piece, r, c)) return true;
            }
        }
    }
    return false;
}

// Custom Wood Cell with Grain and Star
function WoodCell({ filled, color, highlight, ghost }) {
    if (!filled && !ghost) {
        return <div className="wood-cell-empty" />;
    }

    return (
        <div className="wood-cell-wrapper" style={{
            opacity: ghost ? 0.45 : 1,
            zIndex: filled ? 2 : 1,
        }}>
            <div className="wood-cell-inner" style={{
                background: filled ? "#f3d2a2" : "transparent",
                backgroundImage: filled ? "linear-gradient(45deg, rgba(139, 69, 19, 0.05) 25%, transparent 25%, transparent 50%, rgba(139, 69, 19, 0.05) 50%, rgba(139, 69, 19, 0.05) 75%, transparent 75%, transparent)" : "none",
                border: ghost ? "2px dashed #f3d2a2" : "1.5px solid #8b4513",
                boxShadow: filled ? "0 2px 0 #5d2e0b, 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
            }}>
                {/* Star icon removed */}
            </div>
            {highlight && <div className="wood-cell-highlight" />}
        </div>
    );
}

function PiecePreview({ piece, scale = 1, dragging }) {
    if (!piece) return <div style={{ width: 80, height: 80 }} />;
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const cellSize = Math.min(20, Math.floor(64 / Math.max(rows, cols))) * scale;

    return (
        <div className="piece-preview-grid" style={{
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            opacity: dragging ? 0.3 : 1,
        }}>
            {piece.shape.map((row, r) =>
                row.map((cell, c) => (
                    <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize }}>
                        {cell ? <WoodCell filled color={piece.color} /> : <div />}
                    </div>
                ))
            )}
        </div>
    );
}

export default function WoodBlockPuzzle() {
    const [grid, setGrid] = useState(emptyGrid);
    const [queue, setQueue] = useState(generateInitialQueue);
    const [score, setScore] = useState(0);
    const [best, setBest] = useState(0);
    const [dragging, setDragging] = useState(null);
    const [ghostPos, setGhostPos] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [lastScore, setLastScore] = useState(null);
    const [touchPos, setTouchPos] = useState(null);
    const gridRef = useRef(null);
    const [cellSize, setCellSize] = useState(44);
    
    // Awesome Animation States
    const [hasCrossed100, setHasCrossed100] = useState(false);
    const [showAwesome, setShowAwesome] = useState(false);

    useEffect(() => {
        if (score >= 100 && !hasCrossed100) {
            setHasCrossed100(true);
            setShowAwesome(true);
            setTimeout(() => {
                setShowAwesome(false);
            }, 3000);
        }
    }, [score, hasCrossed100]);

    useEffect(() => {
        const updateSize = () => {
            // UI heights: Scoreboard ~90px, Pieces ~110px, Padding/Gaps ~60px
            // Leave ample margin to avoid any scrolling
            const uiHeight = 260;
            const availableHeight = window.innerHeight - uiHeight;
            const sizeByHeight = availableHeight / 8.5;
            const sizeByWidth = (window.innerWidth * 0.9) / 8.5;

            const size = Math.min(46, sizeByHeight, sizeByWidth);
            setCellSize(Math.max(28, size));
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const saved = parseInt(localStorage.getItem("wb_best") || "0");
        setBest(saved);
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
    }, []);

    useEffect(() => {
        if (score > best) {
            setBest(score);
            localStorage.setItem("wb_best", score);
        }
    }, [score, best]);

    useEffect(() => {
        if (!gameOver) {
            const activePieces = queue.filter(Boolean);
            if (activePieces.length > 0 && !hasAnyValidMove(grid, activePieces)) {
                setGameOver(true);
            }
        }
    }, [grid, queue, gameOver]);

    const getGhostPosition = useCallback((piece, clientX, clientY) => {
        if (!gridRef.current || !piece) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        const col = Math.round(offsetX / (cellSize + 4) - piece.shape[0].length / 2);
        const row = Math.round(offsetY / (cellSize + 4) - piece.shape.length / 2);
        return { row, col };
    }, [cellSize]);

    const handleDragStart = (e, pieceIdx) => {
        e.preventDefault();
        setDragging({ pieceIdx, piece: queue[pieceIdx] });
        setGhostPos(null);
    };

    const handleTouchStart = (e, pieceIdx) => {
        const touch = e.touches[0];
        setDragging({ pieceIdx, piece: queue[pieceIdx] });
        setTouchPos({ x: touch.clientX, y: touch.clientY });
    };

    const handleMouseMove = useCallback((e) => {
        if (!dragging) return;
        const pos = getGhostPosition(dragging.piece, e.clientX, e.clientY);
        if (pos && canPlace(grid, dragging.piece, pos.row, pos.col)) {
            setGhostPos(pos);
        } else {
            setGhostPos(null);
        }
    }, [dragging, grid, getGhostPosition]);

    const handleTouchMove = useCallback((e) => {
        if (!dragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        setTouchPos({ x: touch.clientX, y: touch.clientY });
        const pos = getGhostPosition(dragging.piece, touch.clientX, touch.clientY);
        if (pos && canPlace(grid, dragging.piece, pos.row, pos.col)) {
            setGhostPos(pos);
        } else {
            setGhostPos(null);
        }
    }, [dragging, grid, getGhostPosition]);

    const doPlace = useCallback((pos) => {
        if (!dragging) {
            setGhostPos(null);
            setTouchPos(null);
            return;
        }
        const { pieceIdx, piece } = dragging;

        if (!pos || !canPlace(grid, piece, pos.row, pos.col)) {
            setDragging(null);
            setGhostPos(null);
            setTouchPos(null);
            return;
        }

        let newGrid = placePiece(grid, piece, pos.row, pos.col);
        const { newGrid: clearedGrid, cleared } = clearLines(newGrid);

        const pieceScore = piece.shape.flat().filter(Boolean).length;
        const lineScore = cleared * 18;
        const addScore = pieceScore + lineScore;

        setScore(s => s + addScore);
        if (addScore > 0) setLastScore({ val: addScore, t: Date.now() });

        setGrid(clearedGrid);

        const newQueue = [...queue];
        newQueue[pieceIdx] = null;
        const allNull = newQueue.every(p => p === null);
        const finalQueue = allNull ? generateInitialQueue() : newQueue;
        setQueue(finalQueue);

        setDragging(null);
        setGhostPos(null);
        setTouchPos(null);
    }, [dragging, grid, queue]);

    const handleMouseUp = useCallback((e) => {
        if (!dragging) return;
        const pos = getGhostPosition(dragging.piece, e.clientX, e.clientY);
        doPlace(pos);
    }, [dragging, getGhostPosition, doPlace]);

    const handleTouchEnd = useCallback((e) => {
        if (!dragging || !touchPos) return;
        const pos = getGhostPosition(dragging.piece, touchPos.x, touchPos.y);
        doPlace(pos);
    }, [dragging, touchPos, getGhostPosition, doPlace]);

    const ghostCells = new Set();
    if (ghostPos && dragging) {
        const { piece } = dragging;
        for (let r = 0; r < piece.shape.length; r++) {
            for (let c = 0; c < piece.shape[r].length; c++) {
                if (piece.shape[r][c]) {
                    ghostCells.add(`${ghostPos.row + r},${ghostPos.col + c}`);
                }
            }
        }
    }

    const restart = () => {
        setGrid(emptyGrid());
        setQueue(generateInitialQueue());
        setScore(0);
        setHasCrossed100(false);
        setShowAwesome(false);
        setGameOver(false);
        setDragging(null);
        setGhostPos(null);
    };

    return (
        <div
            className="wood-app"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Clean Premium Wood Background */}
            <div className="premium-bg-radial">
                <div className="premium-bg-texture"></div>
                <div className="premium-bg-gradient" />
            </div>

            {/* Main Game Container - Fixed and Centered */}
            <div className="main-game-container">
                {/* Top Scoreboard Container */}
                <div className="scoreboard-container">
                    <div className="score-text-wrapper">
                        <div className="score-label">Score</div>
                        <div className="score-value">{score}</div>
                    </div>
                    <div className="trophy-container">
                        <span className="trophy-icon">🏆</span>
                    </div>
                    <div className="score-text-wrapper">
                        <div className="score-label">Best</div>
                        <div className="score-value">{best}</div>
                    </div>
                </div>

                {/* Dark Mahogany Board Container */}
                <div className="board-container">
                    <div
                        ref={gridRef}
                        className="game-grid"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`, gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)` }}
                    >
                        {Array.from({ length: GRID_SIZE }, (_, r) =>
                            Array.from({ length: GRID_SIZE }, (_, c) => {
                                const isGhost = ghostCells.has(`${r},${c}`);
                                const filled = grid[r][c];
                                return (
                                    <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize }}>
                                        <WoodCell filled={!!filled} color={filled} ghost={isGhost && !filled} highlight={isGhost && !!filled} />
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Game Over Modal */}
                    {gameOver && (
                        <div className="game-over-modal">
                            <div className="game-over-title">NO MORE MOVES!</div>
                            <div className="game-over-score">Final Score: {score}</div>
                            <button
                                className="retry-button"
                                onClick={restart}
                            >
                                RETRY
                            </button>
                        </div>
                    )}
                </div>

                {/* Piece Holders Area */}
                <div className="pieces-area">
                    {queue.map((piece, idx) => (
                        <div key={idx}
                            onMouseDown={piece ? (e) => handleDragStart(e, idx) : undefined}
                            onTouchStart={piece ? (e) => handleTouchStart(e, idx) : undefined}
                            className="piece-holder"
                        >
                            {piece && <PiecePreview piece={piece} dragging={dragging?.pieceIdx === idx} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Awesome Effect */}
            {showAwesome && (
                <div className="awesome-effect">
                    AWESOME!
                </div>
            )}

            {/* Score Popup Effect */}
            {lastScore && (
                <div key={lastScore.t} className="score-popup-effect">
                    +{lastScore.val}
                </div>
            )}
        </div>
    );
}
