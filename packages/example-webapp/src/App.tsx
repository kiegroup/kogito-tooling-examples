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

import "@patternfly/patternfly/base/patternfly-variables.css";
import "@patternfly/patternfly/patternfly-addons.scss";
import "@patternfly/patternfly/patternfly.scss";
import * as React from "react";
import { useEffect, useState } from "react";
import { Brand, Nav, NavItem, NavList, Page, PageHeader } from "@patternfly/react-core";
import { HashRouter as Router, Link, Route, Switch } from "react-router-dom";
import { Base64PngPage } from "./Pages/Base64Png/Base64PngPage";
import { BpmnPage } from "./Pages/Gwt/BpmnPage";
import { DmnPage } from "./Pages/Gwt/DmnPage";
import { TodoListViewPage } from "./Pages/TodoListViewPage";
import { PingPongViewsPage } from "./Pages/PingPongViewsPage";
import { Home } from "./Home";

enum Location {
  BPMN = "/editor/bpmn",
  DMN = "/editor/dmn",
  BASE46PNG = "/editor/base64png",
  TODO_LIST = "/page/todo-list",
  PING_PONG_PAGES = "/page/my-custom-page-impls",
  HOME = "/",
}

export function App() {
  const [location, setLocation] = useState(Location.HOME);
  useEffect(() => {
    setLocation(window.location.hash.slice(1) as Location); //Remove trailing '#' from route to match the Location enum.
  });

  return (
    <Router>
      <Page
        header={
          <PageHeader
            logo={<Brand src={"logo.png"} alt="Logo" />}
            topNav={
              <Nav onSelect={e => setLocation(e.itemId as Location)} aria-label="Nav" variant="horizontal">
                <NavList>
                  <NavItem itemId={Location.HOME} isActive={location === Location.HOME}>
                    <Link to={Location.HOME}>Home</Link>
                  </NavItem>
                  <NavItem itemId={Location.BASE46PNG} isActive={location === Location.BASE46PNG}>
                    <Link to={Location.BASE46PNG}>Base64 PNG Editor</Link>
                  </NavItem>
                  <NavItem itemId={Location.BPMN} isActive={location === Location.BPMN}>
                    <Link to={Location.BPMN}>BPMN Editor</Link>
                  </NavItem>
                  <NavItem itemId={Location.DMN} isActive={location === Location.DMN}>
                    <Link to={Location.DMN}>DMN Editor</Link>
                  </NavItem>
                  <NavItem itemId={Location.TODO_LIST} isActive={location === Location.TODO_LIST}>
                    <Link to={Location.TODO_LIST}>'To do' list Page</Link>
                  </NavItem>
                  <NavItem itemId={Location.PING_PONG_PAGES} isActive={location === Location.PING_PONG_PAGES}>
                    <Link to={Location.PING_PONG_PAGES}>Ping-Pong Pages</Link>
                  </NavItem>
                </NavList>
              </Nav>
            }
          />
        }
      >
        <Switch>
          <Route exact={true} path={"/"}>
            <Home />
          </Route>
          <Route path={"/editor/base64png"}>
            <Base64PngPage />
          </Route>
          <Route path={"/editor/bpmn"}>
            <BpmnPage />
          </Route>
          <Route path={"/editor/dmn"}>
            <DmnPage />
          </Route>
          <Route path={Location.TODO_LIST}>
            <TodoListViewPage />
          </Route>
          <Route path={Location.PING_PONG_PAGES}>
            <PingPongViewsPage />
          </Route>
        </Switch>
      </Page>
    </Router>
  );
}