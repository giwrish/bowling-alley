import { api, LightningElement, track } from "lwc";

export default class Game extends LightningElement {
  @api playerName;

  pins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  @track frames = [];

  currentFrame = 0;

  connectedCallback() {
    //push empty data in frames on new game
    this.frames = [...Array(10)].map((_, idx) => {
      return {
        frameNumber: idx + 1
      };
    });

    console.log(JSON.parse(JSON.stringify(this.frames)));
  }

  handleRoll(event) {
    //get current pin number
    const { value: pins } = event.target;
    this.frames[this.currentFrame++].leftScore = pins;
  }
}
