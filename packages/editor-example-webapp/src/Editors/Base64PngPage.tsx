import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor } from "../copied-from-kogito-tooling/EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Nav, NavItem, Title, Card, NavList } from "@patternfly/react-core";
import { File } from "@kogito-tooling/editor/dist/embedded";

const samplePaths = [
  { fileName: "sample", path: "examples/sample.base64png" },
  { fileName: "luiz", path: "examples/luiz.base64png" },
  { fileName: "tiago", path: "examples/tiago.base64png" }
];

export function Base64PngPage() {
  // Empty file
  const [file, setFile] = useState<File>({
    fileName: "file",
    fileExtension: "base64png",
    getFileContents: () => Promise.resolve(""),
    isReadOnly: false
  });

  // Set the chosen file
  const openSample = useCallback((fileName: string, filePath: string) => {
    setFile({
      isReadOnly: false,
      fileExtension: "base64png",
      fileName: fileName,
      getFileContents: () => fetch(filePath).then(response => response.text())
    });
  }, []);

  // Determine the file extension and the envelope path to the EmbeddedEditor component.
  const editorEnvelopeLocator: EditorEnvelopeLocator = useMemo(() => {
    return {
      targetOrigin: window.location.origin,
      mapping: new Map([
        [
          "base64png",
          {
            resourcesPathPrefix: `/envelope/`,
            envelopePath: `/envelope/image-editor.html?f=${file.fileName}`
          }
        ]
      ])
    };
  }, [file]);

  return (
    <Page>
      <div style={{ display: "flex", height: "100%" }}>
        <Base64PngGallery openSample={openSample} />
        <EmbeddedEditor
          file={file}
          editorEnvelopeLocator={editorEnvelopeLocator}
          channelType={ChannelType.EMBEDDED}
          locale={"en"}
        />
      </div>
    </Page>
  );
}

// A custom gallery component to show the base64png samples
function Base64PngGallery(props: { openSample: (fileName: string, filePath: string) => void }) {
  const [images, setImages] = useState<{ name: string; content: string; path: string }[]>([]);
  useEffect(() => {
    Promise.all(
      samplePaths.map(({ fileName, path }) =>
        fetch(path)
          .then(response => response.text())
          .then(content => ({ name: fileName, content: content, path }))
      )
    ).then(samples => setImages([...images, ...samples]));
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
          {images.map(image => (
            <NavItem
              key={image.name}
              style={{ display: "flex", alignItems: "center" }}
              onClick={() => props.openSample(image.name, image.path)}
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
