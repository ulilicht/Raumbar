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

module.exports = config;