import { useState, useEffect } from "react";
import Player from "./components/Player";
import GameBoard from "./components/GameBoard";
import Log from "./components/Log";
import { WINNING_COMBINATIONS } from "./components/winning-combinations";
import GameOver from "./components/GameOver";

const PLAYERS = {
  X: 'Player 1',
  O: 'Player 2'
};

const INITIAL_GAME_BOARD = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

function deriveActivePlayer(gameTurns) {
  return gameTurns.length % 2 === 0 ? 'X' : 'O';
}

function deriveGameBoard(gameTurns) {
  let gameBoard = [...INITIAL_GAME_BOARD.map((array) => [...array])];

  for (const turn of gameTurns) {
    if (!turn || !turn.square || !turn.player) {
      console.error("Invalid turn data:", turn);
      continue;
    }
    const { square, player } = turn;
    const { row, col } = square;

    if (typeof row !== 'number' || typeof col !== 'number') {
      console.error("Invalid square data:", square);
      continue;
    }

    if (!['X', 'O'].includes(player)) {
      console.error("Invalid player data:", player);
      continue;
    }

    if (gameBoard[row] && gameBoard[row][col] !== undefined) {
      gameBoard[row][col] = player;
    } else {
      console.error("Invalid game board index:", { row, col });
    }
  }

  console.log("Derived Game Board:", gameBoard);
  return gameBoard;
}

function deriveWinner(gameBoard, players) {
  for (const combination of WINNING_COMBINATIONS) {
    const [first, second, third] = combination.map(({ row, column }) => gameBoard[row][column]);

    if (first && first === second && first === third) {
      return players[first];
    }
  }
  return null;
}

function minimax(gameBoard, depth, isMaximizing) {
  const winner = deriveWinner(gameBoard, PLAYERS);
  if (winner) {
    return winner === PLAYERS.X ? -10 : 10;
  }
  if (gameBoard.flat().every(cell => cell)) {
    return 0;
  }

  const scores = [];
  const moves = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (!gameBoard[row][col]) {
        const newBoard = gameBoard.map(r => [...r]);
        newBoard[row][col] = isMaximizing ? 'O' : 'X';
        const score = minimax(newBoard, depth + 1, !isMaximizing);
        scores.push(score);
        moves.push({ row, col });
      }
    }
  }

  if (isMaximizing) {
    const maxScore = Math.max(...scores);
    return depth === 0 ? moves[scores.indexOf(maxScore)] : maxScore;
  } else {
    const minScore = Math.min(...scores);
    return depth === 0 ? moves[scores.indexOf(minScore)] : minScore;
  }
}

function getBestMove(gameBoard) {
  const bestMove = minimax(gameBoard, 0, true);
  console.log("Best Move:", bestMove);
  return bestMove;
}

function App() {
  const [gameTurns, setGameTurns] = useState([]);
  const [players, setPlayers] = useState(PLAYERS);
  const [gameMode, setGameMode] = useState('player'); // 'player' or 'ai'

  const activePlayer = deriveActivePlayer(gameTurns);
  const gameBoard = deriveGameBoard(gameTurns);
  const winner = deriveWinner(gameBoard, players);
  const hasDraw = gameTurns.length === 9 && !winner;

  useEffect(() => {
    if (gameMode === 'ai' && activePlayer === 'O' && !winner) {
      const { row, col } = getBestMove(gameBoard);
      if (typeof row === 'number' && typeof col === 'number') {
        setGameTurns(prevTurns => [
          ...prevTurns,
          { square: { row, col }, player: 'O' }
        ]);
      } else {
        console.error("Invalid AI move:", { row, col });
      }
    }
  }, [activePlayer, gameBoard, gameMode, winner]);

  useEffect(() => {
    console.log("Players state updated:", players);
  }, [players]);

  const handleSelectSquare = (rowIndex, colIndex) => {
    if (winner || gameBoard[rowIndex][colIndex] || (gameMode === 'ai' && activePlayer === 'O')) return;

    if (typeof rowIndex !== 'number' || typeof colIndex !== 'number') {
      console.error("Invalid rowIndex or colIndex:", { rowIndex, colIndex });
      return;
    }

    console.log("Player Move:", { rowIndex, colIndex, player: activePlayer });
    setGameTurns(prevTurn => [
      ...prevTurn,
      { square: { row: rowIndex, col: colIndex }, player: activePlayer }
    ]);
  };

  const handleRestart = () => {
    setGameTurns([]);
  };

  const handlePlayerNameChange = (symbol, newName) => {
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      [symbol]: newName
    }));
  };

  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    console.log("Selected game mode:", mode);
    setPlayers(prevPlayers => ({
      ...prevPlayers,
      O: mode === 'ai' ? 'AI' : PLAYERS.O
    }));
    setGameTurns([]);
  };

  return (
    <main>
      <div id="game-container">
        <div id="game-mode">
          <button onClick={() => handleGameModeChange('player')}>Player vs Player</button>
          <button onClick={() => handleGameModeChange('ai')}>Player vs AI</button>
        </div>
        <ol id="players" className="highlight-player">
          <Player
            name={players.X}
            symbol="X"
            isActive={activePlayer === 'X'}
            onNameChange={handlePlayerNameChange}
          />
          <Player
            name={players.O}
            symbol="O"
            isActive={activePlayer === 'O'}
            onNameChange={handlePlayerNameChange}
          />
        </ol>
        {(winner || hasDraw) && <GameOver winner={winner || null} onRestart={handleRestart} />}
        <GameBoard
          onSelectSquare={handleSelectSquare}
          gameBoard={gameBoard}
        />
      </div>
      <Log turns={gameTurns} />
    </main>
  );
}

export default App;
