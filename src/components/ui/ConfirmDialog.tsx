export function ConfirmDialogHost() { return null; }
export function confirm(o: any) { return Promise.resolve(window.confirm(o.message)); }
