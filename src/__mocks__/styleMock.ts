const handler: ProxyHandler<object> = {
  get: (_target, prop) => (typeof prop === 'string' ? prop : undefined),
}
export default new Proxy({}, handler)
