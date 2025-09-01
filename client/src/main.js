import { bootRouter, navigationTag } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
  navigationTag();
  await bootRouter();
});
