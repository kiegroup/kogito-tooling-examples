import * as React from "react";
import { Button } from "@patternfly/react-core";
import { useCallback, useRef } from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
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
  editorEnvelopeLocator: EditorEnvelopeLocator;
  onFileUpload: (file: File) => void;
}

export function OpenFile(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inputRef.current!.files) {
      return;
    }

    const file = inputRef.current!.files![0];
    const fileExtension = extractFileExtension(file.name);
    if (!fileExtension || ![...props.editorEnvelopeLocator.mapping.keys()].find(event => event === fileExtension)) {
      return;
    }

    props.onFileUpload({
      isReadOnly: false,
      fileExtension: extractFileExtension(file.name)!,
      fileName: removeFileExtension(file.name),
      getFileContents: () =>
        new Promise<string | undefined>(resolve => {
          const reader = new FileReader();
          reader.onload = (event: any) => resolve(event.target.result as string);
          reader.readAsText(file);
        })
    });
  }, []);

  return (
    <Button variant={"tertiary"}>
      Open File
      <input
        accept={".dmn, .bpmn, .bpmn2, .base64png"}
        className="pf-c-button"
        type="file"
        aria-label="File selection"
        onChange={openFile}
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
    </Button>
  );
}
