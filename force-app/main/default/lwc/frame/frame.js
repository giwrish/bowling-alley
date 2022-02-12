import { api, LightningElement } from "lwc";

export default class Frame extends LightningElement {
  @api frameNumber;
  @api leftScore;
  @api rightScore;
  @api tenthFrameScore;
  @api totalScore;
}
