// --------------- --------- --------------- //
// --------------- Variablen --------------- //
// --------------- --------- --------------- //

let m_btnGetRanks = document.getElementById("btnGetRanks");


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
    return playerurl = apiurl + playerid + '/' +playertag + params; 
}

function getPlayerRank(player){
    var playerid = null;
    var playertag = null;
    var playersite = chrome.runtime.getURL(buildPlayerURL(playerid, playertag));
}

function getAllRanks() {
    const arrHtmlPlayer = document.getElementsByClassName('match-overview__member');
    var m_arrPlayer = [];
    for (const player of arrHtmlPlayer){
        
        m_arrPlayer.push(new Matchplayer());
    }
    console.log(m_arrPlayer);
    
}




class Matchplayer {
    constructor(playername, playerrank, playerrr) {
        this.playername = playername;
        this.playerrank = playerrank;
        this.playerrr = playerrr;
    }
}