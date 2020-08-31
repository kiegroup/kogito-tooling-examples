import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor, EmbeddedEditorRef } from "../EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useCallback, useMemo, useRef, useState } from "react";
import { Nav, NavItem, NavList, Page, TextInput } from "@patternfly/react-core";
import { File } from "@kogito-tooling/editor/dist/embedded";

function extractFileExtension(fileName: string) {
  return fileName.match(/[\.]/)
    ? fileName
        .split(".")
        ?.pop()
        ?.match(/[\w\d]+/)
        ?.pop()
    : undefined;
}

function removeFileExtension(fileName: string) {
  const fileExtension = extractFileExtension(fileName);
  if (!fileExtension) {
    return fileName;
  }
  return fileName.substr(0, fileName.length - fileExtension.length - 1);
}

enum Operation {
  NEW_FILE = "new-file",
  SAMPLE = "sample",
  OPEN = "open"
}

export function BpmnPage() {
  const editorRef = useRef<EmbeddedEditorRef>(null);
  const [operation, setOperation] = useState(Operation.NEW_FILE);
  const [file, setFile] = useState<File>({
    fileName: "new-file",
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
            envelopePath: "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope"
          }
        ],
        [
          "bpmn2",
          {
            resourcesPathPrefix: "https://kiegroup.github.io/kogito-online/editors/0.6.1/bpmn2",
            envelopePath: "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope"
          }
        ]
      ])
    };
  }, []);

  const [fileBlob, setFileBlob] = useState(new Blob());
  const onDownload = useCallback(() => {
    editorRef.current?.getContent().then(content => {
      setFileBlob(new Blob([content], { type: "text/plain" }));
    });
  }, [file]);

  const [fileName, setFileName] = useState(file.fileName);
  const onChangeName = useCallback(() => {
    setFile({
      ...file,
      fileName
    });
  }, [file, fileName]);

  const onNewFile = useCallback(() => {
    setFileName("new-file");
    setOperation(Operation.NEW_FILE);
    setFile({
      isReadOnly: false,
      fileExtension: "bpmn",
      fileName: "new-file",
      getFileContents: () => Promise.resolve("")
    });
  }, []);

  const onOpenSample = useCallback(() => {
    setFileName("sample");
    setOperation(Operation.SAMPLE);
    setFile({
      isReadOnly: false,
      fileExtension: "bpmn",
      fileName: "sample",
      getFileContents: () => fetch("examples/sample.bpmn").then(response => response.text())
    });
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const onOpenFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOperation(Operation.OPEN);

    if (!inputRef.current!.files) {
      return;
    }

    const currentFile = inputRef.current!.files![0];
    const fileExtension = extractFileExtension(currentFile.name);
    if (!fileExtension || ![...editorEnvelopeLocator.mapping.keys()].find(element => element === fileExtension)) {
      return;
    }

    setFileName(removeFileExtension(currentFile.name));
    setFile({
      isReadOnly: false,
      fileExtension: extractFileExtension(currentFile.name)!,
      fileName: removeFileExtension(currentFile.name),
      getFileContents: () =>
        new Promise<string | undefined>(resolve => {
          const reader = new FileReader();
          reader.onload = (event: any) => resolve(event.target.result as string);
          reader.readAsText(currentFile);
        })
    });
  }, []);

  return (
    <Page>
      <div style={{ display: "flex", height: "100%" }}>
        <div>
          <Nav style={{ backgroundColor: "rgb(24, 24, 24)", height: "100%" }}>
            <NavList>
              <NavItem style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <TextInput
                    style={{ width: "100px" }}
                    value={fileName}
                    type={"text"}
                    aria-label={"Edit file name"}
                    onChange={setFileName}
                    onBlur={onChangeName}
                  />
                </div>
              </NavItem>
              <NavItem onClick={onNewFile} style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <p>New Empty File</p>
                </div>
              </NavItem>
              <NavItem style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <p>
                    Open File
                    <input
                      accept={".bpmn, .bpmn2"}
                      className="pf-c-button"
                      type="file"
                      aria-label="File selection"
                      onChange={onOpenFile}
                      ref={inputRef}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        opacity: 0,
                        cursor: "pointer",
                        width: "100%",
                        zIndex: 999
                      }}
                    />
                  </p>
                </div>
              </NavItem>
              <NavItem onClick={onOpenSample} style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <p>Open Sample</p>
                </div>
              </NavItem>
              <NavItem onClick={onDownload} style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <a style={{ color: "white" }} download={`${file.fileName}.bpmn`} href={URL.createObjectURL(fileBlob)}>
                    Download
                  </a>
                </div>
              </NavItem>
            </NavList>
          </Nav>
        </div>
        <EmbeddedEditor
          key={operation}
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
