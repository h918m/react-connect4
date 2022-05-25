import cn from 'classnames'
import { memo, useReducer, useState } from 'react'
import InputColor from 'react-input-color';
import './App.css'

type Player = 'player1' | 'player2' | 'player0'
type Token = undefined | Player
type TBoard = Token[][]

const genEmptyBoard = (): TBoard =>
  Array(7)
    .fill(undefined)
    .map(() => Array(6).fill(undefined))

const genNewBoard = (
  board: TBoard,
  playedColumn: number,
  currentPlayer: Player
): TBoard => {
  return board.map((column, i) => {
    if (i === playedColumn) {
      const newColumn = [...column]
      for (let index = newColumn.length - 1; index >= 0; index--) {
        if (newColumn[index] === undefined) {
          newColumn[index] = currentPlayer
          break
        }
      }
      return newColumn
    }
    return column
  })
}

function canPlay(board: Token[][]) {
  for(let i = 0; i < board.length; i++) {
    if (board[i][0] == undefined) return true
  }
  return false
}

function checkIfWinner(board: TBoard, player: Player) {
  // vertical check
  for (let j = 0; j < 7; j++) {
    const column = board[j]
    for (let i = 0; i < 3; i++) {
      if (
        column[i] == player &&
        column[i + 1] == player &&
        column[i + 2] == player &&
        column[i + 3] == player
      ) {
        return true
      }
    }
  }

  // horizontal check
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 7; j++) {
      if (
        board[i][j] == player &&
        board[i + 1][j] == player &&
        board[i + 2][j] == player &&
        board[i + 3][j] == player
      ) {
        return true
      }
    }
  }

  // diagonal going up
  for (let i = 0; i < 4; i++) {
    for (let j = 5; j > 2; j--) {
      if (
        board[i][j] == player &&
        board[i + 1][j - 1] == player &&
        board[i + 2][j - 2] == player &&
        board[i + 3][j - 3] == player
      ) {
        return true
      }
    }
  }

  // diagonal going down
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        board[i][j] == player &&
        board[i + 1][j + 1] == player &&
        board[i + 2][j + 2] == player &&
        board[i + 3][j + 3] == player
      ) {
        return true
      }
    }
  }

  return false
}

function initState(player: Player = 'player1'): State {
  return {
    currentPlayer: player,
    winner: null,
    board: genEmptyBoard(),
    color1: '#f00',
    color2: '#ff0',
  }
}

function currentState(player: Player = 'player1', curColor1: any, curColor2: any): State {
  return {
    currentPlayer: player,
    winner: null,
    board: genEmptyBoard(),
    color1: curColor1,
    color2: curColor2,
  }
}

type Action =
  | {
    type: 'turn'
    payload: number
  }
  | {
    type: 'reset'
    payload: Player
  }
  | {
    type: 'set'
    payload: Function
  }
