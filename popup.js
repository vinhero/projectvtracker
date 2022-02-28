var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});

async function getAllRanks() {
    //const ValorantAPI = require("valorant-api.js")

    // -------------------------- Variables -------------------------- //
    const arrHtmlPlayer = document.getElementsByClassName('match-overview__member-gameaccount');
    const strApiUrl = 'https://api.henrikdev.xyz/valorant/v1/mmr/eu/';
    
    let arrPlayerRIDs = [];
    

    // -------------------------- Functions -------------------------- //    
    function getRiotID (strUnshortened) {
        let strShortened = null;
        strShortened = strUnshortened.replace(/[\r\n]/gm, '');
        strShortened = strShortened.trimStart();
        strShortened = strShortened.trimEnd();
        return strShortened;
    }
    
    async function getPlayerRanks(arrPlayerIDs){
        let arrPlayerRanks = []; 
        arrPlayerIDs.forEach(async (strPlayerID) => {
            strPlayerURL = buildPlayerURL(strPlayerID);
            
            await fetch(strPlayerURL)
            .then((data) => data.json())
            .then((jsonData) => {
                arrPlayerRanks[arrPlayerRanks.length] = { 
                                                            playername: jsonData['data']['name'], 
                                                            playerelo: jsonData['data']['elo'],
                                                            playerrank: jsonData['data']['currenttierpatched']
                                                        }
            });            
        });
        return arrPlayerRanks;
    }

    function buildPlayerURL(strPlayerID){        
        let nIndexHashtag = strPlayerID.indexOf('#');
        let strPlayerName = '';
        let strPlayerTag = '';
        for (let nCharIndex = 0; strPlayerID.length > nCharIndex; nCharIndex++)
        {
            if (nCharIndex < nIndexHashtag)
            {
                strPlayerName += strPlayerID[nCharIndex];
            }
            else if (nCharIndex > nIndexHashtag)
            {
                strPlayerTag += strPlayerID[nCharIndex];
            }
            else {/** Do not add the character anywhere. */}
        }
        strPlayerName = strPlayerName.trimStart();
        strPlayerName = strPlayerName.trimEnd();
        strPlayerTag = strPlayerTag.trimStart();
        strPlayerTag = strPlayerTag.trimEnd();

        return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
    }

    // -------------------------- Start -------------------------- //
    // creates all RiotIDs from the MatchSide
    for (let index = 0; arrHtmlPlayer.length > index; index++) 
    {
        let strRiotID = getRiotID(arrHtmlPlayer[index].textContent);
        arrPlayerRIDs[index] = strRiotID;
    }
    let ranks = await getPlayerRanks(arrPlayerRIDs);
}