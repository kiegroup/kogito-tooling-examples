import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor } from "../EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useMemo, useState } from "react";
import { Page } from "@patternfly/react-core";


export function Base64PngPage() {
  const [file, setFile] = useState({
    fileName: "file",
    fileExtension: "base64png",
    getFileContents: () => Promise.resolve(""),
    isReadOnly: false
  });

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
      <EmbeddedEditor
        file={file}
        editorEnvelopeLocator={editorEnvelopeLocator}
        channelType={ChannelType.EMBEDDED}
        locale={"en"}
      />
    </Page>
  );
}
