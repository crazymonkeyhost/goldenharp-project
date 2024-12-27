export class Signal<T = undefined> {
  private _listeners: ((...data: ParamType<T>) => void)[] = [];

  private _onceListeners: ((...data: ParamType<T>) => void)[] = [];

  public lastPayload: T | undefined = undefined;

  public add(cb: (...data: ParamType<T>) => void, invokeImmediately = false) {
    this._listeners.push(cb);

    if (invokeImmediately) {
      this.invokeListener(cb, this.lastPayload as T);
    }
  }

  public once(cb: (...data: ParamType<T>) => void, invokeImmediately = false) {
    if (invokeImmediately) {
      this.invokeListener(cb, this.lastPayload as T);
    } else {
      this._onceListeners.push(cb);
    }
  }

  remove(cb: (...data: ParamType<T>) => void) {
    const index = this._listeners.indexOf(cb);

    if (index !== -1) {
      this._listeners.splice(index, 1);
    }

    const onceIndex = this._onceListeners.indexOf(cb);

    if (onceIndex !== -1) {
      this._onceListeners.splice(onceIndex, 1);
    }
  }

  removeAll() {
    this._listeners = [];
    this._onceListeners = [];
  }

  public dispatch<K extends T>(...args: K extends undefined ? [T?] : [T]) {
    this._listeners.forEach((cb) => this.invokeListener(cb, ...args));

    this.lastPayload = args[0];

    this._onceListeners.forEach((cb) => this.invokeListener(cb, ...args));

    this._onceListeners = [];
  }

  protected invokeListener<K extends T>(
    cb: (...data: ParamType<T>) => void,
    ...args: K extends undefined ? [T?] : [T]
  ) {
    cb(...args);
  }
}

type ParamType<T> = T extends undefined ? [T?] : [data: T];

export type SignalCallback<S extends Signal<unknown>> =
  S extends Signal<infer T> ? (...data: ParamType<T>) => void : never;
