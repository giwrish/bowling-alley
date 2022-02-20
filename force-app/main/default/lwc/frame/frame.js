import { api, LightningElement } from "lwc";

export default class Frame extends LightningElement {
  @api frameNumber;
  @api leftScore;
  @api rightScore;
  @api tenthFrameScore;
  @api totalScore;

  _totalScore;
  get totalScore() {
    return isNaN(this._totalScore) ? "" : this._totalScore;
  }
  set totalScore(score) {
    this._totalScore = score;
  }

  get tenthFrameBox() {
    return this.frameNumber === 10;
  }

  get leftScoreClass() {
    return this.frameNumber === 10
      ? `slds-col slds-align_absolute-center slds-box slds-size_1-of-3`
      : `slds-col slds-align_absolute-center slds-size_1-of-2`;
  }

  get rightScoreClass() {
    return this.frameNumber === 10
      ? `slds-col slds-align_absolute-center slds-box slds-size_1-of-3`
      : `slds-col slds-align_absolute-center slds-box slds-size_1-of-2`;
  }
}