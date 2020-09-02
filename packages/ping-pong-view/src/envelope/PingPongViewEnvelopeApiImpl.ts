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

import { Association, PingPongViewChannelApi, PingPongViewEnvelopeApi, PingPongViewInitArgs } from "../api";
import { EnvelopeApiFactoryArgs } from "@kogito-tooling/envelope";
import { PingPongViewApi } from "./PingPongViewEnvelopeView";
import { PingPongViewEnvelopeContext } from "./PingPongViewEnvelopeContext";
import { PingPongViewFactory } from "./PingPongViewFactory";

export class PingPongViewEnvelopeApiImpl implements PingPongViewEnvelopeApi {
  constructor(
    private readonly args: EnvelopeApiFactoryArgs<
      PingPongViewEnvelopeApi,
      PingPongViewChannelApi,
      PingPongViewApi,
      PingPongViewEnvelopeContext
    >,
    private readonly pingPongPageFactory: PingPongViewFactory
  ) {}

  public async pingPongView__init(association: Association, initArgs: PingPongViewInitArgs) {
    this.args.envelopeBusController.associate(association.origin, association.envelopeServerId);
    const page = this.pingPongPageFactory.create(initArgs, this.args.envelopeBusController.client);
    await this.args.view.setPage(page);
  }
}
