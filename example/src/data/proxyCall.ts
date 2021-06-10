export interface ProxyCallable<T extends object> {
  config: T;
}

export function proxyCall<T extends object, O extends ProxyCallable<T>>(
  obj: O
): O {
  return new Proxy(obj, {
    get(target, key, receiver) {
      if (Reflect.has(target, key) || !Reflect.has(target.config, key)) {
        return Reflect.get(target, key, receiver);
      }
      return Reflect.get(target.config, key);
    },
  });
}
