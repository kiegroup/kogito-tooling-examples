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

import * as React from "react";
import { Editor, EditorApi, EditorInitArgs, KogitoEditorEnvelopeContextType } from "@kogito-tooling/editor/dist/api";
import { ReactEditor } from "./SimpleReactEditor";

export class SimpleReactEditorInterface implements Editor {
  private editorRef: React.RefObject<EditorApi>;
  public af_isReact = true;
  public af_componentId: "txt-editor";
  public af_componentTitle: "Txt Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType,
    private readonly initArgs: EditorInitArgs
  ) {
    this.editorRef = React.createRef<EditorApi>();
  }

  public getContent(): Promise<string> {
    return this.editorRef.current?.getContent()!;
  }

  public getElementPosition(selector: string) {
    return this.editorRef.current?.getElementPosition(selector)!;
  }

  public setContent(path: string, content: string): Promise<void> {
    return this.editorRef.current?.setContent(path, content)!;
  }

  public getPreview(): Promise<string | undefined> {
    return this.editorRef.current?.getPreview()!;
  }

  public undo(): Promise<void> {
    return this.editorRef.current?.undo()!;
  }

  public redo(): Promise<void> {
    return this.editorRef.current?.redo()!;
  }

  public af_componentRoot() {
    return <ReactEditor ref={this.editorRef} channelApi={this.envelopeContext.channelApi} initArgs={this.initArgs} />;
  }
}
