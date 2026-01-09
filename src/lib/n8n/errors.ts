export class N8nConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'N8nConfigError';
  }
}

export class N8nConnectionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'N8nConnectionError';
  }
}

export class N8nAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown
  ) {
    super(message);
    this.name = 'N8nAPIError';
  }
}

export function isN8nError(
  error: unknown
): error is N8nConfigError | N8nConnectionError | N8nAPIError {
  return (
    error instanceof N8nConfigError ||
    error instanceof N8nConnectionError ||
    error instanceof N8nAPIError
  );
}
