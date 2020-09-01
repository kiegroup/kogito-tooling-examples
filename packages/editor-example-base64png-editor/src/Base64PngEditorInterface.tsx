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
import { Base64PngEditor } from "./Base64PngEditor";

/**
 * This class implements the Editor interface, a contract made by the Kogito Tooling that determines what methods an Editor needs to implement and what properties should be initialized.
 */
export class Base64PngEditorInterface implements Editor {
  private editorRef: React.RefObject<EditorApi>;
  public af_isReact = true;
  public af_componentId: "base64png-editor";
  public af_componentTitle: "Base64 PNG Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType,
    private readonly initArgs: EditorInitArgs
  ) {
    this.editorRef = React.createRef<EditorApi>();
  }

  /**
   * Retrieve the editor content
   */
  public getContent(): Promise<string> {
    return this.editorRef.current?.getContent()!;
  }

  /**
   * Retrieve the Guided Tour current position
   * @param selector
   */
  public getElementPosition(selector: string) {
    return this.editorRef.current?.getElementPosition(selector)!;
  }

  /**
   * Set the editor content
   * @param path file path
   * @param content file content
   */
  public setContent(path: string, content: string): Promise<void> {
    return this.editorRef.current?.setContent(path, content)!;
  }

  /**
   * Retrieve the SVG content of the Editor
   */
  public getPreview(): Promise<string | undefined> {
    return this.editorRef.current?.getPreview()!;
  }

  /**
   * Calls the editor undo method.
   */
  public undo(): Promise<void> {
    return this.editorRef.current?.undo()!;
  }

  /**
   * Calls the editor redo method.
   */
  public redo(): Promise<void> {
    return this.editorRef.current?.redo()!;
  }

  /**
   * Initialize the Editor component.
   */
  public af_componentRoot() {
    return <Base64PngEditor ref={this.editorRef} channelApi={this.envelopeContext.channelApi} initArgs={this.initArgs} />;
  }
}
