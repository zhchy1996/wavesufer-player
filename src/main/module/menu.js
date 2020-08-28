/*
 * @Author: chengyuzhang 
 * @Date: 2020-08-28 18:56:55 
 * @Last Modified by: chengyuzhang
 * @Last Modified time: 2020-08-28 19:16:24
 */

const { Menu } = require("electron");

const clearObj = {
    storages: ['appcache', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage'],
};

const menu = new Menu.buildFromTemplate([
    {
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
        if (focusedWindow) {
            // 重载之后, 刷新并关闭所有之前打开的次要窗体
            if (focusedWindow.id === 1) {
                BrowserWindow.getAllWindows().forEach((win) => {
                    if (win.id > 1) win.close();
                });
            }
                focusedWindow.webContents.session.clearStorageData(clearObj,() => {
                focusedWindow.reload();
                })
            }
        },
    },
    {
        label: '清除缓存数据',
        accelerator: 'CmdOrCtrl+Shift+Delete',
        click: (item,focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.webContents.session.clearStorageData(clearObj);
            }
        }
    },
]);

Menu.setApplicationMenu(menu)
