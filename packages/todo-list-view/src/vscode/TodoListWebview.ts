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
import { Uri, ViewColumn } from "vscode";
import { EnvelopeServer } from "@kogito-tooling/envelope-bus/dist/channel";
import { TodoListChannelApi, TodoListEnvelopeApi } from "../api";

export class TodoListWebview {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly envelopeLocator: {
      targetOrigin: string;
      title: string;
      envelopePath: string;
    },
    private readonly api: TodoListChannelApi
  ) {}

  public open(pageId: string, opts: { onClose: () => void }) {
    const webviewPanel = vscode.window.createWebviewPanel(pageId, this.envelopeLocator.title, ViewColumn.Beside, {
      retainContextWhenHidden: true,
      enableCommandUris: true,
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.context.extensionPath)],
    });

    const scriptSrc = webviewPanel.webview
      .asWebviewUri(Uri.file(this.context.asAbsolutePath(this.envelopeLocator.envelopePath)))
      .toString();

    webviewPanel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <style>
            html, body, div#envelope-app {
                margin: 0;
                border: 0;
                padding: 10px;
            }
          </style>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body>
        <div id="envelope-app" />
        <script src="${scriptSrc}"></script>
        </body>
        </html>`;

    const envelopeServer: EnvelopeServer<TodoListChannelApi, TodoListEnvelopeApi> = new EnvelopeServer(
      { postMessage: (message) => webviewPanel.webview.postMessage(message) },
      this.envelopeLocator.targetOrigin,
      () =>
        envelopeServer.client.request(
          "todoList__init",
          { origin: envelopeServer.origin, envelopeServerId: envelopeServer.id },
          { user: "Tiago" }
        )
    );

    this.context.subscriptions.push(
      webviewPanel.webview.onDidReceiveMessage(
        (msg) => envelopeServer.receive(msg, this.api),
        webviewPanel.webview,
        this.context.subscriptions
      )
    );

    webviewPanel.onDidDispose(
      () => {
        envelopeServer.stopInitPolling();
        opts.onClose();
      },
      webviewPanel.webview,
      this.context.subscriptions
    );

    envelopeServer.startInitPolling();
    return envelopeServer.client;
  }
}
