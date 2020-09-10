/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
