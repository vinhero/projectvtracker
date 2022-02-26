var strApiUrl = 'https://api.kyroskoh.xyz/valorant/v1/mmr/eu/';
var strParameters = '?show=rr&rank&display=0'
var arrPlayers = [];

chrome.runtime.onInstalled.addListener(() => {
   chrome.storage.sync.set({ strApiUrl });
   chrome.storage.sync.set({ strParameters });
   chrome.storage.sync.set({ arrPlayers });
 });