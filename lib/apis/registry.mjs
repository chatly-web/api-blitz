import { adapter as api1 } from './api-1.mjs';
import { adapter as api2 } from './api-2.mjs';
import { adapter as api3 } from './api-3.mjs';
import { adapter as api4 } from './api-4.mjs';
import { adapter as api5 } from './api-5.mjs';
export const adapters = [api1, api2, api3, api4, api5];
export function catalog() {
  return adapters.map(({ id, name, description, mode }) => ({ id, name, description, mode }));
}
