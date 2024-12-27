export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function raise(cause: string | Error): never {
  if (cause instanceof Error) {
    throw cause;
  }

  throw new Error(cause);
}
