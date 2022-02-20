import { api, LightningElement, track } from "lwc";

export default class Game extends LightningElement {
  @api playerName;

  //reactive properties

  //create 11 pin from 0 to 10
  get pins() {
    return [...Array(11)].map((_, i) => i);
  }

  //reactive properties
  // to store all frames
  @track frames = [...Array(10)].map((_, idx) => {
    return {
      frameNumber: idx + 1
    };
  });

  //to store rolls
  currentRoll = 0;
  rolls = [];

  //cumulative score of the game
  totalScore;

  isSpare(frameIdx) {
    if (this.rolls[frameIdx + 1] === undefined) {
      return undefined;
    }
    return this.rolls[frameIdx] + this.rolls[frameIdx + 1] === 10;
  }

  isStrike(frameIdx) {
    return this.rolls[frameIdx] === 10;
  }

  firstRoll(frameIdx) {
    return this.rolls[frameIdx];
  }

  secondRoll(frameIdx) {
    return this.rolls[frameIdx + 1];
  }

  nextRoll(frameIdx) {
    return this.rolls[frameIdx + 2];
  }

  updateScores() {
    let score = 0;
    let frameIdx = 0;
    this.frames = [];
    [...Array(10)].forEach((f, idx) => {
      const left = this.firstRoll(frameIdx);
      const right = this.secondRoll(frameIdx);
      const next = this.nextRoll(frameIdx);
      if (this.isStrike(frameIdx)) {
        score += 10 + right + next;
        this.updateFrames(idx, "", "X", score, frameIdx);
        frameIdx++;
      } else if (this.isSpare(frameIdx)) {
        score += 10 + next;
        this.updateFrames(idx, left, "/", score, frameIdx);
        frameIdx += 2;
      } else {
        score += left + right;
        this.updateFrames(idx, left, right, score, frameIdx);
        frameIdx += 2;
      }
      if (!isNaN(score)) {
        this.totalScore = score;
      }
    });
  }

  rollBall(event) {
    const { value: pins } = event.target;
    this.rolls[this.currentRoll++] = pins;
    this.updateScores();
  }

  updateFrames(idx, leftScore, rightScore, totalScore, frameIdx) {
    if (idx < 9) {
      console.log(
        JSON.parse(
          JSON.stringify({
            idx,
            leftScore,
            rightScore,
            totalScore,
            frameIdx
          })
        )
      );
      this.frames.push({
        frameNumber: idx + 1,
        leftScore,
        rightScore,
        // if score is NaN then pass cumulative as undefined so that score won't be visible in frame
        totalScore: totalScore || undefined
      });
    } else {
      console.log(
        JSON.parse(
          JSON.stringify({
            idx,
            leftScore,
            rightScore,
            totalScore,
            frameIdx
          })
        )
      );
      const box1 =
        this.firstRoll(frameIdx) === 10 ? "X" : this.firstRoll(frameIdx);
      const box2 =
        this.secondRoll(frameIdx) === 10
          ? "X"
          : this.isSpare(frameIdx)
          ? "/"
          : this.secondRoll(frameIdx);
      let box3;
      if (this.nextRoll(frameIdx) === 10) {
        box3 = "X";
      } else if (
        this.firstRoll(frameIdx) === 10 ||
        this.firstRoll(frameIdx) + this.secondRoll(frameIdx) === 10
      ) {
        box3 = this.nextRoll(frameIdx);
      } else {
        box3 = "";
      }
      this.frames.push({
        frameNumber: idx + 1,
        leftScore: box1,
        rightScore: box2,
        // if score is NaN then pass cumulative as undefined so that score won't be visible in frame
        totalScore,
        tenthFrameScore: box3
      });
    }
  }
}

// Step 1 - build the main logic to calculate the score
// step 2 - build the UI to show details
// step 3 - integrate the score with UI
// step   - handle 10th frame 3rd roll
// step 4 - store the game score in salesforce object
// step 5 - load the game score from salesforce object
