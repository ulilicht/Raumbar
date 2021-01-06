/**
 * INSTRUCTIONS
 *  1) add your certificate name in the field "identity".
 *  2) copy this file as "codesign.config.js" next to the original file.
 *
 *
 *
 * This will be passed to electron-forge
 * for code signing on the mac. It will be used for the
 * package.json --> config.forge.packagerConfig.osxSign.identity property.
 * You can receive your certificate name by executing `security find-identity` on your mac.
 *
 * See https://www.electronjs.org/docs/tutorial/code-signing#electron-forge for documentation
 *
 */

const config = {
    "identity": "Apple Development: john.doe@johndoe.com (YOUR COMPUTER)",
};

module.exports = config;