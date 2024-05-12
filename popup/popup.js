/**
 * TODO:
 * (high) Spielerränge anzeigen, selbst wenn das Spiel noch nicht angenommen wurde.
 * (high) kompatibel selbst wenn nicht 10 Spieler?
 * (high) Settings-Page
 * (high) schonmal angefragte spieler für die Sitzung speichern (reduktion der Anfragen),
 * 
 * (mid) verändertes aussehen der Matchpage
 * (mid) durchschnittliche Gegner elo?
 * (mid) Wenn man sich ein Team ansieht, Spieler mit Rank ausstatten
 * (mid) Ladesymbol
 * 
 * (low) Bilder zwischenspeichern?
 * (low) Durchschnitt Elo Team (Rank Icon?) (5 hightesrated)(ladderseite) (Loadingqueue)
 * 
 * (very low) Nationalität?
 * (very low) Filter nach Ingame MMR? (LadderSeite)
 */

var m_btnGetRanks = document.getElementById("btnGetRanks");

m_btnGetRanks.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: execRanks,
    });
});