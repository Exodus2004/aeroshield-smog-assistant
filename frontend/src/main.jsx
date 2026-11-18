import { h, render } from 'preact';
import { App } from './App.jsx';
import './index.css';

const root = document.getElementById('app');
if (root) {
  render(<App />, root);
}
