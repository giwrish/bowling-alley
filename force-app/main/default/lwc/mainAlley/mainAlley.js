import { LightningElement } from "lwc";

export default class MainAlley extends LightningElement {
  playerName;

  showModal = false;
  loadNewGame = false;

  closeModal() {
    this.showModal = false;
  }

  startGame(e) {
    const { playerName } = e.detail;
    this.playerName = playerName;
    this.showModal = false;
    this.loadNewGame = true;
  }

  startNewGame() {
    this.showModal = true;
  }
}
