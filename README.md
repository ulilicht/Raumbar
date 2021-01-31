# Raumbar

Raumbar is an application to control Teufel Raumfeld Speakers from the Mac Menubar.

![Raumbar Screenshot](https://user-images.githubusercontent.com/456963/105579160-0cb2a580-5d85-11eb-94b2-875483060357.png)

## Installation

Download the DMG installer for Mac from the [releases page](https://github.com/ulilicht/Raumbar/releases). 

## Known Issues 

The app is not signed, as I don't own an Apple Developer Certificate. There are two shortcomings: 

- On first launch, the app needs to be launched from Mac system settings / security. 
- On every start, the app will ask to accept incoming network connections

You can overcome both by compiling the app from source yourself using your own developer certificate (see instructions below) 

## Development

### Basics

The app is created using [node-raumkernel](https://github.com/ChriD/node-raumkernel), React and Electron.

To get started, read about the concepts in

- https://github.com/facebook/create-react-app
- https://www.electronforge.io/

### Preparation
#### Basics 
You need NodeJS and preferably Yarn. 
If you want to build for Windows as well, you need to install `mono` additionally. 

#### Code signing
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
