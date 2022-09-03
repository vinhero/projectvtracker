export class PlayerInfo {
    
    /**
     * {
     * "status":200,
     *  "data":{
     *      "currenttier":24,
     *      "currenttierpatched":"Immortal 1",
     *      "images":{
     *          "small":"https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/smallicon.png",
     *          "large":"https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/largeicon.png",
     *          "triangle_down":"https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/ranktriangledownicon.png",
     *          "triangle_up":"https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/ranktriangleupicon.png"
     *      },
     *      "ranking_in_tier":33,
     *      "mmr_change_to_last_game":-11,
     *      "elo":2133,
     *      "name":"vinhero",
     *      "tag":"GAIN",
     *      "old":false
     *  }
     * }
     */
    
    constructor(jsonData) {
        this.RiotID = `${jsonData.data.name}#${jsonData.data.tag}`;
        this.RankImg = jsonData.data.images.large;
        this.RankName = jsonData.data.currenttierpatched;
        this.Elo = jsonData.data.elo;
        this.ProfileName = "";
    }

}