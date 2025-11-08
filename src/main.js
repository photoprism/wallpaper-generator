import './styles.css';
import { initApp } from './app/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');

  if (!root) {
    throw new Error('App root element with id "app" was not found.');
  }

  initApp(root);
});
