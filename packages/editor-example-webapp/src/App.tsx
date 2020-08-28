import "@patternfly/patternfly/base/patternfly-variables.css";
import "@patternfly/patternfly/patternfly-addons.scss";
import "@patternfly/patternfly/patternfly.scss";
import * as React from "react";
import { Brand, Page, PageHeader, PageHeaderTools, Nav, NavList, NavItem } from "@patternfly/react-core";
import { Switch, Route, HashRouter as Router, Link } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import { File } from "@kogito-tooling/editor/dist/embedded";
import { OpenFile } from "./OpenFile";
import { ChannelType } from "@kogito-tooling/channel-common-api";
import { EmbeddedEditor } from "./EmbeddedEditor";

const resourcePathPrefix = "https://kiegroup.github.io/kogito-online/editors/0.6.1";
const gwtEnvelopePath = "https://kiegroup.github.io/kogito-online/editors/0.6.1/envelope";
const base64pngEnvelopePath = "/envelope/image-editor.html"

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
        ["bpmn", { resourcesPathPrefix: `${resourcePathPrefix}/bpmn`, envelopePath: `${gwtEnvelopePath}?f=${file.fileName}&e=${file.fileExtension}` }],
        ["bpmn2", { resourcesPathPrefix: `${resourcePathPrefix}/bpmn`, envelopePath: `${gwtEnvelopePath}?f=${file.fileName}&e=${file.fileExtension}` }],
        ["dmn", { resourcesPathPrefix: `${resourcePathPrefix}/dmn`, envelopePath: `${gwtEnvelopePath}?f=${file.fileName}&e=${file.fileExtension}` }],
        ["base64png", { resourcesPathPrefix: `/envelope/`, envelopePath: `${base64pngEnvelopePath}?f=${file.fileName}&e=${file.fileExtension}` }]
      ])
    };
  }, [file]);

  const onSelectEditor = useCallback(
    ({ itemId }) => {
      console.log(itemId);
      setFile(generateEmptyFile(itemId));
      setEditor(itemId);
    },
    [file, editor]
  );

  const onFileUpload = useCallback((newFile: File) => {
    console.log(newFile);
    setEditor(newFile.fileExtension);
    setFile(newFile);
  }, []);

  return (
    <Router>
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
                    <Link to={"/"}>Home</Link>
                  </NavItem>
                  <NavItem itemId={FileExtension.BASE46PNG} isActive={editor === FileExtension.BASE46PNG}>
                    <Link to={"/editor/base64png"}>Base64 PNG Editor</Link>
                  </NavItem>
                  <NavItem itemId={FileExtension.BPMN} isActive={editor === FileExtension.BPMN}>
                    <Link to={"/editor/bpmn"}>BPMN Editor</Link>
                  </NavItem>
                  <NavItem itemId={FileExtension.DMN} isActive={editor === FileExtension.DMN}>
                    <Link to={"/editor/dmn"}>DMN Editor</Link>
                  </NavItem>
                </NavList>
              </Nav>
            }
          />
        }
      >
        <Switch>
          <Route exact={true} path={"/"}>
            <p>This is an example</p>
          </Route>
          <Route path={"/editor/:type"}>
            <EmbeddedEditor
              file={file}
              editorEnvelopeLocator={editorEnvelopeLocator}
              channelType={ChannelType.EMBEDDED}
              locale={"en"}
            />
          </Route>
        </Switch>
      </Page>
    </Router>
  );
}
