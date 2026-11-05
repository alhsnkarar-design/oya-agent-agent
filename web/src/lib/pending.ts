// A request made on the home page, picked up by the editor once it opens the project.
export type Pending = { id: string; text: string; voice?: Blob; target?: string };
let p: Pending | null = null;
export const setPending = (x: Pending) => { p = x; };
export const takePending = (id: string) => { if (p?.id !== id) return null; const x = p; p = null; return x; };
