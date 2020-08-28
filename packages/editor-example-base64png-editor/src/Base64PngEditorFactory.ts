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

import { EditorFactory, EditorInitArgs, KogitoEditorEnvelopeContextType } from "@kogito-tooling/editor/dist/api";
import { Base64PngEditorInterface } from "./Base64PngEditorInterface";

export class Base64PngEditorFactory implements EditorFactory {
  public supports(fileExtension: string) {
    return fileExtension === "base64png";
  }

  public createEditor(envelopeContext: KogitoEditorEnvelopeContextType, initArgs: EditorInitArgs) {
    return Promise.resolve(new Base64PngEditorInterface(envelopeContext, initArgs));
  }
}
