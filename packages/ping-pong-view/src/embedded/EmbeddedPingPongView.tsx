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
import { PingPongViewEnvelopeMapping } from "../channel";
import { PingPongViewApi, PingPongViewChannelApi, PingPongViewEnvelopeApi } from "../api";
import { EmbeddedEnvelopeFactory } from "../__copied-from-kogito-tooling/EmbeddedEnvelopeFactory";
import { EnvelopeServer } from "@kogito-tooling/envelope-bus/dist/channel";

export type Props = PingPongViewChannelApi & {
  mapping: PingPongViewEnvelopeMapping;
  targetOrigin: string;
  name: string;
};

export const EmbeddedPingPongView = React.forwardRef((props: Props, forwardedRef: React.Ref<PingPongViewApi>) => {
  const refDelegate = useCallback((envelopeServer): PingPongViewApi => ({}), []);

  const pollInit = useCallback((envelopeServer: EnvelopeServer<PingPongViewChannelApi, PingPongViewEnvelopeApi>) => {
    return envelopeServer.client.request(
      "pingPongView__init",
      { origin: envelopeServer.origin, envelopeServerId: envelopeServer.id },
      { name: props.name }
    );
  }, []);

  const EmbeddedEnvelope = useMemo(() => {
    return EmbeddedEnvelopeFactory({
      api: props,
      envelopePath: props.mapping.envelopePath,
      origin: props.targetOrigin,
      refDelegate,
      pollInit,
    });
  }, []);

  return <EmbeddedEnvelope ref={forwardedRef} />;
});
