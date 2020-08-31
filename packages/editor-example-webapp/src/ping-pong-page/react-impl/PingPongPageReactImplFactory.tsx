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

import { PingPongPageApi, PingPongPageChannelApi, PingPongPageInitArgs } from "../api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import * as React from "react";
import { PingPongPageReactImpl } from "./PingPongPageReactImpl";
import { PingPongPage, PingPongPageFactory } from "../envelope";

export class PingPongPageReactImplFactory implements PingPongPageFactory {
  public create(initArgs: PingPongPageInitArgs, channelApi: MessageBusClient<PingPongPageChannelApi>) {
    const ref = React.createRef<PingPongPageApi>();
    return {
      reactComponent: () => {
        return <PingPongPageReactImpl initArgs={initArgs} channelApi={channelApi} ref={ref} />;
      },
    } as PingPongPage;
  }
}
