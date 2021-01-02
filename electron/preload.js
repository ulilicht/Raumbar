var RaumkernelLib = require('node-raumkernel');

let raumkernel = new RaumkernelLib.Raumkernel();
raumkernel.createLogger();
raumkernel.init();

window.raumkernel = raumkernel;

const {ipcRenderer} = require('electron');
window.ipcRenderer = ipcRenderer;