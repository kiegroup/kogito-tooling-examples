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
import { TodoListWebview } from "todo-list-view/dist/vscode";
import { TodoListEnvelopeApi } from "todo-list-view/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";

const openTodoListViewCommandId = "kogito-tooling-examples.todo-list-view";
const addTodoItemCommandId = "kogito-tooling-examples.todo-list-view.add-item";
const markAllAsCompletedCommandId = "kogito-tooling-examples.todo-list-view.mark-all-as-completed";

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
    vscode.commands.registerCommand(openTodoListViewCommandId, () => {
      envelopeApi = todoListWebview.open("todo-list-view", { onClose: () => (envelopeApi = undefined) });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(markAllAsCompletedCommandId, () => {
      envelopeApi?.notify("todoList__markAllAsCompleted");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(addTodoItemCommandId, async () => {
      const textEditor = vscode.window.activeTextEditor;
      if (!textEditor) {
        throw new Error("Can't find selection of non-existent Text Editor");
      }

      const selection = textEditor.selection;
      const selectedText = textEditor.document.getText(selection);
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

      await vscode.commands.executeCommand(openTodoListViewCommandId);
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
