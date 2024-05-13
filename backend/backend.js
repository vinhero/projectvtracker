const strApiUrl = "https://api.henrikdev.xyz/valorant/v1/mmr/eu/";
const strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";

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
    return true;  // Indicates that sendResponse will be called asynchronously
  }
});

async function fetchMatchInfo(strCurrentMatchId) {
  const matchResponse = await fetch("https://api.projectv.gg/api/v1/frontend/matches/" + strCurrentMatchId +"?expand=encounters.lineups.user.gameaccounts");
  const matchData = await matchResponse.json();
  
  let arrPlayers = [];
  for (let lineup in matchData.encounters){
    for (let player in matchData.encounters[lineup].lineups){
        arrPlayers.push(matchData.encounters[lineup]?.lineups[player]?.user?.gameaccounts[0]?.value ?? "");
    }
  }

  const playerResponses = await getPlayerInfos(arrPlayers);

  return playerResponses;
}

function buildApiUrl(strPlayerID) {        
  let strPlayerName = strPlayerID.split("#")[0];
  let strPlayerTag = strPlayerID.split("#")[1];
  return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
}

async function getPlayerInfos(arrRiotIDs) {
  const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
  
  let arrPlayerInfos = [];
  let arrPromises = [];
  for (let nIdIndex = 0; nIdIndex < arrRiotIDs.length; nIdIndex++) {
    let strRiotID = arrRiotIDs[nIdIndex];
    let strApiUrl = buildApiUrl(strRiotID);
    
    let objPlayerInfo = new Object();
    objPlayerInfo.RiotID = strRiotID;
    arrPromises.push(fetch(strApiUrl)
    
    // convert to json
    .then(response => response.json())
    
    // return important data
    .then(jsonData => {
      objPlayerInfo.RankImg = jsonData.data.images.large;
      objPlayerInfo.RankName = jsonData.data.currenttierpatched;
      return objPlayerInfo;
    })
    
    // fallback
    .catch((error) => {
      objPlayerInfo.RankImg = strUnrankedUrl;
      objPlayerInfo.RankName = "Unranked";
      return objPlayerInfo;
    }));
  }
  
  await Promise.all(arrPromises)
  
  // add to array / list
  .then(promises => {Promise.all(promises.map(aPromise => arrPlayerInfos.push(aPromise)))})
  
  // catch error
  .catch((error) => console.log('errormsg'));

  return arrPlayerInfos;
}