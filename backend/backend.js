// console.log("background");

async function fetchJSON(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        if (request.type == "enhanceMatch"){
            
            fetchJSON(("https://api.projectv.gg/api/v1/frontend/matches/" + request.matchID +"?expand=encounters.lineups.user.gameaccounts"))
            
            .then(response => {
                sendResponse(response);
            })
            
        }

        // async
        return true;
    }
  );