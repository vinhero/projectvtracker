const strApiUrl = "https://api.henrikdev.xyz/valorant/v1/mmr/eu/";
const strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";
const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
const strProjectVApiUrl = "https://api.projectv.gg/api/v1/frontend/matches/";
const strProjectVApiKeys = "?expand=encounters.lineups.user.gameaccounts";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Received message:', message);
  if (message.action === "enhanceMatch") {
    fetchMatchInfo(message.matchID).then(finalData => {
      console.log('Final data:', finalData);
      sendResponse({ finalData: finalData });
    }).catch(error => {
      console.error('Error fetching data:', error);
      sendResponse({ finalData: null, error: error.toString() });
    });
    return true;  // async response
  }
});

async function fetchMatchInfo(strCurrentMatchId) {
  
  // fetch match data
  const matchResponse = await fetch(strProjectVApiUrl + strCurrentMatchId + strProjectVApiKeys);
  const matchData = await matchResponse.json();
  
  // pull participant riot IDs
  let arrPlayers = [];
  for (let lineup in matchData.encounters){
    for (let player in matchData.encounters[lineup].lineups){
        arrPlayers.push(matchData.encounters[lineup]?.lineups[player]?.user?.gameaccounts[0]?.value ?? "");
    }
  }

  // fetch player data
  const playerResponses = await getPlayerInfos(arrPlayers);

  return playerResponses;
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
      return objPlayerInfo;
    }));
  }
  
  // wait for all playerInfos to resolve
  await Promise.all(arrPromises)
  .then(promises => {Promise.all(promises.map(aPromise => arrPlayerInfos.push(aPromise)))})
  .catch((error) => console.log("Error: " + error));

  return arrPlayerInfos;
}