// step 1 - build the main logic to calculate the score
// step 2 - build the UI to show details
// step 3 - integrate the score with UI
// step 4 - handle 10th frame 3rd roll
// step 5 - implement standing pins logic
// step 6 - store the game score in salesforce object
// step 7 - load the game scores from salesforce objects
// step 8 - implement new game logic
// step 9 - refactoring

import { api, LightningElement, track } from "lwc";
import getExistingPlayer from "@salesforce/apex/GameService.getExistingPlayer";
import { NavigationMixin } from "lightning/navigation";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class Game extends NavigationMixin(LightningElement) {
  @api playerName;

  //reactive properties
  message;
  standingPins = 11;
  showGoToHome = false;

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

  // method to check if there was spare in the frame
  isSpare(frameIdx) {
    if (this.rolls[frameIdx + 1] === undefined) {
      return undefined;
    }
    return this.rolls[frameIdx] + this.rolls[frameIdx + 1] === 10;
  }

  // method to check if the roll was a strike
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

      //update the standing pins
      if (left) {
        this.updateStandingPins(left, right);
      }

      //calculate scores for each frame

      if (this.isStrike(frameIdx)) {
        //A strike frame is scored by adding ten, plus the number of pins knocked down by the next two balls, to the score of the previous frame.
        score += 10 + right + next;
        this.updateFrames(idx, "", "X", score, frameIdx);
        frameIdx++;
      } else if (this.isSpare(frameIdx)) {
        //A spare frame is scored by adding ten, plus the number of pins knocked down by the next ball, to the score of the previous frame.
        score += 10 + next;
        this.updateFrames(idx, left, "/", score, frameIdx);
        frameIdx += 2;
      } else {
        //Otherwise, a frame is scored by adding the number of pins knocked down by the two balls in the frame to the score of the previous frame.
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

  // method to roll ball and update pins, frames
  rollBall(event) {
    const { value: pins } = event.target;
    this.rolls[this.currentRoll++] = pins;
    this.updateScores();
    this.checkIfGameIsFinished();
  }

  // method to update standing pins
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
      // If a strike is thrown in the tenth frame, then the player may throw two more balls to complete the score of the strike.
      // Likewise, if a spare is thrown in the tenth frame, the player may throw one more ball to complete the score of the spare.
      // Thus the tenth frame may have three balls instead of two.
      const scoreLeft =
        this.firstRoll(frameIdx) === 10 ? "X" : this.firstRoll(frameIdx);
      const scoreRight =
        this.secondRoll(frameIdx) === 10
          ? "X"
          : this.isSpare(frameIdx)
          ? "/"
          : this.secondRoll(frameIdx);
      let extraScore;
      if (this.nextRoll(frameIdx) === 10) {
        extraScore = "X";
      } else if (
        this.firstRoll(frameIdx) === 10 ||
        this.firstRoll(frameIdx) + this.secondRoll(frameIdx) === 10
      ) {
        extraScore = this.nextRoll(frameIdx);
      } else {
        extraScore = "";
      }
      this.frames.push({
        frameNumber: idx + 1,
        leftScore: scoreLeft,
        rightScore: scoreRight,
        // if score is NaN then pass cumulative as undefined so that score won't be visible in frame
        totalScore,
        tenthFrameScore: extraScore
      });
    }
  }

  async checkIfGameIsFinished() {
    //get the last frame
    const { leftScore, rightScore, tenthFrameScore } = this.frames.find(
      (frame) => {
        return frame.frameNumber === 10;
      }
    );

    // check if tenthFrameScore is present, if not then check if left and right score is not more than 10
    if (
      tenthFrameScore ||
      (leftScore && rightScore && leftScore + rightScore < 10)
    ) {
      this.standingPins = 0;
      await this.finishGame();
    }
  }

  //fire event to refresh scoreboard
  refreshScoreboard() {
    this.dispatchEvent(new CustomEvent("refresh"));
    this.showGoToHome = true;
  }

  // save current game in database
  async finishGame() {
    try {
      this.message = "Saving game to the database...";
      const playerInfo = await getExistingPlayer({ name: this.playerName });
      if (playerInfo) {
        await this.saveGame(playerInfo);
      } else {
        await this.createNewPlayer();
      }
      this.message = "Game successfully saved!";
      this.refreshScoreboard();
    } catch (e) {
      this.message = `Oops! There was an unexpected issue while saving the game ${e.message}`;
    }
  }

  // save current game in salesforce
  async saveGame(playerInfo) {
    try {
      const { Id: playerId } = playerInfo;
      const payload = {
        Player__c: playerId,
        Total_Score__c: String(this.totalScore)
      };
      await createRecord({
        apiName: "Bowling_Game__c",
        fields: payload
      });
    } catch (error) {
      const event = new ShowToastEvent({
        title: "Something went wrong while saving the game",
        message: error.message
      });
      this.dispatchEvent(event);
    }
  }

  // create new player and save same
  async createNewPlayer() {
    try {
      const newPlayer = await createRecord({
        apiName: "Contact",
        fields: { LastName: this.playerName }
      });
      await this.saveGame({ Id: newPlayer.id });
    } catch (error) {
      const event = new ShowToastEvent({
        title: "Something went wrong while saving the game",
        message: error.message
      });
      this.dispatchEvent(event);
    }
  }

  //navigate user to home screen for a new game
  goToHome() {
    this[NavigationMixin.Navigate]({
      type: "standard__navItemPage",
      attributes: {
        apiName: "flair_Bowling_Alley"
      }
    });
  }
}
