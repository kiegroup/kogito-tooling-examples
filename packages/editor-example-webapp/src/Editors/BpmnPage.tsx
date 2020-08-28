import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor } from "../EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useMemo, useState } from "react";
import { Page } from "@patternfly/react-core";

const envelopePath = "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope";

export function BpmnPage() {
  const [file, setFile] = useState({
    fileName: "file",
    fileExtension: "bpmn",
    getFileContents: () => Promise.resolve(""),
    isReadOnly: false
  });

  const editorEnvelopeLocator: EditorEnvelopeLocator = useMemo(() => {
    return {
      targetOrigin: window.location.origin,
      mapping: new Map([
        [
          "bpmn",
          {
            resourcesPathPrefix: "https://kiegroup.github.io/kogito-online/editors/0.6.1/bpmn",
            envelopePath: `${envelopePath}?f=${file.fileName}&e=${file.fileExtension}`
          }
        ],
        [
          "bpmn2",
          {
            resourcesPathPrefix: "https://kiegroup.github.io/kogito-online/editors/0.6.1/bpmn2",
            envelopePath: `${envelopePath}?f=${file.fileName}&e=${file.fileExtension}`
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
