/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

import * as React from "react";
import { Editor, KogitoEditorEnvelopeContextType } from "@kogito-tooling/editor/dist/api";
import { SimpleReactEditor } from "./SimpleReactEditor";

export class SimpleReactEditorInterface implements Editor {
  private self: SimpleReactEditor;
  public af_isReact = true;
  public af_componentId: "txt-editor";
  public af_componentTitle: "Txt Editor";

  constructor(private readonly envelopeContext: KogitoEditorEnvelopeContextType) {
  }

  public getContent(): Promise<string> {
    return this.self.getContent();
  }

  public async getElementPosition(selector: string) {
    return Promise.resolve(undefined);
  }

  public setContent(path: string, content: string): Promise<void> {
    return this.self.setContent(content);
  }

  public getPreview(): Promise<string | undefined> {
    return this.self.getPreview();
  }

  public async undo(): Promise<void> {
    //Place holder until StateControl is added for React based components.
  }

  public async redo(): Promise<void> {
    //Place holder until StateControl is added for React based components.
  }

  public af_componentRoot() {
    return <SimpleReactEditor exposing={s => (this.self = s)} channelApi={this.envelopeContext.channelApi} />;
  }
}
