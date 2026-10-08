// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getReminders: () => ipcRenderer.invoke('get-reminders'),
  saveReminders: (reminders) => ipcRenderer.invoke('save-reminders', reminders),
  requestMicrophone: () => ipcRenderer.invoke('request-microphone')
});