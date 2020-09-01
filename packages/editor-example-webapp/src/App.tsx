import "@patternfly/patternfly/base/patternfly-variables.css";
import "@patternfly/patternfly/patternfly-addons.scss";
import "@patternfly/patternfly/patternfly.scss";
import * as React from "react";
import { Brand, Page, PageHeader, Nav, NavList, NavItem } from "@patternfly/react-core";
import { Switch, Route, HashRouter as Router, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Base64PngPage } from "./Editors/Base64PngPage";
import { BpmnPage } from "./Editors/BpmnPage";
import { DmnPage } from "./Editors/DmnPage";
import { TodoListPage } from "./Editors/TodoListPage";
import { Home } from "./Home";

enum Location {
  BPMN = "/editor/bpmn",
  DMN = "/editor/dmn",
  BASE46PNG = "/editor/base64png",
  TODO_LIST = "/page/todo-list",
  HOME = "/"
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
            <TodoListPage />
          </Route>
        </Switch>
      </Page>
    </Router>
  );
}
