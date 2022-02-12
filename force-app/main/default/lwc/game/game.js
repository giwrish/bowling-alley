import { api, LightningElement, track } from "lwc";

export default class Game extends LightningElement {
  @api playerName;

  //reactive properties

  get pins() {
    return [...Array(11)].map((_, i) => i);
  }

  //reactive properties
  // to store all frames
  @track frames = [];

  //to store rolls
  currentRoll = 0;
  rolls = [];
  totalScore;

  isSpare(frameIdx) {
    return this.rolls[frameIdx] + (this.rolls[frameIdx + 1] ?? 0) === 10;
  }

  isStrike(frameIdx) {
    return this.rolls[frameIdx] === 10;
  }

  score() {
    let score = 0;
    let frameIdx = 0;
    [...Array(10)].forEach((f) => {
      if (this.isStrike(frameIdx)) {
        score +=
          10 +
          (this.rolls[frameIdx + 1] ?? 0) +
          (this.rolls[frameIdx + 2] ?? 0);
        frameIdx++;
      } else if (this.isSpare(frameIdx)) {
        score += 10 + (this.rolls[frameIdx + 2] ?? 0);
        frameIdx += 2;
      } else {
        score += (this.rolls[frameIdx] ?? 0) + (this.rolls[frameIdx + 1] ?? 0);
        frameIdx += 2;
      }
      console.log(`score after frame no ${frameIdx} is ${score}`);
    });
    return score;
  }

  rollBall(event) {
    const { value: pins } = event.target;
    this.rolls[this.currentRoll++] = pins;
    console.log(JSON.stringify(this.rolls));
    this.totalScore = this.score();
  }
}
