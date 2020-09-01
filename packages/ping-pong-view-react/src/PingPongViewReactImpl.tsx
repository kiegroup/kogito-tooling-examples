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
import { useCallback, useImperativeHandle, useMemo } from "react";
import { PingPongViewApi, PingPongViewChannelApi, PingPongViewInitArgs } from "ping-pong-view/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import { useSubscription } from "@kogito-tooling/envelope-bus/dist/hooks";

interface Props {
  initArgs: PingPongViewInitArgs;
  channelApi: MessageBusClient<PingPongViewChannelApi>;
}

export const PingPongViewReactImpl = React.forwardRef<PingPongViewApi, Props>((props, forwardedRef) => {
  const pingPongViewApi: PingPongViewApi = useMemo(() => ({}), []);
  useImperativeHandle(forwardedRef, () => pingPongViewApi, [pingPongViewApi]);

  const ping = useCallback(() => {
    props.channelApi.notify("pingPongView__ping", props.initArgs.name);
  }, []);

  useSubscription(props.channelApi, "pingPongView__ping", (pingSource) => {
    if (pingSource === props.initArgs.name) {
      return;
    }

    console.info(`${props.initArgs.name} says: Ping from '${pingSource}' received.`);
    props.channelApi.notify("pingPongView__pong", props.initArgs.name, pingSource);
  });

  useSubscription(props.channelApi, "pingPongView__pong", (pongSource, replyingTo) => {
    if (pongSource === props.initArgs.name || replyingTo !== props.initArgs.name) {
      return;
    }

    console.info(`${props.initArgs.name} says: Pong from '${pongSource}' received.`);
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px",
          backgroundColor: "#292d34",
          color: "rgb(96,210,243)",
        }}
      >
        <span>Hello from React!</span>
        <button onClick={ping}>Ping others!</button>
      </div>
      <p><i>#{props.initArgs.name}</i></p>
      <div style={{ padding: "10px" }}>
        <p>.</p>
        <p>.</p>
        <p>.</p>
      </div>
    </>
  );
});
