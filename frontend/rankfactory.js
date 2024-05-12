class RankFactory {
    constructor(strTrackerUrl, strTrackerSection) {
        this.strWidth = "90";
        this.strHeight = "90";
        this.strPaddingButtom = "10";
        this.strTagName = "IMG";
        this.strTrackerUrl = strTrackerUrl;
        this.strTrackerSection = strTrackerSection;
    }

    setupPlayerElement() {
        this.strWidth = "90";
        this.strHeight = "90";
        this.strPaddingButtom = "10";
        this.strTagName = "IMG";
    }

    setupMatchElement() {
        this.strWidth = "40";
        this.strHeight = "40";
        this.strPaddingButtom = "15";
        this.strTagName = "IMG";
    }

    createPlayerElement(player) {
        this.setupPlayerElement();
        return this.createHtmlRank(player);
    }

    createMatchElement(player) {
        this.setupMatchElement();
        return this.createHtmlRank(player);
    }

    createHtmlRank(player) {
        let strOnclick = `window.open(\'${this.strTrackerUrl}${player.RiotID.replaceAll('#', '%23')}/${this.strTrackerSection}\')`;
        let htmlRankElement = document.createElement(this.strTagName);

        htmlRankElement.src = player.RankImg;
        htmlRankElement.width = this.strWidth;
        htmlRankElement.height = this.strHeight;
        htmlRankElement.padding = this.strPaddingButtom;
        htmlRankElement.onClick = strOnclick;

        return htmlRankElement;
    }
}