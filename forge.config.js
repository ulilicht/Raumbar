const path = require('path');

const config = {
    "packagerConfig": {
        "icon": "public/AppIcon.icns",
        "extendInfo": "public/Info.plist"
    },
    "makers": [
        {
            "name": "@electron-forge/maker-dmg",
            "config": {
                "background": "public/dmg-installer-bg/Raumbar_installer_bg.png",
                "icon": "public/AppIcon.icns",
                "title": "Install Raumbar",
                "contents": [
                    {
                        "x": 415,
                        "y": 190,
                        "type": "link",
                        "path": "/Applications"
                    },
                    {
                        "x": 139,
                        "y": 190,
                        "type": "file",
                        "path": path.join(__dirname, 'out/Raumbar-darwin-x64/Raumbar.app')
                    }
                ],
                "additionalDMGOptions": {
                    "window": {
                        "size": {
                            "width": 540,
                            "height": 380
                        }
                    }
                }
            }
        }
    ]
};

try {
    const codeSignConfig = require('./codesign.config.js');
    config.packagerConfig.osxSign = {
        "identity": codeSignConfig.identity,
        "hardened-runtime": true,
        "entitlements": "public/Info.plist",
        "entitlements-inherit": "public/Info.plist",
        "signature-flags": "library"
    }
} catch (e) {
    console.log('\n SKIP CODE SIGN, CONFIG FILE NOT FOUND \n');
}

module.exports = config;