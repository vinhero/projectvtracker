/**
 * TODO:
 * (high) Spielerränge anzeigen, selbst wenn das Spiel noch nicht angenommen wurde.
 * (high) kompatibel selbst wenn nicht 10 Spieler?
 * (high) Settings-Page
 * 
 * (mid) durchschnittliche Gegner elo?
 * (mid) schonmal angefragte spieler für die Sitzung speichern (reduktion der Anfragen),
 * (mid) Wenn man sich ein Team ansieht, Spieler mit Rank ausstatten
 * 
 * (low) Ladesymbol
 * (low) Bilder zwischenspeichern?
 * (low) Durchschnitt Elo Team (Rank Icon?) (5 hightesrated)(ladderseite) (Loadingqueue)
 * (low) Nationalität?
 * 
 * (very low) Filter nach Ingame MMR? (LadderSeite)
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
    console.log('debug');
    if (blnEnhanceMatch) {
        
        const strStatusClassName = "match-overview__encounter-ready match-overview__encounter-ready--is-ready";
        const arrTeamStatus = document.getElementsByClassName(strStatusClassName);
        
        const strTeamClassName = "match-overview__members";
        const htmlCollection_Teams = document.getElementsByClassName(strTeamClassName);

        let dictTeamInfo = { };

        // Teams are ready
        if (arrTeamStatus.length === 2) {
            dictTeamInfo = createTeamInfo(htmlCollection_Teams);
        }
        
        // Teams are not ready
        else { 
            dictTeamInfo = createTeamInfo(htmlCollection_Teams, true);
        }
    }
    
    // User wants to Enhance a Team
    else if (blnEnhanceTeam) {
        
    }
    
    // User wants to Enhance a Profile
    else if (blnEnhanceProfile) {
        const strRankClassName = "statistic-section__logo";
        const strRiotIdClassName = "statistic-section__name";
        let strRiotID = getRiotID(document.querySelector("." + strRiotIdClassName).innerHTML);
        let objPlayerInfo = await getPlayerInfos(strRiotID);

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

    // TODO: Rework
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

    function createTeamInfo(htmlCollection) {
        return createTeamInfo(htmlCollection, false);
    }

    function createTeamInfo(htmlCollection, blnScrabbing) {
        let dictReturn = { };
        
        // build Teams
        for (let nTeamIndex = 0; nTeamIndex < htmlCollection.length; nTeamIndex++) {
            let dictTeam = { };
            let strSide = nTeamIndex == 0 ? "Left" : nTeamIndex == 1 ? "Right" : null;
            let team = htmlCollection[nTeamIndex].children;
            
            // build Players
            let arrRiotIDs = [];
            for (let nPlayerIndex = 0; nPlayerIndex < team.length; nPlayerIndex++) {
                const strPlayerClassName = "match-overview__member";
                const strPlayerIDClassName = "match-overview__member-gameaccount";
                
                let htmlPlayer = team[nPlayerIndex];
                if (htmlPlayer.className == strPlayerClassName) {
                    let strRiotID = getRiotID(htmlPlayer.querySelector("." + strPlayerIDClassName).textContent);
                    arrRiotIDs.push(strRiotID);
                }
                else { /** Not a Player. */ }
            }
            getPlayerInfos(arrRiotIDs);

            dictReturn[strSide] = dictTeam;
        }

        return dictReturn;
    }

    // Promises
    async function getPlayerInfos(arrRiotIDs) {
        const strUnrankedUrl = "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png";
        
        let arrPlayerInfos = [];
        let arrPromises = [];
        for (let nIdIndex = 0; nIdIndex < arrRiotIDs.length; nIdIndex++) {
            let strRiotID = arrRiotIDs[nIdIndex];
            let strApiUrl = buildApiUrl(strRiotID);
            arrPromises.push(fetch(strApiUrl));

            let objPlayerInfo = new Object();
            objPlayerInfo.RiotID = strRiotID;
        }
        
        await Promise.all(arrPromises).then((data) => console.log(data)).catch((error) => console.log('error'));
    }
}