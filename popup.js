var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});

function getAllRanks() {
    const arrHtmlPlayer = document.getElementsByClassName('match-overview__member-gameaccount');
    let arrPlayerRIDs = [];
    
    function getPlayerRank(arrPlayerIDs){
        arrPlayerIDs.forEach(strPlayerID => {
            buildPlayerURL(strPlayerID);
        });

        chrome.storage.sync.get(['arrPlayerURLs'], (arrData) => {
            arrData.arrPlayerURLs.forEach(strPlayerURL => {
                let strSideText = null;
                fetch(strPlayerURL, {
                    mode: 'no-cors'
                }).then((data) => {
                    data = strSideText;
                });
                console.log(strSideText);
            });
        });

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
        chrome.storage.sync.get(['strApiUrl', 'strParameters', 'arrPlayerURLs'], (arrData) => {
            arrData.arrPlayerURLs[arrData.arrPlayerURLs.length] = (arrData.strApiUrl + strPlayerName + '/' + strPlayerTag + arrData.strParameters).replaceAll(' ', '%20');
            //console.log(arrData.arrPlayerURLs[arrData.arrPlayerURLs.length-1]);
            chrome.storage.sync.set({arrPlayerURLs: arrData.arrPlayerURLs});
        });
    }
    
    for (let index = 0; arrHtmlPlayer.length > index; index++) 
    {
        let strRiotID = arrHtmlPlayer[index].textContent;
        strRiotID = strRiotID.replace(/[\r\n]/gm, '');
        strRiotID = strRiotID.trimStart();
        strRiotID = strRiotID.trimEnd();
        arrPlayerRIDs[index] = strRiotID;
        //console.log(strRiotID);
    }

    chrome.storage.sync.set({arrPlayers: arrPlayerRIDs}, () => {
        getPlayerRank(arrPlayerRIDs);
    });
}