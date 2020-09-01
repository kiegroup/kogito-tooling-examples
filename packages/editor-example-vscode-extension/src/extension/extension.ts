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

import * as vscode from "vscode";
import * as KogitoVsCode from "@kogito-tooling/vscode-extension";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.info("Extension is alive.");

  KogitoVsCode.startExtension({
    extensionName: "kogito-tooling-examples.editor-example-vscode-extension",
    context: context,
    viewType: "kieKogitoWebviewSimpleEditors",
    getPreviewCommandId: "extension.kogito.getPreviewSvg",
    editorEnvelopeLocator: {
      targetOrigin: "vscode",
      mapping: new Map([
        [
          "base64png",
          {
            resourcesPathPrefix: `dist/`,
            envelopePath: `dist/base64png-editor-envelope/index.js`,
          },
        ],
      ]),
    },
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.kogito.createBase64Png", (file: { fsPath: string }) => {
      const buffer = fs.readFileSync(file.fsPath);
      const parsedPath = path.parse(file.fsPath);
      const base64FileName = `${parsedPath.name}${parsedPath.ext}.base64png`;
      const base64AbsoluteFilePath = path.join(parsedPath.dir, base64FileName);
      fs.writeFileSync(base64AbsoluteFilePath, buffer.toString("base64"));

      vscode.window.showInformationMessage("Generated the Base64 file with success!", "Open").then((selected) => {
        if (!selected) {
          return;
        }

        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(base64AbsoluteFilePath));
      });
    })
  );

  console.info("Extension is successfully setup.");
}

export function deactivate() {
  console.info("Extension is deactivating");
}
