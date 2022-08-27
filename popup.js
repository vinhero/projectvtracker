/**
 * TODO:
 * Spielerränge anzeigen, selbst wenn das Spiel noch nicht angenommen wurde.
 * unranked playerranks
 * kompatibel selbst wenn nicht 10 Spieler?
 * Error am Saison beginn
 * 
 * Ladesymbol
 * 
 * schonmal angefragte spieler für die Sitzung speichern (reduktion der Anfragen),
 * Bilder zwischenspeichern?
 * 
 * 
 * Wenn man sich ein Team ansieht, Spieler mit Rank ausstatten
 * 
 * Nationalität?
 * 
 * durchschnittliche Gegner elo?
 * 
 * Durchschnitt Elo Team (Rank Icon?) (5 hightesrated)(ladderseite)
 * Filter nach Ingame MMR? (LadderSeite)
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
        else { /** Not all Teams are ready, therefore no Ranks can be displayed without scraping the RiotIDs. */ }
    }
    
    // User wants to Enhance a Team
    else if (blnEnhanceTeam) {
        
    }
    
    // User wants to Enhance a Profile
    else if (blnEnhanceProfile) {
        const strRankClassName = "statistic-section__logo";
        const strRiotIdClassName = "statistic-section__name";
        let strRiotID = getRiotID(document.querySelector("." + strRiotIdClassName).innerHTML);
        let objPlayerInfo = await getPlayerInfo(strRiotID);

        let htmlRankElement = createRankElement(objPlayerInfo, strRankClassName);

        // Replace Logo with Rank
        document.querySelector("." + strRankClassName).replaceWith(htmlRankElement);
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
        
    function createRankElement(playerInfo) {
        return createRankElement(playerInfo, null);
    }

    function createRankElement(playerInfo, strClassName) {
        let strWidth = "90";
        let strHeight = "90";
        let strPaddingButtom = "10";
        let strTagName = "IMG";
        let strOnclick = `window.open(\'${strTrackerUrl}${playerInfo.RiotID.replaceAll('#', '%23')}/${strTrackerSection}\')`;
        let htmlRankElement = document.createElement(strTagName);

        htmlRankElement.src = playerInfo.RankImg;
        htmlRankElement.width = strWidth;
        htmlRankElement.height = strHeight;
        htmlRankElement.padding = strPaddingButtom;
        htmlRankElement.onClick = strOnclick;

        if (strClassName != null)
            htmlRankElement.class = strClassName;

        return htmlRankElement;
    }

    // Promises
    async function getPlayerInfo(strRiotID) {
        const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
        let objPlayerInfo = new Object();
        objPlayerInfo.RiotID = strRiotID;

        console.log(buildApiUrl(strRiotID));
        return await fetch(buildApiUrl(strRiotID))
        
        .then((response) => response.json())
        
        // return important data
        .then((jsonData) => {
            console.log(jsonData)
            objPlayerInfo.RankImg = jsonData.data.images.large;
            objPlayerInfo.RankName = jsonData.data.currenttierpatched;
            return objPlayerInfo;
        })

        // if something goes wrong during fetch
        .catch((error) => {
            console.log(error.json);
            objPlayerInfo.RankImg = strUnrankedUrl;
            objPlayerInfo.RankName = "Unranked";
            return objPlayerInfo;
        })
        ;
    }
}