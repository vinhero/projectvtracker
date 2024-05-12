
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
    console.log("started.")
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
    let strStatus = "";
    chrome.runtime.sendMessage({type: "enhanceMatch", matchID: document.baseURI.replace(strMatchUrl, "")}, function(response) {
        if (response.success) {
            console.log("success");
            let jsonData = response.data;
            console.log(jsonData);
            strStatus = jsonData.status;
            for (let lineup in jsonData.encounters){
                for (let player in jsonData.encounters[lineup].lineups){
                    arrPlayers.push(jsonData.encounters[lineup].lineups[player].user.gameaccounts[0].value);
                }
            }
        } else {
          console.error('Fehler beim Abrufen der Daten:', response.error);
        }
    });
    

    let dictMatchInfo = { };

    let blnTeamAreReady = strStatus != "PENDING";
    dictMatchInfo = await createMatchInfo(htmlCollection_Teams, !blnTeamAreReady);
    console.log(dictMatchInfo);

    addRanksToMatchpage(dictMatchInfo);
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

function getRiotID (strUnshortened) {
    let strShortened = null;
    strShortened = strUnshortened.replace(/[\r\n]/gm, '');
    strShortened = strShortened.trimStart();
    strShortened = strShortened.trimEnd();
    return strShortened;
}

function buildApiUrl(strPlayerID) {        
    let nIndexHashtag = strPlayerID.indexOf('#');
    let strPlayerName = '';
    let strPlayerTag = '';
    for (let nCharIndex = 0; strPlayerID.length > nCharIndex; nCharIndex++)
    {
        // ID Name
        if (nCharIndex < nIndexHashtag) {
            strPlayerName += strPlayerID[nCharIndex];
        }

        // ID Tag
        else if (nCharIndex > nIndexHashtag) {
            strPlayerTag += strPlayerID[nCharIndex];
        }

        else { /** discard. */ }
    }
    return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
}

async function createMatchInfo(htmlCollection) {
    return await createMatchInfo(htmlCollection, false);
}

async function createMatchInfo(htmlCollection, blnScraping) {
    let dictReturn = { };
    
    // build Teams
    for (let nTeamIndex = 0; nTeamIndex < htmlCollection.length; nTeamIndex++) {
        let dictTeam = { };
        let strSide = nTeamIndex == 0 ? "Left" : nTeamIndex == 1 ? "Right" : null;
        let team = htmlCollection[nTeamIndex].children;
        
        // build Players
        let arrRiotIDs = [];
        let arrProfileNames = [];
        for (let nPlayerIndex = 0; nPlayerIndex < team.length; nPlayerIndex++) {
            const strPlayerClassName = "match-overview__member";
            const strProfileNameClassName = "match-overview__member-username";
            const strPlayerIDClassName = "match-overview__member-gameaccount";
            let htmlPlayer = team[nPlayerIndex];
            
            // Element is a Player
            if (htmlPlayer.className == strPlayerClassName) {
                let strProfileName = htmlPlayer.querySelector("." + strProfileNameClassName).title;
                arrProfileNames.push(strProfileName);
                let strRiotID = "";
                
                // RiotIDs are on the Matchpage
                if (blnScraping === false || blnScraping == null){
                    strRiotID = getRiotID(htmlPlayer.querySelector("." + strPlayerIDClassName).textContent);
                }
                    
                // RiotIDs have to be Scraped from the Players Profilepage
                else if (blnScraping === true){
                    let strScrapedRiotID = scrapeRiotID(strProfileName);
                    strRiotID = getRiotID(strScrapedRiotID);
                }
                
                else { /** Case not specified yet. */ }
                arrRiotIDs.push(strRiotID);
            }
            else { /** Not a Player. */ }
        }
        console.log(arrRiotIDs);
        await getPlayerInfos(arrRiotIDs, arrProfileNames)
        
        // add team to matchinfo
        .then((players) => {
            dictTeam.Players = players;
            dictReturn[strSide] = dictTeam;
        });
    }

    return dictReturn;
}

// Promises
async function getPlayerInfos(arrRiotIDs){
    return await getPlayerInfos(arrRiotIDs, null);
}

async function getPlayerInfos(arrRiotIDs, arrProfileNames) {
    const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
    
    let arrPlayerInfos = [];
    let arrPromises = [];
    for (let nIdIndex = 0; nIdIndex < arrRiotIDs.length; nIdIndex++) {
        let strRiotID = arrRiotIDs[nIdIndex];
        let strApiUrl = buildApiUrl(strRiotID);
        
        let objPlayerInfo = new Object();
        if (arrProfileNames != null) {
            objPlayerInfo.Profile = arrProfileNames[nIdIndex];
        }
        else { /** no profile names givin. */}

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

function scrapeRiotID(strProfileName) {
    let strRiotID = "";

    // convert profilename, so it can be used in the url
    let strConvertedProfileName = strProfileName.toLowerCase();
    strConvertedProfileName = strConvertedProfileName.replaceAll(" ", "-");

    let strScrapeUrl = strProfileUrl + strConvertedProfileName;

    return strRiotID;
}

function addRanksToMatchpage(dictTeamInfos) {
    for (let side in dictTeamInfos) {
        let team = dictTeamInfos[side];
        for (let player of team.Players) {
            let rankFactory = new RankFactory();
            let htmlRankElement = rankFactory.createMatchElement(player);

            for (let element = 0; element < document.getElementsByClassName("match-overview__member").length; element++){
                if (document.getElementsByClassName("match-overview__member")[element].getElementsByClassName("match-overview__member-gameaccount")[0].textContent.includes(player.RiotID)) {
                    document.getElementsByClassName("match-overview__member")[element].appendChild(htmlRankElement);
                }
            }
        }
        document.getElementsByClassName("match-overview__member")[0].getElementsByClassName("match-overview__member-gameaccount")[0].textContent
    }
}