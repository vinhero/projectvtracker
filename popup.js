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

    // -------------------------- Variables -------------------------- //
    const arrHtmlPlayers = document.getElementsByClassName('match-overview__member-gameaccount');
    const arrTeamStatus = document.getElementsByClassName('match-overview__encounter-ready match-overview__encounter-ready--is-ready');
    const strApiUrl = 'https://api.henrikdev.xyz/valorant/v1/mmr/eu/';

    const strProfileUrl = "https://projectv.gg/profile/";
    const strMatchUrl = "https://projectv.gg/matches/"
    
    // Source: https://tracker.gg/valorant
    // Source: https://senpai.gg/valorant/ranks
    const dictRankIMG = 
    {
        'Unranked': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png',
        'Iron 1': 'https://static.senpai.gg/_nuxt/img/882a6ab.webp',
        'Iron 2': 'https://static.senpai.gg/_nuxt/img/308c6b1.webp',
        'Iron 3': 'https://static.senpai.gg/_nuxt/img/0d2c2e2.webp',
        'Bronze 1': 'https://static.senpai.gg/_nuxt/img/0978c02.webp',
        'Bronze 2': 'https://static.senpai.gg/_nuxt/img/f35cc12.webp',
        'Bronze 3': 'https://static.senpai.gg/_nuxt/img/d755c0b.webp',
        'Silver 1': 'https://static.senpai.gg/_nuxt/img/7045b2e.webp',
        'Silver 2': 'https://static.senpai.gg/_nuxt/img/e44cf4c.webp',
        'Silver 3': 'https://static.senpai.gg/_nuxt/img/2eabb1e.webp',
        'Gold 1': 'https://static.senpai.gg/_nuxt/img/d4ba2e0.webp',
        'Gold 2': 'https://static.senpai.gg/_nuxt/img/8f2dca4.webp',
        'Gold 3': 'https://static.senpai.gg/_nuxt/img/d80a217.webp',
        'Platin 1': 'https://static.senpai.gg/_nuxt/img/5302762.webp',
        'Platin 2': 'https://static.senpai.gg/_nuxt/img/96f79d7.webp',
        'Platin 3': 'https://static.senpai.gg/_nuxt/img/80d9eda.webp',
        'Diamond 1': 'https://static.senpai.gg/_nuxt/img/29bb3a9.webp',
        'Diamond 2': 'https://static.senpai.gg/_nuxt/img/8a3932d.webp',
        'Diamond 3': 'https://static.senpai.gg/_nuxt/img/303e9a9.webp',
        'Ascendant 1': 'https://static.senpai.gg/_nuxt/img/4ab8f39.webp',
        'Ascendant 2': 'https://static.senpai.gg/_nuxt/img/0d4cb42.webp',
        'Ascendant 3': 'https://static.senpai.gg/_nuxt/img/9975b8f.webp',
        'Immortal 1': 'https://static.senpai.gg/_nuxt/img/683d7b3.webp',
        'Immortal 2': 'https://static.senpai.gg/_nuxt/img/ed6acd3.webp',
        'Immortal 3': 'https://static.senpai.gg/_nuxt/img/3d3a5fc.webp',
        'Radiant': 'https://static.senpai.gg/_nuxt/img/09fc2e7.webp'
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
                        let strOnClick = '\"window.open(\'https://tracker.gg/valorant/profile/riot/' + dictAllPlayers[key]['RiotID'] +'/overview\')\"';
                        strOnClick = strOnClick.replaceAll('#', '%23')
                        let strIMG = '<div class="match-overview__member-rank"><img src="' + dictRankIMG[dictAllPlayers[key]['rank']] +'" height="40" width="40" onclick=' + strOnClick + '></div>';
                        let strInnerHTML = document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML;
                        
                        if (dictAllPlayers[key]['team'] === 'left')
                        {
                            document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML += strIMG;
                        }
                        else if (dictAllPlayers[key]['team'] === 'right')
                        {
                            document.getElementsByClassName('match-overview__member')[nHtmlPlayerIndex].innerHTML = strIMG + strInnerHTML;
                        }
                        else { /** Team status undefined */ }
                    }
                    else { /** Not the right Player */ }
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
            else { /** Do not add the character anywhere. */ }
        }

        return (strApiUrl + strPlayerName + '/' + strPlayerTag).replaceAll(' ', '%20');
    }

    function getTeamElos(){
        let nRCount = 0;
        let nLCount = 0;
        
        for (var key in dictAllPlayers)
        {
            const objPlayer = dictAllPlayers[key];
            if (objPlayer['team'] === 'left')
            {
                dictTeamElo['leftTeam'] += objPlayer['elo'];
                nLCount++;
            }
            else if (objPlayer['team'] === 'right')
            {
                dictTeamElo['rightTeam'] += objPlayer['elo'];
                nRCount++;
            }
            
        }
        
        if (nRCount > 0)
        {
            dictTeamElo['rightTeam'] = parseInt(dictTeamElo['rightTeam'] / nRCount);
        } else { }
        
        if (nLCount > 0){
            dictTeamElo['leftTeam'] = parseInt(dictTeamElo['leftTeam'] / nLCount);
        }else { } 

        document.getElementsByClassName('match-overview__members')[0].innerHTML += '<div> ELO:  ' + dictTeamElo['leftTeam'] + '</div>';
        document.getElementsByClassName('match-overview__members')[1].innerHTML += '<div> ELO:  ' + dictTeamElo['rightTeam'] + '</div>';
    }

    // -------------------------- Start -------------------------- //
    if (arrTeamStatus.length === 2)
    {
        for (let index = 0; arrHtmlPlayers.length > index; index++) 
        {
            let strRiotID = getRiotID(arrHtmlPlayers[index].textContent);
            dictAllPlayers[strRiotID] = { "RiotID": strRiotID };
            
            // Add Team to Player
            // TODO: funktioniert nicht wenn Spieleranzahl < 5 o. Spieleranzahl > 5
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
    else { /** Not all Teams are ready, therefore no Ranks can be displayed. */ }
}