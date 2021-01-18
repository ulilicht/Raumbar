# Raumbar

Raumbar is an application to control Teufel Raumfeld Speakers from the Mac Menubar.

![Raumbar Screenshot](https://user-images.githubusercontent.com/456963/103465877-f4300c00-4d3f-11eb-905b-c16c11d4a0a2.png)

## Installation

Download the DMG installer for Mac from the [releases page](https://github.com/ulilicht/Raumbar/releases). 

## Development

### Basics

The app is created using [node-raumkernel](https://github.com/ChriD/node-raumkernel), React and Electron.

To get started, read about the concepts in

- https://github.com/facebook/create-react-app
- https://www.electronforge.io/

### Preparation

The App needs apple codesigning to run, as it opens a Network server. If you don't add a certificate, the app will still
run but ask for permissions to access the network on each launch. 

1) Create a certificate
2) Create a copy of `./codesign.config.dist.js` as `./codesign.config.js`
3) Add your certificate details to the new file.

More information can be found in the [Electron Docs](https://www.electronjs.org/docs/tutorial/code-signing)

### Starting

- run `yarn start`
- run `yarn start-electron` in another Terminal window.

### Building

- run `yarn make`
