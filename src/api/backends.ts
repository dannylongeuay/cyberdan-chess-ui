export interface Backend {
  label: string;
  url: string;
}

const DEV_BACKENDS: Backend[] = [
  { label: 'Local', url: 'http://localhost:8080' },
];

const PROD_BACKENDS: Backend[] = [
  { label: 'Cyberdan', url: 'https://chess-solver.cyberdan.dev' },
  { label: 'Vizzini', url: 'https://vizzini.cyberdan.dev' },
];

export const BACKENDS = import.meta.env.DEV ? DEV_BACKENDS : PROD_BACKENDS;
export const DEFAULT_BACKEND = BACKENDS[0];
