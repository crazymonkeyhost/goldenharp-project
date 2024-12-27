// eslint-disable-next-line
export function bound(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = context.name;

  if (context.private) {
    throw new Error(`'bound' cannot decorate private properties like ${methodName as string}.`);
  }

  // eslint-disable-next-line
  context.addInitializer(function (this: any) {
    this[methodName] = this[methodName].bind(this);
  });
}
