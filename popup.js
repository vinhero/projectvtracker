/**
 * TODO:
 * Spielerränge anzeigen, selbst wenn das Spiel noch nicht angenommen wurde.
 * unranked playerranks
 * kompatibel selbst wenn nicht 10 Spieler?
 * Error am Saison beginn
 * 
 * Ladesymbol
 * 
 * Wenn man sich ein Team ansieht, Spieler mit Rank ausstatten
 * 
 * Nationalität?
 * 
 * durchschnittliche Gegner elo?
 * 
 * Durchschnitt Elo Team (ladderseite)
 * 
 */

var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});

async function getAllRanks() {

    // URLs
    const strApiUrl = "https://api.henrikdev.xyz/valorant/v1/mmr/eu/";

    const strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";
    
    const strProfileUrl = "https://projectv.gg/profile/";
    const strMatchUrl = "https://projectv.gg/matches/";
    const strTeamUrl = "https://projectv.gg/teams/";

    
    // Settings
    let blnEnhanceMatch = document.baseURI.includes(strMatchUrl);
    let blnEnhanceTeam = document.baseURI.includes(strTeamUrl);
    let blnEnhanceProfile = document.baseURI.includes(strProfileUrl);

    let strTrackerSection = "overview";
    
    console.log("start");
    // User wants to Enhance a Match
    if (blnEnhanceMatch) {
        
        const strStatusClassName = "match-overview__encounter-ready match-overview__encounter-ready--is-ready";
        const arrTeamStatus = document.getElementsByClassName(strStatusClassName);
        
        const strTeamClassName = "match-overview__members";
        const htmlCollection_Teams = document.getElementsByClassName(strTeamClassName);
        
        // Teams are ready
        if (arrTeamStatus.length === 2)
        {
            
        }
        
        // Teams are not ready
        else { /** Not all Teams are ready, therefore no Ranks can be displayed. */ }
    }
    
    // User wants to Enhance a Team
    else if (blnEnhanceTeam) {
        
    }
    
    // User wants to Enhance a Profile
    else if (blnEnhanceProfile) {
        console.log("profile");
        const strRankClassName = "statistic-section__logo";
        const strRiotIdClassName = "statistic-section__name";
        let strRiotID = getRiotID(document.querySelector("." + strRiotIdClassName).innerHTML);
        console.log("id = " + strRiotID);
        let objPlayerInfo = await getPlayerInfo(strRiotID);

        console.log(objPlayerInfo);
        let htmlRankElement = createRankElement(objPlayerInfo);
    }
    
    else { /** Case not specified yet. */}
    
    
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
        
    function createRankElemnt(playerInfo) {
        let strTagName = "IMG";
        let strOnclick = `window.open(\'${strTrackerUrl}${playerInfo.RiotID}/${strTrackerSection}\')`;
        let htmlRankElement = new HTMLElement(strTagName);
        
        return htmlRankElement;
    }

    // Promises
    async function getPlayerInfo(strRiotID) {
        console.log("playerinfo");
        const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
        let objPlayerInfo = new Object();
        objPlayerInfo.RiotID = strRiotID;
        return fetch(buildApiUrl(strRiotID))
        
        // return important data
        .then((response) => {
            objPlayerInfo.RankImg = response.data.images.large;
            objPlayerInfo.RankName = response.data.currenttierpatched;
            return objPlayerInfo;
        })

        // if something goes wrong during fetch
        .catch((error) => {
            objPlayerInfo.RankImg = strUnrankedUrl;
            objPlayerInfo.RankName = "Unranked";
            return objPlayerInfo;
        });
    }
}