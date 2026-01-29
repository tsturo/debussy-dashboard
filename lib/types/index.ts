export * from './agent';
export * from './message';
export * from './bead';
export * from './stats';
export * from './logs';
export * from './activity';
export * from './timeline';

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
