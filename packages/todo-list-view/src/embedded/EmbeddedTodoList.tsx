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
import { useCallback, useMemo } from "react";
import { EmbeddedEnvelopeFactory } from "../__copied-from-kogito-tooling/EmbeddedEnvelopeFactory";
import { EnvelopeServer } from "@kogito-tooling/envelope-bus/dist/channel";
import { TodoListApi, TodoListChannelApi, TodoListEnvelopeApi } from "../api";

export type Props = TodoListChannelApi & {
  targetOrigin: string;
  envelopePath: string;
};

export const EmbeddedTodoList = React.forwardRef((props: Props, forwardedRef: React.Ref<TodoListApi>) => {
  const refDelegate = useCallback(
    (envelopeServer): TodoListApi => ({
      addItem: (item) => envelopeServer.client.request("todoList__addItem", item),
      getItems: () => envelopeServer.client.request("todoList__getItems"),
      markAllAsCompleted: () => envelopeServer.client.notify("todoList__markAllAsCompleted"),
    }),
    []
  );

  const pollInit = useCallback((envelopeServer: EnvelopeServer<TodoListChannelApi, TodoListEnvelopeApi>) => {
    return envelopeServer.client.request(
      "todoList__init",
      {
        origin: envelopeServer.origin,
        envelopeServerId: envelopeServer.id,
      },
      { user: "Tiago" }
    );
  }, []);

  const EmbeddedEnvelope = useMemo(() => {
    return EmbeddedEnvelopeFactory({
      api: props,
      envelopePath: props.envelopePath,
      origin: props.targetOrigin,
      refDelegate,
      pollInit,
    });
  }, []);

  return <EmbeddedEnvelope ref={forwardedRef} />;
});
