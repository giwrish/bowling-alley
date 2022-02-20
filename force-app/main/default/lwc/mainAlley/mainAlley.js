import { LightningElement, track } from "lwc";
import getPreviousScores from "@salesforce/apex/GameService.getPreviousScores";
export default class MainAlley extends LightningElement {
  playerName;

  showModal = false;
  loadNewGame = false;
  showNewGameButton = true;
  loadScoreBoard = false;

  columns = [
    { label: "Player", fieldName: "player" },
    { label: "Game", fieldName: "game" },
    { label: "Total Score", fieldName: "score" }
  ];

  @track data = [];

  async connectedCallback() {
    const previousScores = await getPreviousScores();
    previousScores.forEach((score) => {
      this.data.push({
        player: score.Player__r.Name,
        game: score.Name,
        score: score.Total_Score__c
      });
    });
    console.log(JSON.parse(JSON.stringify(this.data)));
    this.loadScoreBoard = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async startGame(e) {
    const { playerName } = e.detail;
    this.playerName = playerName;
    this.showModal = false;
    this.loadNewGame = true;
    this.showNewGameButton = false;
  }

  startNewGame() {
    this.showModal = true;
  }

  handleReset() {
    this.showNewGameButton = true;
  }
}
