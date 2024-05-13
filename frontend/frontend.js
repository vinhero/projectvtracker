
console.log("ProjectV-Tracker is loaded.");

const strProfileUrl = "https://projectv.gg/profile/";
const strMatchUrl = "https://projectv.gg/matches/";
const strTeamUrl = "https://projectv.gg/teams/";

// Class Names
const strRankClassName = "statistic-section__logo";
const strRiotIdClassName = "statistic-section__name";

const strOverviewClassName = "match-overview__member";
const strGameAccountClassName = "match-overview__member-gameaccount";


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('Received message:', message);
    if (message.action === "match") {
      enhanceMatch();
    }
});

async function enhanceMatch() {
    console.log("enhancing Match");

    chrome.runtime.sendMessage({ action: "enhanceMatch", matchID: document.baseURI.replace(strMatchUrl, "") }, function(response) {
        console.log('Received final data:', response.finalData);
        addRanksToMatchpage(response.finalData);
    });
}

// async function enhanceTeam() {
//     console("enhancing Team");
//     let strRiotID = getRiotID(document.querySelector("." + strRiotIdClassName).innerHTML);
//     let arrPlayerInfo = await getPlayerInfos([strRiotID]);
//     let objPlayerInfo = arrPlayerInfo[0];

//     let htmlRankElement = createRankElement(objPlayerInfo, strRankClassName);

//     // Replace Logo with Rank
//     document.querySelector("." + strRankClassName).replaceWith(htmlRankElement);
// }

function addRanksToMatchpage(dictPlayerInfos) {
    for (let player of dictPlayerInfos) {
        let rankFactory = new RankFactory();
        let htmlRankElement = rankFactory.createMatchElement(player);

        for (let element = 0; element < document.getElementsByClassName(strOverviewClassName).length; element++){
            if (player.RiotID != "" 
            && 
            document
            .getElementsByClassName(strOverviewClassName)[element]
            .getElementsByClassName(strGameAccountClassName)[0].innerText.includes(player.RiotID)) 
            {
                document.getElementsByClassName(strOverviewClassName)[element].appendChild(htmlRankElement);
            }
            else if (player.RiotID == "" 
            && 
            document
            .getElementsByClassName(strOverviewClassName)[element]
            .getElementsByClassName(strGameAccountClassName)[0].innerText == player.RiotID) 
            {
                document.getElementsByClassName(strOverviewClassName)[element].appendChild(htmlRankElement);
            }
        }
    }
}