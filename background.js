// require
const fetch = require("node-fetch");

// Blocks of URL that is scraped
// website + area + [player] + settings
const website = "https://tracker.gg/valorant/"
const area = "profile/riot/"
const filtersettings = "/overview?playlist=competitive&season=all"

// function to get the raw data
const getRawData = (URL) => {
   return fetch(URL)
      .then((response) => response.text())
      .then((data) => {
         return data;
      });
};

// start of the program
const getCricketWorldCupsList = async () => {
   const cricketWorldCupRawData = await getRawData(URL);
   console.log(cricketWorldCupRawData);
};

function buildPlayer(strPlayerName, strPlayerTag){
    
    return strPlayerName.replace(' ', '%20') + strPlayerTag.replace('#', '%23');
}

function getPlayerRank(strPlayerName, strPlayerTag){
    var playerurl = website + area + buildPlayer(strPlayerName, strPlayerTag) + filtersettings;
    console.log(playerurl);
    
    const playersite = getRawData(playerurl);
    console.log(playersite);
}

// invoking the main function
getPlayerRank("vinhero", "#GAIN");