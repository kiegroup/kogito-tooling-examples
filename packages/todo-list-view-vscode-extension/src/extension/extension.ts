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

import * as vscode from "vscode";
import {TodoListWebview} from "todo-list-view/dist/vscode";
import {TodoListEnvelopeApi} from "todo-list-view/dist/api";
import {MessageBusClient} from "@kogito-tooling/envelope-bus/dist/api";

const OPEN_TODO_LIST_VIEW_COMMAND_ID = "kogito-tooling-examples.todo-list-view";
const ADD_TODO_ITEM_COMMAND_ID = "kogito-tooling-examples.todo-list-view.add-item";
const MARK_ALL_AS_COMPLETED_COMMAND_ID = "kogito-tooling-examples.todo-list-view.mark-all-as-completed";

export function activate(context: vscode.ExtensionContext) {
  console.info("Extension is alive.");

  const todoListWebview = new TodoListWebview(
    context,
    {
      envelopePath: "dist/todo-list-view-envelope/index.js",
      title: "//TODO",
      targetOrigin: "vscode",
    },
    {
      todoList__itemRemoved: (item) => {
        vscode.window.showInformationMessage(`Item '${item}' successfully removed.`);
      },
    }
  );

  let envelopeApi: MessageBusClient<TodoListEnvelopeApi> | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_TODO_LIST_VIEW_COMMAND_ID, () => {
      envelopeApi = todoListWebview.open("todo-list-view", { onClose: () => (envelopeApi = undefined) });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(MARK_ALL_AS_COMPLETED_COMMAND_ID, () => {
      envelopeApi?.notify("todoList__markAllAsCompleted");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(ADD_TODO_ITEM_COMMAND_ID, async () => {
      const textEditor = vscode.window.activeTextEditor;
      if (!textEditor) {
        throw new Error("Can't find selection of non-existent Text Editor");
      }

      const selectedText = textEditor.document.getText(textEditor.selection);
      if (selectedText.length <= 0) {
        vscode.window.showErrorMessage(`Cannot add empty 'To do' item.`);
        return;
      }

      const items = selectedText.split("\n");

      if (envelopeApi) {
        addItems(items, envelopeApi);
        return;
      }

      const selected = await vscode.window.showInformationMessage(
        `'To do' list not open. Would you like to open it and add ${items.length} item(s)?`,
        "Yes!"
      );

      if (!selected) {
        return;
      }

      await vscode.commands.executeCommand(OPEN_TODO_LIST_VIEW_COMMAND_ID);
      addItems(items, envelopeApi);
    })
  );

  console.info("Extension is successfully setup.");
}

function addItems(items: string[], envelopeApi?: MessageBusClient<TodoListEnvelopeApi>) {
  for (const item of items) {
    envelopeApi?.request("todoList__addItem", item);
  }
}

export function deactivate() {
  console.info("Extension is deactivating");
}
