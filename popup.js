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

    let arrPlayerRIDs = [];
    let arrFullPlayer = [];

    let arrTeamElo = { leftTeam: null, rightTeam: null };
    
    
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
        let nIndex = 0;
        arrPlayerIDs.forEach(async (strPlayerID) => {
            strPlayerURL = buildPlayerURL(strPlayerID);
            
            await fetch(strPlayerURL)
            .then((data) => data.json())
            .then((jsonData) => {
                arrPlayerRanks[arrPlayerRanks.length] = {
                                                            playername: strPlayerID, 
                                                            playerelo: jsonData['data']['elo'],
                                                            playerrank: jsonData['data']['currenttierpatched']
                                                        };
                for (let nIndex = 0; nIndex < arrFullPlayer.length; nIndex++) {
                    if (arrFullPlayer[nIndex]['RiotID'] == strPlayerID)
                    {
                        arrFullPlayer[nIndex]['elo'] = jsonData['data']['elo'];
                        arrFullPlayer[nIndex]['rank'] = jsonData['data']['currenttierpatched'];
                        let strIMG = '<div class="match-overview__member-rank"><img src="' + dictRankIMG[arrPlayerRanks[arrPlayerRanks.length-1]['playerrank']] +'" height="40" width="40"></div>';
                        let strInnerHTML = document.getElementsByClassName('match-overview__member')[nIndex].innerHTML;
                        if(nIndex < 5)
                        {
                            document.getElementsByClassName('match-overview__member')[nIndex].innerHTML += strIMG;
                        }
                        else 
                        {
                            document.getElementsByClassName('match-overview__member')[nIndex].innerHTML = strIMG + strInnerHTML;
                        }
                    }
                    else {}
                    
                }
                console.log(arrFullPlayer);
                                                        
            })
            .then(() => {
                // let strIMG = '<div class="match-overview__member-rank"><img src="' + dictRankIMG[arrPlayerRanks[arrPlayerRanks.length-1]['playerrank']] +'" height="40" width="40"></div>';
                // let strInnerHTML = document.getElementsByClassName('match-overview__member')[nIndex].innerHTML;
                // if(nIndex < 5)
                // {
                //     document.getElementsByClassName('match-overview__member')[nIndex].innerHTML += strIMG;
                // }
                // else 
                // {
                //     document.getElementsByClassName('match-overview__member')[nIndex].innerHTML = strIMG + strInnerHTML;
                // }
                // nIndex += 1;                          
            });   
            console.log('hi');         
        });
        console.log('fertig');
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

        return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
    }

    function getTeamElo(strTeam){
        if (strTeam === 'left')
        {

        }
        else if (strTeam === 'right')
        {

        }
        else {/** Team not defined */}
    }

    // -------------------------- Start -------------------------- //
    if (arrTeamStatus.length === 2)
    {
        console.log('start');
        // creates all RiotIDs from the MatchSide
        for (let index = 0; arrHtmlPlayer.length > index; index++) 
        {
            let strTeam = null;
            arrFullPlayer[arrFullPlayer.length] = 
            {
                'html': arrHtmlPlayer[index],
            };
            let strRiotID = getRiotID(arrHtmlPlayer[index].textContent);
            arrFullPlayer[arrFullPlayer.length-1]['RiotID'] = strRiotID;
            if (index < 5)
            {
                strTeam = 'left';
            }
            else 
            {
                strTeam = 'right';
            }
            arrFullPlayer[arrFullPlayer.length-1]['team'] = strTeam;
            
            arrPlayerRIDs[index] = strRiotID;
        }
        let ranks = await getPlayerRanks(arrPlayerRIDs);
        console.log(ranks['0']);
        console.log(ranks.length);
        for (let nIndex = 0; nIndex < ranks.length; nIndex++) {
            const element = ranks[nIndex];
            document.getElementsByClassName('match-overview__member')[nIndex].innerHTML += '<div class="match-overview__member-rank"><img src="https://cdna.artstation.com/p/assets/images/images/032/901/292/large/jared-tod-ranka.jpg?1607811047" height="40" width="40"></div>';
            console.log('go');            
        }
            

        arrTeamElo['leftTeam'] = getTeamElo('left');
        arrTeamElo['rightTeam'] = getTeamElo('right');
    } 
    else { /** Not all Teams are ready, therefore no Ranks can be displayed. */}
}