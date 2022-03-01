chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getAllRanks,
    });
  }
});

async function getAllRanks() {
  console.log('exec');
  // -------------------------- Variables -------------------------- //
  const arrHtmlPlayers = document.getElementsByClassName('match-overview__member-gameaccount');
  const arrTeamStatus = document.getElementsByClassName('match-overview__encounter-ready match-overview__encounter-ready--is-ready');
  const strApiUrl = 'https://api.henrikdev.xyz/valorant/v1/mmr/eu/';
  
  // https://img.rankedboost.com/wp-content/uploads/2020/04/Iron-1-Valorant-Rank-150x150.png
  const dictRankIMG = 
  {
      'Iron 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/3.png',
      'Iron 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/4.png',
      'Iron 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/5.png',
      'Bronze 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/6.png',
      'Bronze 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/7.png',
      'Bronze 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/8.png',
      'Silver 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/9.png',
      'Silver 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/10.png',
      'Silver 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/11.png',
      'Gold 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/12.png',
      'Gold 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/13.png',
      'Gold 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/14.png',
      'Platin 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/15.png',
      'Platin 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/16.png',
      'Platin 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/17.png',
      'Diamond 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/18.png',
      'Diamond 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/19.png',
      'Diamond 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/20.png',
      'Immortal 1': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/21.png',
      'Immortal 2': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/22.png',
      'Immortal 3': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/23.png',
      'Radiant': 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/24.png',
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