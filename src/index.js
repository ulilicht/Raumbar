import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './react/App';

const isUsingWindows = navigator.userAgent.indexOf("Windows") > -1;
if (isUsingWindows) {
    document.body.classList.add('win');
}

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);