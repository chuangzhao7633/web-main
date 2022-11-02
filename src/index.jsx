import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App';
import './style/App.less';

const root = ReactDOM.createRoot(document.getElementById('web-main-root'));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);