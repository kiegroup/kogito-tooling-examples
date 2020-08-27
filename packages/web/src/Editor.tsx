import * as React from "react";
import { EmbeddedViewer, File } from "@kogito-tooling/editor/dist/embedded";
import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";

export function Editor(props: { file: File, editorEnvelopeLocator: EditorEnvelopeLocator }) {

  return (
    <EmbeddedViewer
      file={props.file}
      editorEnvelopeLocator={props.editorEnvelopeLocator}
      channelType={ChannelType.EMBEDDED}
      locale={"en"}
    />
  );
}
