/**
 * Mixin decorator.

  As cool as this is, I currently consider it to be an anti-pattern because
  without proper language support it violates DRY.

function mixin(...a: any[]) {
  return (target: any) => {
    a.forEach((baseCtor: any) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        // If you mixin one object into another using the provided TypeScript mixin code,
        // we'd overwrite the old constructor with the new constructor function. 

        // This is obviously not what we want.

        if (name === "constructor") {
          return;
        }

        target.prototype[name] = baseCtor.prototype[name];
      })
    });
  }
}

*/
