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

import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor, EmbeddedEditorRef } from "../../copied-from-kogito-tooling/EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useMemo, useRef, useState } from "react";
import { Page } from "@patternfly/react-core";
import { File } from "@kogito-tooling/editor/dist/embedded";
import { Sidebar } from "./Sidebar";

/**
 *
 * @constructor
 */
export function BpmnPage() {
  /**
   *
   */
  const editorRef = useRef<EmbeddedEditorRef>(null);

  /**
   *
   */
  const [file, setFile] = useState<File>({
    fileName: "new-file",
    fileExtension: "bpmn",
    getFileContents: () => Promise.resolve(""),
    isReadOnly: false,
  });

  /**
   *
   */
  const editorEnvelopeLocator: EditorEnvelopeLocator = useMemo(() => {
    return {
      targetOrigin: window.location.origin,
      mapping: new Map([
        [
          "bpmn",
          {
            resourcesPathPrefix: "https://kiegroup.github.io/kogito-online/editors/0.6.1/bpmn",
            envelopePath: "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope",
          },
        ],
        [
          "bpmn2",
          {
            resourcesPathPrefix: "https://kiegroup.github.io/kogito-online/editors/0.6.1/bpmn2",
            envelopePath: "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope",
          },
        ],
      ]),
    };
  }, []);

  return (
    <Page>
      <div style={{ display: "flex", height: "100%" }}>
        <Sidebar
          editorRef={editorRef}
          editorEnvelopeLocator={editorEnvelopeLocator}
          file={file}
          setFile={setFile}
          fileExtension={"bpmn"}
          accept={".bpmn, .bpmn2"}
        />
        <EmbeddedEditor
          ref={editorRef}
          file={file}
          editorEnvelopeLocator={editorEnvelopeLocator}
          channelType={ChannelType.EMBEDDED}
          locale={"en"}
        />
      </div>
    </Page>
  );
}