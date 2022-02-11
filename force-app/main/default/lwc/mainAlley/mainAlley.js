import { LightningElement } from "lwc";

export default class MainAlley extends LightningElement {
  playerName;
  startNewGame() {
    const name = prompt("Please enter player name");
    if (name) {
      this.playerName = name;
    }
  }
}
