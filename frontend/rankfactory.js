class RankFactory {
    constructor() {
        this.strWidth = "90";
        this.strHeight = "90";
        this.strPaddingButtom = "10";
        this.strTagName = "IMG";
        this.strTrackerUrl = "https://tracker.gg/valorant/profile/riot/";
        this.strTrackerSection = "/overview";
    }

    setupPlayerElement() {
        this.strWidth = "90";
        this.strHeight = "90";
        this.strPaddingButtom = "10";
        this.strTagName = "IMG";
    }

    setupMatchElement() {
        this.strActualHeight = "40";
        this.strActualWidth = "40";
        this.strWidth = "20px";
        this.strHeight = "20px";
        this.strMargin = "10px";
        this.strMarginTop = "42px";
        this.strPaddingButtom = "15";
        this.strTagName = "IMG";
        this.strPosition = "absolute";
    }
    
    createHtmlRank(player) {
        let strOnclick = `window.open(\'${this.strTrackerUrl}${player.RiotID.replaceAll('#', '%23')}/${this.strTrackerSection}\')`;
        let htmlRankElement = document.createElement(this.strTagName);
        
        // Set Attributes
        htmlRankElement.width = this.strActualWidth;
        htmlRankElement.height = this.strActualHeight;
        htmlRankElement.style.width = this.strWidth; 
        htmlRankElement.style.height = this.strHeight;
        htmlRankElement.style.margin = this.strMargin;
        htmlRankElement.style.marginTop = this.strMarginTop;
        htmlRankElement.style.paddingBottom = this.strPaddingButtom;
        htmlRankElement.style.position = this.strPosition;
        htmlRankElement.style.zIndex = "1000";
        
        htmlRankElement.src = player.RankImg;
        htmlRankElement.onClick = strOnclick;
        
        return htmlRankElement;
    }

    createPlayerElement(player) {
        this.setupPlayerElement();
        return this.createHtmlRank(player);
    }

    createMatchElement(player) {
        this.setupMatchElement();
        return this.createHtmlRank(player);
    }
}