var apiurl = 'https://api.kyroskoh.xyz/valorant/v1/mmr/eu/';
var params = '?show=rr&rank&display=0'

chrome.runtime.onInstalled.addListener(() => {
   chrome.storage.sync.set({ apiurl });
   chrome.storage.sync.set({ params });
 });