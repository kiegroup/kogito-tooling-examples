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
import { useMemo, useState } from "react";
import { Label, Nav, NavItem, NavList, Page, PageSection, Title } from "@patternfly/react-core";
import { EmbeddedPingPongView } from "ping-pong-view/dist/embedded";
import { PingPongViewChannelApi } from "ping-pong-view/dist/api";

let pings = 0;
let pongs = 0;

export function PingPongViewsPage() {
  const [lastPing, setLastPing] = useState<string>("-");
  const [lastPong, setLastPong] = useState<string>("-");

  const api: PingPongViewChannelApi = useMemo(() => {
    return {
      pingPongView__ping(source: string) {
        pings++;
        setLastPing(source);
      },
      pingPongView__pong(source: string, replyingTo: string) {
        pongs++;
        setLastPong(source);
      },
    };
  }, [pings, pongs]);

  return (
    <Page>
      <div style={{ display: "flex", height: "100%" }}>
        <div>
          <Nav style={{ backgroundColor: "rgb(24, 24, 24)", height: "100%", width: "300px" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Title style={{ color: "white", padding: "20px" }} headingLevel="h3" size="xl">
                Stats
              </Title>
            </div>
            <NavList>
              <NavItem>
                <div>
                  Pings: &nbsp;
                  <Label>{pings}</Label>
                </div>
              </NavItem>
              <NavItem>
                <div>
                  Pongs: &nbsp;
                  <Label>{pongs}</Label>
                </div>
              </NavItem>
              <NavItem>
                <div>
                  Last ping: &nbsp;
                  <Label>{lastPing}</Label>
                </div>
              </NavItem>
              <NavItem>
                <div>
                  Last pong: &nbsp;
                  <Label>{lastPong}</Label>
                </div>
              </NavItem>
            </NavList>
          </Nav>
        </div>

        <div style={{ display: "flex" }}>
          <PageSection>
            <EmbeddedPingPongView
              {...api}
              name={"React 1"}
              targetOrigin={window.location.origin}
              mapping={{ title: "Ping-Pong Page in React", envelopePath: "/envelope/ping-pong-view-react-impl.html" }}
            />
          </PageSection>

          <PageSection>
            <EmbeddedPingPongView
              {...api}
              name={"React 2"}
              targetOrigin={window.location.origin}
              mapping={{ title: "Ping-Pong Page in Vue", envelopePath: "/envelope/ping-pong-view-react-impl.html" }}
            />
          </PageSection>

          <PageSection>
            <EmbeddedPingPongView
              {...api}
              name={"React 3"}
              targetOrigin={window.location.origin}
              mapping={{ title: "Ping-Pong Page in Vue", envelopePath: "/envelope/ping-pong-view-react-impl.html" }}
            />
          </PageSection>
        </div>
      </div>
    </Page>
  );
}
