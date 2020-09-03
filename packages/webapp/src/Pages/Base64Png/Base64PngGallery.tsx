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
import { useCallback, useEffect, useState } from "react";
import { Nav, NavItem, Title, Card, NavList } from "@patternfly/react-core";
import { File } from "@kogito-tooling/editor/dist/embedded";

const samplePaths = [
  { fileName: "sample", path: "examples/sample.base64png" },
  { fileName: "luiz", path: "examples/luiz.base64png" },
  { fileName: "tiago", path: "examples/tiago.base64png" },
];

/**
 * A gallery component with samples to be opened
 *
 * @param props
 * @constructor
 */
export function Base64PngGallery(props: { setFile: React.Dispatch<File> }) {
  // Set the chosen file
  const openSample = useCallback((fileName: string, filePath: string) => {
    props.setFile({
      isReadOnly: false,
      fileExtension: "base64png",
      fileName: fileName,
      getFileContents: () => fetch(filePath).then((response) => response.text()),
    });
  }, []);

  const [images, setImages] = useState<{ name: string; content: string; path: string }[]>([]);
  useEffect(() => {
    Promise.all(
      samplePaths.map(({ fileName, path }) =>
        fetch(path)
          .then((response) => response.text())
          .then((content) => ({ name: fileName, content: content, path }))
      )
    ).then((samples) => setImages([...images, ...samples]));
  }, []);

  return (
    <div>
      <Nav style={{ backgroundColor: "rgb(24, 24, 24)", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Title style={{ color: "white", padding: "20px" }} headingLevel="h3" size="xl">
            Gallery
          </Title>
        </div>
        <NavList>
          {images.map((image) => (
            <NavItem
              key={image.name}
              style={{ display: "flex", alignItems: "center" }}
              onClick={() => openSample(image.name, image.path)}
            >
              <Card style={{ width: "200px" }}>
                <img alt={image.name} src={`data:image/png;base64,${image.content}`} />
              </Card>
            </NavItem>
          ))}
        </NavList>
      </Nav>
    </div>
  );
}
