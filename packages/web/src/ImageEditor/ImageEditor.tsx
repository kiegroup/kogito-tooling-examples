import * as React from "react";
import { EmbeddedViewer, File } from "@kogito-tooling/editor/dist/embedded";
import { ChannelType } from "@kogito-tooling/channel-common-api";
import { useMemo } from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";

export function ImageEditor() {
  const file: File = useMemo(() => {
    const filePath = `examples/sample.base64png`;
    return {
      fileName: "new-file",
      fileExtension: "base64png",
      getFileContents: () => fetch(filePath).then(response => response.text()),
      isReadOnly: false
    };
  }, []);

  const editorEnvelopeLocator: EditorEnvelopeLocator = useMemo(() => {
    return {
      targetOrigin: window.location.origin,
      mapping: new Map([
        [
          "base64png",
          {
            resourcesPathPrefix: `/envelope/`,
            envelopePath: `/envelope/image-editor.html`
          }
        ]
      ])
    };
  }, []);

  return (
    <EmbeddedViewer
      file={file}
      editorEnvelopeLocator={editorEnvelopeLocator}
      channelType={ChannelType.EMBEDDED}
      locale={"en"}
    />
  );
}
