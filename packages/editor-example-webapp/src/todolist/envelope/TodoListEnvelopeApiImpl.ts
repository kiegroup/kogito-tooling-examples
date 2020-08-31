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

import { EnvelopeApiFactoryArgs } from "../../copied-from-kogito-tooling/EnvelopeApiFactory";
import { TodoListContext } from "./TodoListContext";
import { Association, TodoListChannelApi, TodoListEnvelopeApi, TodoListInitArgs } from "../api";
import { TodoListEnvelopeViewApi } from "./TodoListEnvelopeView";

export class TodoListEnvelopeApiImpl implements TodoListEnvelopeApi {
  constructor(
    private readonly args: EnvelopeApiFactoryArgs<
      TodoListEnvelopeApi,
      TodoListChannelApi,
      TodoListEnvelopeViewApi,
      TodoListContext
    >
  ) {}

  public async todoList__init(association: Association, initArgs: TodoListInitArgs) {
    this.args.envelopeBusController.associate(association.origin, association.envelopeServerId);
    this.args.view().setUser(initArgs.user);
  }

  public async todoList__addItem(item: string) {
    return this.args.view().addItem(item);
  }

  public async todoList__getItems() {
    return this.args.view().getItems();
  }

  public todoList__markAllAsCompleted() {
    this.args.view().markAllAsCompleted();
  }
}
