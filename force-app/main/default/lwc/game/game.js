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
    return this.rolls[frameIdx] + (this.rolls[frameIdx + 1] ?? 0) === 10;
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

  score() {
    let score = 0;
    let frameIdx = 0;
    this.frames = [];
    [...Array(10)].forEach((f, idx) => {
      const left = this.firstRoll(frameIdx);
      const right = this.secondRoll(frameIdx);
      const next = this.nextRoll(frameIdx);
      if (this.isStrike(frameIdx)) {
        score += 10 + right + next;
        this.updateFrames(idx, "", "X", score, next);
        frameIdx++;
      } else if (this.isSpare(frameIdx)) {
        score += 10 + next;
        this.updateFrames(idx, left, "/", score, next);
        frameIdx += 2;
      } else {
        score += left + right;
        this.updateFrames(idx, left, right, score, next);
        frameIdx += 2;
      }
    });
    return score;
  }

  rollBall(event) {
    const { value: pins } = event.target;
    this.rolls[this.currentRoll++] = pins;
    console.log(JSON.stringify(this.rolls));
    this.totalScore = this.score();
  }

  updateFrames(idx, leftScore, rightScore, totalScore, nextScore) {
    if (idx < 9) {
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
          JSON.stringify({ idx, leftScore, rightScore, totalScore, nextScore })
        )
      );
      this.frames.push({
        frameNumber: idx + 1,
        leftScore: leftScore === "" ? "X" : leftScore,
        rightScore,
        // if score is NaN then pass cumulative as undefined so that score won't be visible in frame
        totalScore: totalScore || undefined,
        tenthFrameScore:
          nextScore === 10
            ? "X"
            : leftScore === 10 || leftScore + rightScore === 10
            ? nextScore
            : ""
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
