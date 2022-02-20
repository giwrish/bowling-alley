// Step 1 - build the main logic to calculate the score
// step 2 - build the UI to show details
// step 3 - integrate the score with UI
// step 4 - handle 10th frame 3rd roll
// step 5 - implement standing pins logic
// step 6 - store the game score in salesforce object
// step 7 - load the game score from salesforce objects

import { api, LightningElement, track } from "lwc";
import getExistingPlayer from "@salesforce/apex/GameService.getExistingPlayer";
import { createRecord } from "lightning/uiRecordApi";

export default class Game extends LightningElement {
  @api playerName;

  //reactive properties
  standingPins = 11;
  //create 11 pin from 0 to 10
  get pins() {
    return [...Array(this.standingPins)].map((_, i) => i);
  }

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

  async updateScores() {
    let score = 0;
    let frameIdx = 0;
    this.frames = [];
    [...Array(10)].forEach((f, idx) => {
      const left = this.firstRoll(frameIdx);
      const right = this.secondRoll(frameIdx);
      const next = this.nextRoll(frameIdx);

      //update the standing pins
      if (left) {
        this.updateStandingPins(left, right);
      }

      //calculate scores for each frame
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

      //calculate total score of the frame
      if (!isNaN(score)) {
        this.totalScore = score;
      }
    });
  }

  async rollBall(event) {
    const { value: pins } = event.target;
    this.rolls[this.currentRoll++] = pins;
    await this.updateScores();
    const { leftScore, rightScore, tenthFrameScore } = this.frames.find(
      (frame) => {
        return frame.frameNumber === 10;
      }
    );

    if (
      tenthFrameScore ||
      (leftScore && rightScore && leftScore + rightScore < 10)
    ) {
      this.finishGame();
      this.resetGame();
    }
  }

  resetGame() {
    this.dispatchEvent(new CustomEvent("reset"));
  }

  async finishGame() {
    const playerInfo = await getExistingPlayer({ name: this.playerName });
    if (playerInfo) {
      this.saveGame(playerInfo);
    } else {
      this.createNewPlayer();
    }
  }

  async createNewPlayer() {
    const newPlayer = await createRecord({
      apiName: "Contact",
      fields: { LastName: this.playerName }
    });
    this.saveGame({ Id: newPlayer.id });
  }

  async saveGame(playerInfo) {
    const { Id: playerId } = playerInfo;
    const payload = {
      Player__c: playerId,
      Total_Score__c: String(this.totalScore)
    };
    await createRecord({
      apiName: "Bowling_Game__c",
      fields: payload
    });
  }

  updateStandingPins(left, right) {
    this.standingPins = left === 10 || right !== undefined ? 11 : 11 - left;
  }

  updateFrames(idx, leftScore, rightScore, totalScore, frameIdx) {
    if (idx < 9) {
      this.frames.push({
        frameNumber: idx + 1,
        leftScore,
        rightScore,
        // if score is NaN then pass cumulative as undefined so that score won't be visible in frame
        totalScore: totalScore || undefined
      });
    } else {
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
