import "@patternfly/patternfly/base/patternfly-variables.css";
import "@patternfly/patternfly/patternfly-addons.scss";
import "@patternfly/patternfly/patternfly.scss";
import * as React from "react";
import { Brand, Page, PageHeader, PageHeaderTools, Nav, NavList, NavItem } from "@patternfly/react-core";
import { useCallback, useMemo, useState } from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { File } from "@kogito-tooling/editor/dist/embedded";
import { Editor } from "./Editor";
import { OpenFile } from "./OpenFile";

const resourcePathPrefix = "https://kiegroup.github.io/kogito-online/editors/0.6.1";
const envelopePath = "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope";

enum FileExtension {
  BPMN = "bpmn",
  DMN = "dmn",
  BASE46PNG = "base64png"
}

function generateEmptyFile(extension: FileExtension): File {
  return {
    fileName: "file",
    fileExtension: extension,
    getFileContents: () => Promise.resolve(""),
    isReadOnly: false
  };
}

export function App() {
  const [editor, setEditor] = useState("");
  const [file, setFile] = useState(generateEmptyFile(FileExtension.BASE46PNG));

  const editorEnvelopeLocator: EditorEnvelopeLocator = useMemo(() => {
    return {
      targetOrigin: window.location.origin,
      mapping: new Map([
        ["bpmn", { resourcesPathPrefix: `${resourcePathPrefix}/bpmn`, envelopePath }],
        ["bpmn2", { resourcesPathPrefix: `${resourcePathPrefix}/bpmn`, envelopePath }],
        ["dmn", { resourcesPathPrefix: `${resourcePathPrefix}/dmn`, envelopePath }],
        ["base64png", { resourcesPathPrefix: `/envelope/`, envelopePath: `/envelope/image-editor.html` }]
      ])
    };
  }, []);

  const onSelectEditor = useCallback(
    ({ itemId }) => {
      setFile(generateEmptyFile(itemId));
      setEditor(itemId);
    },
    [file, editor]
  );

  const onFileUpload = useCallback((file: File) => {
    setEditor(file.fileExtension);
    setFile(file);
  }, []);

  return (
    <Page
      header={
        <PageHeader
          logo={<Brand src={"logo.png"} alt="Logo" />}
          headerTools={
            <PageHeaderTools>
              <OpenFile onFileUpload={onFileUpload} editorEnvelopeLocator={editorEnvelopeLocator} />
            </PageHeaderTools>
          }
          topNav={
            <Nav onSelect={onSelectEditor} aria-label="Nav" variant="horizontal">
              <NavList>
                <NavItem itemId={""} isActive={editor === ""}>
                  Home
                </NavItem>
                <NavItem itemId={FileExtension.BASE46PNG} isActive={editor === FileExtension.BASE46PNG}>
                  Base64 PNG Editor
                </NavItem>
                <NavItem itemId={FileExtension.BPMN} isActive={editor === FileExtension.BPMN}>
                  BPMN Editor
                </NavItem>
                <NavItem itemId={FileExtension.DMN} isActive={editor === FileExtension.DMN}>
                  DMN Editor
                </NavItem>
              </NavList>
            </Nav>
          }
        />
      }
    >
      {editor === "" && <p>This is an example</p>}
      {editor === FileExtension.BASE46PNG && <Editor file={file} editorEnvelopeLocator={editorEnvelopeLocator} />}
      {editor === FileExtension.BPMN && <Editor file={file} editorEnvelopeLocator={editorEnvelopeLocator} />}
      {editor === FileExtension.DMN && <Editor file={file} editorEnvelopeLocator={editorEnvelopeLocator} />}
    </Page>
  );
}