interface State {
  currentPlayer: Player
  winner: Player | null
  board: TBoard
  color1: string,
  color2: string
}
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'turn':
      const newBoard = genNewBoard(
        state.board,
        action.payload,
        state.currentPlayer
      )
      const currentPlayerWins = checkIfWinner(newBoard, state.currentPlayer)
      if (currentPlayerWins) {
        return {
          ...state,
          winner: state.currentPlayer,
          board: newBoard
        }
      } else {
        if (canPlay(newBoard)) {
          if (state.board[action.payload].some((cell) => {return cell == undefined})) {
            return {
              ...state,
              currentPlayer:
                state.currentPlayer === 'player1' ? 'player2' : 'player1',
              board: newBoard
            }
          } else {
            return state
          }
        } else {
            return {
              ...state,
              winner: 'player0',
              board: newBoard
            }
        }
      }
      // if (!canPlay(state.board)) {
      //   return state
      // }
    case 'reset':
      return currentState(action.payload, state.color1, state.color2)
    case 'set':
      return action.payload(state)
    default:
      throw new Error()
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initState('player1'))

  const [firstPlayer, setFirstPlayer] = useState({isFirst: true, player: 'player1'})

  const currentPlayer = state.currentPlayer
  const setCurrentPlayer = (p: Player) => dispatch({ type: 'set', payload: (s = {}) => ({ ...(s ?? {}), currentPlayer: p }) })

  const color1 = state.color1
  const setColor1 = (p: string) => dispatch({ type: 'set', payload: (s = {}) => ({ ...(s ?? {}), color1: p }) })

  const color2 = state.color2
  const setColor2 = (p: string) => dispatch({ type: 'set', payload: (s = {}) => ({ ...(s ?? {}), color2: p }) })


  function resetGame() {
    let player: Player = firstPlayer.player === 'player1' ? 'player2' : 'player1'
    setFirstPlayer({isFirst: false, player: player})
    dispatch({ type: 'reset', payload: player })
  }

  function initSetting() {
    setFirstPlayer({isFirst: false, player: state.currentPlayer})
  }

  function handleChange(value: Player = 'player1') {
    setCurrentPlayer(value)
  }

  return (
    <div className="App">
      {!firstPlayer.isFirst ? (
        state.winner && (
          <WinnerOverlay winner={state.winner} onClick={resetGame} state={state} />
        )
      ) : (
        <div className="Overlay">
          <div className="Modal">
            <h1>
              <span>Select terms</span>
            </h1>
            <div>
              <span>Starter:   </span>
              <input
                type="radio"
                name="currentPlayer"
                value="Player1"
                onChange={() => handleChange('player1')}
                checked={currentPlayer === 'player1'}
              />
              <label>Player1</label>

              <input
                type="radio"
                name="currentPlayer"
                value="Player2"
                onChange={() => handleChange('player2')}
                checked={currentPlayer === 'player2'}
              />
              <label>Player2</label>
            </div>
            <div>
              <div className='colorComp'>
                <InputColor
                  initialValue={color1}
                  onChange={(c) => setColor1(c?.hex || 'red')}
                  placement="right"
                />
                <div>
                  Player1 Color
                </div>
              </div>
              <div className='colorComp'>
                <InputColor
                  initialValue={color2}
                  onChange={(c) => setColor2(c?.hex || 'yellow')}
                  placement="right"
                />
                <div>
                  Player2 Color
                </div>
              </div>
            </div>
            <button onClick={initSetting}>Start Match</button>
          </div>
        </div>
      )}
      <h1 className="Title">Connect 4</h1>
      <div className="Turn">
        <div className="TurnText">Player turn:</div>
        <Cell token={currentPlayer} size={20} state={state} />
      </div>
      <div className="Board">
        {state.board.map((column, i) => (
          <Column
            key={i}
            column={column}
            onClick={() => dispatch({ type: 'turn', payload: i })}
            state={state}
          />
        ))}
      </div>
    </div>
  )
}

interface ColumnProps {
  column: Token[]
  onClick: () => void
  state: State
}
function ColumnRaw({ column, onClick, state }: ColumnProps) {
  return (
    <div className="Column" onClick={onClick}>
      {column.map((token, i) => (
        <Cell key={i} token={token} state={state} />
      ))}
    </div>
  )
}
function areEqual(prevProps: ColumnProps, nextProps: ColumnProps) {
  for (let i = 0; i < prevProps.column.length; i++) {
    if (prevProps.column[i] !== nextProps.column[i]) return false
  }
  return true
}
const Column = memo(ColumnRaw, areEqual)

const Cell = function CellRaw({
  token,
  size,
  state
}: {
  token: Token,
  size?: number,
  state: State
}) {
  const color1 = state.color1

  const color2 = state.color2

  let style: React.CSSProperties = {}
  if (size) {
    style = {
      borderRadius: size,
      width: size,
      height: size,
      margin: 0,
    }
  }
  return (
    <div
      style={{
        ...(style ?? {}),
        background: token === 'player1' ? color1 : token === 'player2' ? color2 : 'white'
      }}
      className={cn('Cell', {
        'Cell-player1': token === 'player1',
        'Cell-player2': token === 'player2'
      })}
    />
  )
}

function WinnerOverlay({
  winner,
  onClick,
  state
}: {
  winner: Player
  onClick: () => void,
  state: State
}) {
  return (
    <div className="Overlay">
      <div className="Modal">
          {winner != 'player0' ? 
            (
              <h1>
                <Cell token={winner} size={20} state={state} />
                <span>{winner} wins!</span>
              </h1>
              ): (
                <h1>
                  <span>Nobody wins!</span>
                </h1>
            )}
        <button
          onClick={() => onClick()}
        >
          Rematch
        </button>
      </div>
    </div>
  )
}

function ResetOverlay({ }: // starter,
  // onClick
  {
    // starter: Player
    // onClick: (player: Player) => void
  }) {
  return (
    <div className="Overlay">
      <div className="Modal">
        <h1>
          <span>Select terms</span>
        </h1>
        <button>Start a new match</button>
      </div>
    </div>
  )
}

export default App
