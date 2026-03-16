import type { EngineEval } from '../types/chess';

export interface ValidMove {
  uci: string;
  san: string;
  from: string;
  to: string;
  capture: boolean;
  promotion: null | 'queen' | 'rook' | 'bishop' | 'knight';
  castling: boolean;
  check: boolean;
}

export interface ValidMovesRequest {
  fen: string;
}

export interface ValidMovesResponse {
  fen: string;
  side_to_move: 'white' | 'black';
  status: 'ongoing' | 'checkmate' | 'stalemate' | 'fifty_move_rule' | 'insufficient_material';
  move_count: number;
  moves: ValidMove[];
}

export interface SubmitMoveRequest {
  fen: string;
  move: string;
}

export interface SubmitMoveResponse {
  uci: string;
  san: string;
  from: string;
  to: string;
  fen: string;
  status: 'ongoing' | 'checkmate' | 'stalemate' | 'fifty_move_rule' | 'insufficient_material';
  side_to_move: 'white' | 'black';
  move_count: number;
  moves: ValidMove[];
}

export interface SubmitBestMoveResponse extends SubmitMoveResponse, EngineEval {}
