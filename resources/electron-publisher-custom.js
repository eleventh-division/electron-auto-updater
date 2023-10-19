// build/electron-publisher-custom.js
//
// This publisher copies files to publish/ folder, to be rsync/upload-ed to any generic HTTP(s) server.
//
// package.json:
//
//    "publish": {
//      "provider": "custom"
//    }
//
// main process:
//
//   autoUpdater.setFeedURL("https://example.com/path/published");
//   autoUpdater.checkForUpdatesAndNotify();

const { Publisher } = require("electron-publish");
const fsPromises = require("fs/promises");
const path = require("path");

module.exports = class CustomPublisher extends Publisher {
  // more about task:
  //   https://github.com/electron-userland/electron-builder/blob/a94532164709a545c0f6551fdc336dbc5377bda8/packages/electron-publish/src/publisher.ts#L29
  async upload(task) {
    const filename = path.basename(task.file);
    await fsPromises.cp(
      task.file,
      path.join(__dirname, "../publish", filename)
    );
  }
};