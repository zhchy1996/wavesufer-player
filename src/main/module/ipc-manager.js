/*
 * @Author: chengyuzhang 
 * @Date: 2020-08-28 11:21:20 
 * @Last Modified by: chengyuzhang
 * @Last Modified time: 2020-08-28 15:35:52
 */

import {ipcMain} from 'electron';

ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
        file: filePath,
        icon: `${__static}/icon.jpg`
    })
})
