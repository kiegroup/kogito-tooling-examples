import * as React from "react";
import { List, ListItem, ListComponent, OrderType, Page, PageSection, TextContent, Text } from "@patternfly/react-core";

export function Home() {
  return (
    <Page>
      <PageSection>
        <TextContent>
          <Text component={"h1"}>Welcome to Kogito Tooling Examples</Text>
          <Text component={"p"}>
            To understand what's in this webapp, please refer to the project README on GitHub
          </Text>
        </TextContent>
      </PageSection>
    </Page>
  );
}
