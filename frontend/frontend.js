
console.log("ProjectV-Tracker is loaded.");
// URLs
const strApiUrl = "https://api.henrikdev.xyz/valorant/v1/mmr/eu/";

const strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";

const strProfileUrl = "https://projectv.gg/profile/";
const strMatchUrl = "https://projectv.gg/matches/";
const strTeamUrl = "https://projectv.gg/teams/";

// 
let blnEnhanceMatch = document.baseURI.includes(strMatchUrl);
let blnEnhanceTeam = document.baseURI.includes(strTeamUrl);
let blnEnhanceProfile = document.baseURI.includes(strProfileUrl);

let strTrackerSection = "overview";

setTimeout(() => {
    execRanks()
}, 2.0 * 1000);

function execRanks() {
    // User wants to Enhance a Match
    if (blnEnhanceMatch) {
        enhanceMatch();
    }
    
    // User wants to Enhance a Team
    else if (blnEnhanceTeam) {
        enhanceTeam();
    }
    
    // User wants to Enhance a Profile
    else if (blnEnhanceProfile) {
        
    }
    
    else { /** Case not specified yet. */}
}

async function enhanceMatch() {
    console.log("enhancing Match");

    let arrPlayers = [];
    // let strStatus = "";
    chrome.runtime.sendMessage({type: "enhanceMatch", matchID: document.baseURI.replace(strMatchUrl, "")}, function(response) {
        if (response.success) {
            let jsonData = response.data;
            // strStatus = jsonData.status;
            for (let lineup in jsonData.encounters){
                for (let player in jsonData.encounters[lineup].lineups){
                    arrPlayers.push(jsonData.encounters[lineup]?.lineups[player]?.user?.gameaccounts[0]?.value ?? "");
                }
            }

            getPlayerInfos(arrPlayers)
            .then(response => {
                addRanksToMatchpage(response);
            });
        } else {
          console.error('Fehler beim Abrufen der Daten:', response.error);
        }
    });
}

async function enhanceTeam() {
    console("enhancing Team");
    const strRankClassName = "statistic-section__logo";
    const strRiotIdClassName = "statistic-section__name";
    let strRiotID = getRiotID(document.querySelector("." + strRiotIdClassName).innerHTML);
    let arrPlayerInfo = await getPlayerInfos([strRiotID]);
    let objPlayerInfo = arrPlayerInfo[0];

    let htmlRankElement = createRankElement(objPlayerInfo, strRankClassName);

    // Replace Logo with Rank
    document.querySelector("." + strRankClassName).replaceWith(htmlRankElement);
}

function buildApiUrl(strPlayerID) {        
    let strPlayerName = strPlayerID.split("#")[0];
    let strPlayerTag = strPlayerID.split("#")[1];
    return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
}

// Promises
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

function addRanksToMatchpage(dictPlayerInfos) {
    for (let player of dictPlayerInfos) {
        let rankFactory = new RankFactory();
        let htmlRankElement = rankFactory.createMatchElement(player);

        for (let element = 0; element < document.getElementsByClassName("match-overview__member").length; element++){
            if (player.RiotID != "" && document.getElementsByClassName("match-overview__member")[element].getElementsByClassName("match-overview__member-gameaccount")[0].innerText.includes(player.RiotID)) {
                document.getElementsByClassName("match-overview__member")[element].appendChild(htmlRankElement);
            }
            else if (player.RiotID == "" && document.getElementsByClassName("match-overview__member")[element].getElementsByClassName("match-overview__member-gameaccount")[0].innerText == player.RiotID) {
                document.getElementsByClassName("match-overview__member")[element].appendChild(htmlRankElement);
            }
        }
    }
}