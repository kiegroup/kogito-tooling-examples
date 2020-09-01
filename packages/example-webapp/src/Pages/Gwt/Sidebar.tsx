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

import { EmbeddedEditorRef } from "../../copied-from-kogito-tooling/EmbeddedEditor";
import * as React from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { useCallback, useRef, useState } from "react";
import { Nav, NavItem, NavList, TextInput } from "@patternfly/react-core";
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

interface Props {
  editorRef: React.RefObject<EmbeddedEditorRef>;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  file: File;
  setFile: React.Dispatch<File>;
  fileExtension: string;
  accept: string;
}

/**
 * A Sidebar component to enable edit the file name, create new files, open sample and open a file.
 *
 * @param props
 * @constructor
 */
export function Sidebar(props: Props) {
  const [fileBlob, setFileBlob] = useState(new Blob());
  const onDownload = useCallback(() => {
    props.editorRef.current?.getContent().then((content) => {
      setFileBlob(new Blob([content], { type: "text/plain" }));
    });
  }, [props.file]);

  const [fileName, setFileName] = useState(props.file.fileName);
  const onChangeName = useCallback(() => {
    props.setFile({
      ...props.file,
      fileName,
    });
  }, [props.file, fileName]);

  const onNewFile = useCallback(() => {
    setFileName("new-file");
    props.setFile({
      isReadOnly: false,
      fileExtension: props.fileExtension,
      fileName: "new-file",
      getFileContents: () => Promise.resolve(""),
    });
  }, []);

  const onOpenSample = useCallback(() => {
    setFileName("sample");
    props.setFile({
      isReadOnly: false,
      fileExtension: props.fileExtension,
      fileName: "sample",
      getFileContents: () => fetch(`examples/sample.${props.fileExtension}`).then((response) => response.text()),
    });
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  const onOpenFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputRef.current!.files) {
      return;
    }

    const currentFile = inputRef.current!.files![0];
    const fileExtension = extractFileExtension(currentFile.name);
    if (
      !fileExtension ||
      ![...props.editorEnvelopeLocator.mapping.keys()].find((element) => element === fileExtension)
    ) {
      return;
    }

    setFileName(removeFileExtension(currentFile.name));
    props.setFile({
      isReadOnly: false,
      fileExtension: extractFileExtension(currentFile.name)!,
      fileName: removeFileExtension(currentFile.name),
      getFileContents: () =>
        new Promise<string | undefined>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event: any) => resolve(event.target.result as string);
          reader.readAsText(currentFile);
        }),
    });
  }, []);

  return (
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
                  accept={props.accept}
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
                    zIndex: 999,
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
              <a
                style={{ color: "white" }}
                download={`${props.file.fileName}.${props.fileExtension}`}
                href={URL.createObjectURL(fileBlob)}
              >
                Download
              </a>
            </div>
          </NavItem>
        </NavList>
      </Nav>
    </div>
  );
}
