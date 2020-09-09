import { StateControl } from "@kogito-tooling/editor/dist/embedded";
import { KogitoEdit } from "@kogito-tooling/channel-common-api";

export interface Base64PngEdit extends KogitoEdit {
  id: string;
  filter: string;
  contrast: string;
  brightness: string;
  saturate: string;
  sepia: string;
  grayscale: string;
  invert: string;
}

export class Base64PngStateControl extends StateControl {
  getCurrentBase64PngEdit(): Base64PngEdit | undefined {
    const command = super.getCurrentCommand();
    if (command) {
      return JSON.parse(command) as Base64PngEdit;
    }
    return;
  }
}
