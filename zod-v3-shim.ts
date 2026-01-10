// Shim de runtime para mapear importações "zod/v3" para "zod" em ambientes Node/tsx
// onde o alias webpack não é aplicado.
// Carregar este módulo antes de usar dependências que requisitem "zod/v3".
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === 'zod/v3') {
    return originalResolve.call(this, 'zod', parent, isMain, options);
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
