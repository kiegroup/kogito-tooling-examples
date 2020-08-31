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
import { useCallback, useRef, useState } from "react";
import { Nav, NavItem, NavList, Page, PageSection, Title } from "@patternfly/react-core";
import { EmbeddedTodoList } from "../todolist/embedded";
import { TodoListApi } from "../todolist/api";

export function TodoListPage() {
  const todoListRef = useRef<TodoListApi>(null);

  const [newItem, setNewItem] = useState("");

  const addItem = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      todoListRef.current?.addItem(newItem);
      setNewItem("");
    },
    [newItem]
  );

  return (
    <Page>
      <div style={{ display: "flex", height: "100%" }}>
        <div>
          <Nav style={{ backgroundColor: "rgb(24, 24, 24)", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Title style={{ color: "white", padding: "20px" }} headingLevel="h3" size="xl">
                Actions
              </Title>
            </div>
            <NavList>
              <NavItem onClick={todoListRef.current?.markAllAsCompleted}>Mark all as completed</NavItem>
              <NavItem>
                <form onSubmit={addItem}>
                  <input
                    type={"text"}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={"New item"}
                  />
                  <button>Add</button>
                </form>
              </NavItem>
            </NavList>
          </Nav>
        </div>

        <PageSection>
          <EmbeddedTodoList
            ref={todoListRef}
            targetOrigin={window.location.origin}
            envelopePath={"/envelope/todo-list.html"}
            todoList__itemRemoved={(item) => window.alert(`Item '${item}' removed successfully!`)}
          />
        </PageSection>
      </div>
    </Page>
  );
}
