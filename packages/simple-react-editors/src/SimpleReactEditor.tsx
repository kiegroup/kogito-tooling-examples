import * as React from "react";
import { EditorApi, EditorInitArgs, KogitoEditorChannelApi } from "@kogito-tooling/editor/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import { ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Page, PageHeader, PageSidebar, Nav, NavItem, NavList } from "@patternfly/react-core";
import { DEFAULT_RECT } from "@kogito-tooling/guided-tour/dist/api";
import { ContentType, ResourceContent } from "@kogito-tooling/channel-common-api";
import { Base64 } from "./base64";

interface Props {
  children?: ReactNode;
  channelApi: MessageBusClient<KogitoEditorChannelApi>;
  initArgs: EditorInitArgs;
}

enum TweakOption {
  CONTRAST = "contrast",
  BRIGHTNESS = "brightness",
  INVERT = "invert",
  SEPIA = "sepia",
  GRAYSCALE = "grayscale",
  SATURATE = "saturate"
}

const NavItemCss = {
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center"
};

export const RefForwardingReactEditor: React.RefForwardingComponent<EditorApi, Props> = (props, forwardedRef) => {
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  useEffect(() => {
    props.channelApi.notify("receive_ready");
  }, []);

  const setContent = useCallback(async (path: string, content: string) => {
    setOriginalContent(content);
  }, []);

  const getContent = useCallback(() => {
    return editorContent;
  }, [editorContent]);

  const getPreview = useCallback(() => {
    throw new Error("Method not implemented.");
  }, []);

  useImperativeHandle(forwardedRef, () => {
    return {
      getContent: () => Promise.resolve().then(() => getContent()),
      setContent: (path: string, content: string) => Promise.resolve().then(() => setContent(path, content)),
      getPreview: () => getPreview(),
      undo: () => Promise.resolve(),
      redo: () => Promise.resolve(),
      getElementPosition: (selector: string) => Promise.resolve(DEFAULT_RECT)
    };
  });

  const [isNavOpen, setIsNavOpen] = useState(true);
  const imageExtension = useMemo(() => "data:image/png;base64", []);

  const [contrast, setContrast] = useState("100");
  const tweakContrast = useCallback(
    e => {
      setContrast(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [contrast]
  );

  const [brightness, setBrightness] = useState("100");
  const tweakBrightness = useCallback(
    e => {
      setBrightness(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [brightness]
  );

  const [invert, setInvert] = useState("100");
  const tweakInvert = useCallback(
    e => {
      setInvert(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [invert]
  );

  const [sepia, setSepia] = useState("1");
  const tweakSepia = useCallback(
    e => {
      setSepia(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [sepia]
  );

  const [grayscale, setGrayscale] = useState("1");
  const tweakGrayscale = useCallback(
    e => {
      setGrayscale(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [grayscale]
  );

  const [saturate, setSaturate] = useState("100");
  const tweakSaturate = useCallback(
    e => {
      setSaturate(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [saturate]
  );

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const image = document.getElementById("original") as HTMLImageElement;

    ctx.filter = `${TweakOption.CONTRAST}(${contrast}%) ${TweakOption.BRIGHTNESS}(${brightness}%) ${TweakOption.INVERT}(${invert}%) ${TweakOption.GRAYSCALE}(${grayscale}%) ${TweakOption.SEPIA}(${sepia}%) ${TweakOption.SATURATE}(${saturate}%)`;
    ctx.drawImage(image, 0, 0);

    const data = canvas.toDataURL().split(",")[1];
    console.log(data);
    setEditorContent(data);
  }, [contrast, sepia, saturate, grayscale, invert, brightness]);

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const image = document.getElementById("original") as HTMLImageElement;
    ctx.drawImage(image, 0, 0);
  }, [originalContent]);

  return (
    <Page
      header={<PageHeader showNavToggle={true} isNavOpen={isNavOpen} onNavToggle={() => setIsNavOpen(!isNavOpen)} />}
      sidebar={
        <PageSidebar
          nav={
            <Nav aria-label="Nav">
              <NavList>
                <NavItem style={NavItemCss} itemId={0}>
                  Contrast <input type="range" min="1" max="200" value={contrast} onChange={tweakContrast} />
                </NavItem>
                <NavItem style={NavItemCss} itemId={1}>
                  Brightness <input type="range" min="1" max="200" value={brightness} onChange={tweakBrightness} />
                </NavItem>
                <NavItem style={NavItemCss} itemId={2}>
                  Invert <input type="range" min="1" max="100" value={invert} onChange={tweakInvert} />
                </NavItem>
                <NavItem style={NavItemCss} itemId={3}>
                  Sepia <input type="range" min="1" max="100" value={sepia} onChange={tweakSepia} />
                </NavItem>
                <NavItem style={NavItemCss} itemId={4}>
                  Grayscale <input type="range" min="1" max="100" value={grayscale} onChange={tweakGrayscale} />
                </NavItem>
                <NavItem style={NavItemCss} itemId={5}>
                  Saturate <input type="range" min="1" max="200" value={saturate} onChange={tweakSaturate} />
                </NavItem>
              </NavList>
            </Nav>
          }
          isNavOpen={isNavOpen}
        />
      }
    >
      <div>
        <div style={{ display: "none" }}>
          <img id={"original"} src={`${imageExtension},${originalContent}`} alt={"Original Image"} />
        </div>
        <canvas id={"canvas"} />
      </div>
    </Page>
  );
};

export const ReactEditor = React.forwardRef(RefForwardingReactEditor);
