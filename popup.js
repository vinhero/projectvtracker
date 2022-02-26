// --------------- --------- --------------- //
// --------------- Variablen --------------- //
// --------------- --------- --------------- //

var m_btnGetRanks = document.getElementById("btnGetRanks");


// --------------- ------ --------------- //
// --------------- Events --------------- //
// --------------- ------ --------------- //

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});


// --------------- ---------- --------------- //
// --------------- Funktionen --------------- //
// --------------- ---------- --------------- //

function buildPlayerURL(playerid, playertag){
    return playerurl = strApiUrl + playerid + '/' +playertag + strParameters; 
}

function getPlayerRank(){
    console.log('hi');
}

function getAllRanks() {
    const arrHtmlPlayer = document.getElementsByClassName('match-overview__member-gameaccount');
    let arrPlayerNames = {};
    for (let index = 0; arrHtmlPlayer.length > index; index++){
        arrPlayerNames[index] = arrHtmlPlayer[index].textContent;
    }
    chrome.storage.sync.set({arrPlayers: arrPlayerNames});
}