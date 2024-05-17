

const strApiUrl = "https://api.henrikdev.xyz/valorant/v1/mmr/eu/";
const strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";
const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
const strProjectVApiUrl = "https://api.projectv.gg/api/v1/frontend/matches/";
const strProjectVApiKeys = "?expand=encounters.lineups.user.gameaccounts";

const strProfileUrl = "https://projectv.gg/profile/";
const strMatchUrl = "https://projectv.gg/matches/";
const strTeamUrl = "https://projectv.gg/teams/";

let fetchDataTimer;
let dataRdyTimer;

function sendMatchDataRdy(tabId) {
  chrome.tabs.sendMessage(tabId, {action: "match"}, function(response) {
      console.log("match message sent");
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Received message:', message);
  if (message.action === "enhanceMatch") {
    enhanceMatch(message.matchID)
    
    .then(finalData => {
      console.log('Final data:', finalData);
      sendResponse({ finalData: finalData });

    }).catch(error => {
      console.error('Error fetching data:', error.toString());
      sendResponse({ finalData: null, error: error.toString() });
    });
    return true;  // async response
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
  if (changeInfo.status == 'complete') {
    console.log("Tab is loaded.");
    
    if (tab.url.includes(strMatchUrl)){
      clearTimeout(fetchDataTimer);

      let strMatchID = tab.url.replace(strMatchUrl, "");
      fetchDataTimer = setTimeout(() => {
        updatePlayersInStorage(strMatchID, tab)
        .then(() => console.log("Players in Match " + strMatchID + " updated in storage"))
        .catch((error) => console.log("Error while saving Match: " + strMatchID + " in storage.:" + error.toString()));
      }, 2000);
    }
  }
});

async function enhanceMatch(strMatchID) {
  console.log("enhancing Match");

  const strRiotIDs = await getMatchParticipantsInStorage(strMatchID);
  let arrPlayerInfos = [];
  for (let nIdIndex = 0; nIdIndex < strRiotIDs.length; nIdIndex++) {
    let strRiotID = strRiotIDs[nIdIndex];
    const savedPlayer = await getPlayerFromStorage(strRiotID);
    arrPlayerInfos.push(savedPlayer);
  }

  return arrPlayerInfos;
}

async function getMatchParticipantsInStorage(strMatchID) {
  try {
    const matchParticipants = await chrome.storage.local.get([strMatchID]);
    return matchParticipants[strMatchID].players;
  } catch (error) {
    console.log("Match " + strMatchID + " not found in Storage: " + error);
    return [];
  }
}

async function updatePlayersInStorage(strMatchID, tab) {
  let arrRiotIDs = await fetchParticipants(strMatchID);
  let arrNeededPlayers = [];

  for (let player in arrRiotIDs) {
    let strPlayerID = arrRiotIDs[player];
    const savedPlayerInfo = await getPlayerFromStorage(strPlayerID);

    if (savedPlayerInfo == undefined) {
      arrNeededPlayers.push(strPlayerID);
    }
    else if (savedPlayerInfo.Error || savedPlayerInfo.timestamp < new Date().getTime() - 86400000) {
      arrNeededPlayers.push(strPlayerID);
    }
    else {
      console.log("Player already in storage and up to date");
    }
  }

  const playerInfos = await getPlayerInfos(arrNeededPlayers);
  for (let player in playerInfos) {
    let objPlayerInfo = playerInfos[player];
    let timestamp = new Date().getTime();
    chrome.storage.local.set({[objPlayerInfo.RiotID]: {info: objPlayerInfo, timestamp: timestamp}}, function() {
      console.log(objPlayerInfo.RiotID + " saved in storage");
    });
  }

  chrome.storage.local.set({[strMatchID]: {players: arrRiotIDs}}, function() {
    console.log(strMatchID + " saved in storage");
  });

  clearTimeout(dataRdyTimer);
  dataRdyTimer = setTimeout(() => {
    if (tab.url.includes(strMatchUrl)) {
      sendMatchDataRdy(tab.id);
    }
  }, 1000);
}

async function getPlayerFromStorage(strPlayerID) {
  try {
    const playerInfo = await chrome.storage.local.get([strPlayerID]);
    return playerInfo[strPlayerID].info;
  } catch (error) {
    console.error(strPlayerID + " not found in Storage: " + error.toString());
    return undefined;
  }
}

async function fetchParticipants(strCurrentMatchId) {
  const matchResponse = await fetch(strProjectVApiUrl + strCurrentMatchId + strProjectVApiKeys);
  const matchData = await matchResponse.json();

  let arrPlayers = [];
  for (let lineup in matchData.encounters){
    for (let player in matchData.encounters[lineup].lineups){
      if (arrPlayers.includes(matchData.encounters[lineup]?.lineups[player]?.user?.gameaccounts[0]?.value) == false){
        arrPlayers.push(matchData.encounters[lineup]?.lineups[player]?.user?.gameaccounts[0]?.value ?? "");
      }
      else {/** Player already exists. */}
    }
  }

  return arrPlayers;
}

function buildApiUrl(strPlayerID) {        
  let arrPlayerTag = strPlayerID.split("#");
  let strPlayerName = arrPlayerTag[0];
  let strPlayerTag = arrPlayerTag[1];
  return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
}

async function getPlayerInfos(arrRiotIDs) {  
  let arrPlayerInfos = [];
  let arrPromises = [];
  for (let nIdIndex = 0; nIdIndex < arrRiotIDs.length; nIdIndex++) {
    let strRiotID = arrRiotIDs[nIdIndex];
    let strApiUrl = buildApiUrl(strRiotID);
    
    // build player info object
    let objPlayerInfo = new Object();
    objPlayerInfo.RiotID = strRiotID;
    objPlayerInfo.Error = false;
    arrPromises.push(fetch(strApiUrl)
    .then(response => response.json())
    .then(jsonData => {
      objPlayerInfo.RankImg = jsonData.data.images.large;
      objPlayerInfo.RankName = jsonData.data.currenttierpatched;
      return objPlayerInfo;
    })
    
    // fallback when playerInfo can't be fetched
    .catch((error) => {
      objPlayerInfo.RankImg = strUnrankedUrl;
      objPlayerInfo.RankName = "Unranked";
      objPlayerInfo.Error = true;
      console.error("Error: " + error.toString());
      return objPlayerInfo;
    }));
  }
  
  // wait for all playerInfos to resolve
  await Promise.all(arrPromises)
  .then(promises => {Promise.all(promises.map(aPromise => arrPlayerInfos.push(aPromise)))})
  .catch((error) => console.error("Error: " + error.toString()));

  return arrPlayerInfos;
}