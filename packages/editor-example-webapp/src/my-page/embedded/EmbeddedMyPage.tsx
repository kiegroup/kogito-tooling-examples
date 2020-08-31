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
import { MyPageMapping } from "../channel";
import { MyPageApi, MyPageChannelApi, MyPageEnvelopeApi } from "../api";
import { EmbeddedEnvelopeFactory } from "../../copied-from-kogito-tooling/EmbeddedEnvelopeFactory";
import { EnvelopeServer } from "@kogito-tooling/envelope-bus/dist/channel";

interface Props {
  mapping: MyPageMapping;
  targetOrigin: string;
}

export const EmbeddedMyPage = React.forwardRef((props: Props, forwardedRef: React.Ref<MyPageApi>) => {
  const refDelegate = useCallback(
    (envelopeServer): MyPageApi => ({
      setText: (text) => envelopeServer.client.notify("myPage__setText", text),
    }),
    []
  );

  const pollInit = useCallback((envelopeServer: EnvelopeServer<MyPageChannelApi, MyPageEnvelopeApi>) => {
    return envelopeServer.client.request(
      "myPage__init",
      { origin: envelopeServer.origin, envelopeServerId: envelopeServer.id },
      { backendUrl: "https://localhost:8000" }
    );
  }, []);

  const EmbeddedEnvelope = useMemo(() => {
    return EmbeddedEnvelopeFactory({
      api: {},
      envelopePath: props.mapping.envelopePath,
      origin: props.targetOrigin,
      refDelegate,
      pollInit,
    });
  }, []);

  return <EmbeddedEnvelope ref={forwardedRef} />;
});
