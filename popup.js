var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});

function getAllRanks() {
    
    // -------------------------- Variables -------------------------- //
    const arrHtmlPlayer = document.getElementsByClassName('match-overview__member-gameaccount');
    
    let arrPlayerRIDs = [];
    // let strApiUrl = 'https://api.kyroskoh.xyz/valorant/v1/mmr/eu/';
    // let strParameters = '?show=rr&rank&display=0'

    let strApiUrl = 'https://api.kyroskoh.xyz/valorant/v1/mmr/eu/';
    let strParameters = '?show=rr&rank&display=0'
    

    // -------------------------- Functions -------------------------- //
    function getRiotID (strUnshortened) {
        let strShortened = null;
        strShortened = strUnshortened.replace(/[\r\n]/gm, '');
        strShortened = strShortened.trimStart();
        strShortened = strShortened.trimEnd();
        return strShortened;
    }
    
    function getPlayerRanks(arrPlayerIDs){
        let arrPlayerURLs = [];
        arrPlayerIDs.forEach(strPlayerID => {
            arrPlayerURLs = buildPlayerURL(strPlayerID, arrPlayerURLs);
            
            let strSideText = null;
            fetch(arrPlayerURLs[arrPlayerURLs.length-1], {
                mode: 'cors'
            }).then((data) => {
                data = strSideText;
                console.log(data);
            });            
        });
    }

    function buildPlayerURL(strPlayerID, arrPlayerURLs){        
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
        arrPlayerURLs[arrPlayerURLs.length] = (strApiUrl + strPlayerName + '/' + strPlayerTag + strParameters).replaceAll(' ', '%20');
        return arrPlayerURLs;
    }

    // -------------------------- Start -------------------------- //
    // creates all RiotIDs from the MatchSide
    for (let index = 0; arrHtmlPlayer.length > index; index++) 
    {
        let strRiotID = getRiotID(arrHtmlPlayer[index].textContent);
        arrPlayerRIDs[index] = strRiotID;
        
        //console.log(strRiotID);
    }
    getPlayerRanks(arrPlayerRIDs);
}