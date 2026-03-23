import type { ValidMovesResponse, SubmitMoveResponse, SubmitBestMoveResponse } from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(baseUrl: string, path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
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
  getValidMoves(baseUrl: string, fen: string, signal?: AbortSignal): Promise<ValidMovesResponse> {
    return apiFetch<ValidMovesResponse>(baseUrl, '/validmoves', { fen }, signal);
  },

  submitMove(baseUrl: string, fen: string, move: string, signal?: AbortSignal): Promise<SubmitMoveResponse> {
    return apiFetch<SubmitMoveResponse>(baseUrl, '/submitmove', { fen, move }, signal);
  },

  submitBestMove(baseUrl: string, fen: string, depth: number, timeoutMs: number, signal?: AbortSignal): Promise<SubmitBestMoveResponse> {
    return apiFetch<SubmitBestMoveResponse>(baseUrl, '/submitbestmove', { fen, depth, timeout_ms: timeoutMs }, signal);
  },
};
