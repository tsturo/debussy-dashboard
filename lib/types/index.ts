export * from './agent';
export * from './message';
export * from './bead';
export * from './stats';

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
