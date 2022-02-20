import { LightningElement } from "lwc";

export default class Modal extends LightningElement {
  playerName;

  closeModal() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  updatePlayerName(event) {
    this.playerName = event.target.value;
  }

  startGame() {
    this.dispatchEvent(
      new CustomEvent("start", {
        detail: {
          playerName: this.playerName
        }
      })
    );
  }
}