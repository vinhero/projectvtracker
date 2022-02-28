var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getAllRanks,
    });
});

async function getAllRanks() {

    // -------------------------- Variables -------------------------- //
    const arrHtmlPlayers = document.getElementsByClassName('match-overview__member-gameaccount');
    const arrTeamStatus = document.getElementsByClassName('match-overview__encounter-ready match-overview__encounter-ready--is-ready');
    const strApiUrl = 'https://api.henrikdev.xyz/valorant/v1/mmr/eu/';
    
    const dictRankIMG = 
    {
        'Iron 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Iron-1-Valorant-Rank-150x150.png',
        'Iron 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Iron-2-Valorant-Rank-150x150.png',
        'Iron 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Iron-3-Valorant-Rank-150x150.png',
        'Bronze 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Bronze-1-Valorant-Rank-150x150.png',
        'Bronze 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Bronze-2-Valorant-Rank-150x150.png',
        'Bronze 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Bronze-3-Valorant-Rank-150x150.png',
        'Silver 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Silver-1-Valorant-Rank-150x150.png',
        'Silver 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Silver-2-Valorant-Rank-150x150.png',
        'Silver 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Silver-3-Valorant-Rank-150x150.png',
        'Gold 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Gold-1-Valorant-Rank-150x150.png',
        'Gold 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Gold-2-Valorant-Rank-150x150.png',
        'Gold 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Gold-3-Valorant-Rank-150x150.png',
        'Platin 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Platin-1-Valorant-Rank-150x150.png',
        'Platin 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Platin-2-Valorant-Rank-150x150.png',
        'Platin 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Platin-3-Valorant-Rank-150x150.png',
        'Diamond 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Diamond-1-Valorant-Rank-150x150.png',
        'Diamond 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Diamond-2-Valorant-Rank-150x150.png',
        'Diamond 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Diamond-3-Valorant-Rank-150x150.png',
        'Immortal 1': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Immortal-1-Valorant-Rank-150x150.png',
        'Immortal 2': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Immortal-2-Valorant-Rank-150x150.png',
        'Immortal 3': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Immortal-3-Valorant-Rank-150x150.png',
        'Radiant': 'https://img.rankedboost.com/wp-content/uploads/2020/04/Valorant-Rank-1-150x150.png',
    }

    let dictAllPlayers = {};
    let dictTeamElo = { leftTeam: 0, rightTeam: 0 };
    
    
    // -------------------------- Functions -------------------------- //    
    function getRiotID (strUnshortened) {
        let strShortened = null;
        strShortened = strUnshortened.replace(/[\r\n]/gm, '');
        strShortened = strShortened.trimStart();
        strShortened = strShortened.trimEnd();
        return strShortened;
    }
    
    async function getPlayerRanks(){
        let leftPlayer = 1;
        let rightPlayer = 1;
        for (var key in dictAllPlayers){
            
            await fetch(buildPlayerURL(dictAllPlayers[key]['RiotID']))
            
            // Konvert to JSON
            .then((data) => data.json())

            // Add missing Infos
            .then((jsonData) => {
                dictAllPlayers[key]['elo'] = jsonData['data']['elo'];
                dictAllPlayers[key]['rank'] = jsonData['data']['currenttierpatched'];
            })

            // Add Ranks to HTML
            .then(() => {
                for (let nHtmlPlayerIndex = 0; nHtmlPlayerIndex < arrHtmlPlayers.length; nHtmlPlayerIndex++) {                 
                    
                    if (arrHtmlPlayers[nHtmlPlayerIndex].textContent.includes(dictAllPlayers[key]['RiotID'])){
                        
                        let strIMG = '<div class="match-overview__member-rank"><img src="' + dictRankIMG[dictAllPlayers[key]['rank']] +'" height="40" width="40"></div>';
                        let strInnerHTML = document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML;
                        
                        if (dictAllPlayers[key]['team'] === 'left')
                        {
                            document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML += strIMG;
                            dictTeamElo['leftTeam'] += dictAllPlayers[key]['elo'];
                            dictTeamElo['leftTeam'] /= leftPlayer;
                            leftPlayer++;
                        }
                        else if (dictAllPlayers[key]['team'] === 'right')
                        {
                            document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML = strIMG + strInnerHTML;
                            dictTeamElo['rightTeam'] += dictAllPlayers[key]['elo'];
                            dictTeamElo['leftTeam'] /= rightPlayer;
                            rightPlayer++;
                        }
                        else { /** Team status undefined */}
                    }
                    else { /** Not the right Player */}
                }
            });
        }
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

        return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
    }

    function getTeamElos(){
        
    }

    // -------------------------- Start -------------------------- //
    if (arrTeamStatus.length === 2)
    {
        for (let index = 0; arrHtmlPlayers.length > index; index++) 
        {
            let strRiotID = getRiotID(arrHtmlPlayers[index].textContent);
            dictAllPlayers[strRiotID] = { "RiotID": strRiotID };
            
            // Add Team to Player
            if (index < 5)
            {
                dictAllPlayers[strRiotID]['team'] = 'left';
            }
            else 
            {
                dictAllPlayers[strRiotID]['team'] = 'right';
            }
        }
        await getPlayerRanks();            
        getTeamElos();
    } 
    else { /** Not all Teams are ready, therefore no Ranks can be displayed. */}
}