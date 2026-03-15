import type { ValidMovesResponse, SubmitMoveResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, text);
  }

  return res.json();
}

export const api = {
  getValidMoves(fen: string, signal?: AbortSignal): Promise<ValidMovesResponse> {
    return apiFetch<ValidMovesResponse>('/validmoves', { fen }, signal);
  },

  submitMove(fen: string, move: string, signal?: AbortSignal): Promise<SubmitMoveResponse> {
    return apiFetch<SubmitMoveResponse>('/submitmove', { fen, move }, signal);
  },
};
