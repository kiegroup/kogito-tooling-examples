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

import { EnvelopeBus } from "@kogito-tooling/envelope-bus/dist/api";
import { Envelope } from "../__copied-from-kogito-tooling/Envelope";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TodoListContext } from "./TodoListContext";
import { TodoListEnvelopeApiImpl } from "./TodoListEnvelopeApiImpl";
import { TodoListChannelApi, TodoListEnvelopeApi } from "../api";
import { TodoListEnvelopeView, TodoListEnvelopeViewApi } from "./TodoListEnvelopeView";

export function init(args: { container: HTMLElement; bus: EnvelopeBus }) {
  const context = {};

  const envelope = new Envelope<TodoListEnvelopeApi, TodoListChannelApi, TodoListEnvelopeViewApi, TodoListContext>(
    args.bus
  );

  const pageEnvelopeViewDelegate = async () => {
    const ref = React.createRef<TodoListEnvelopeViewApi>();
    return new Promise<() => TodoListEnvelopeViewApi>((res) =>
      ReactDOM.render(<TodoListEnvelopeView ref={ref} channelApi={envelope.channelApi} />, args.container, () =>
        res(() => ref.current!)
      )
    );
  };

  return envelope.start(pageEnvelopeViewDelegate, context, {
    create: (apiFactoryArgs) => new TodoListEnvelopeApiImpl(apiFactoryArgs),
  });
}