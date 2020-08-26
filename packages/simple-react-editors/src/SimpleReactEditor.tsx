import * as React from "react";
import { EditorApi, EditorInitArgs, KogitoEditorChannelApi } from "@kogito-tooling/editor/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import { ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Bullseye, Page, PageHeader, PageSidebar, Nav, NavItem, NavList, Switch } from "@patternfly/react-core";
import { DEFAULT_RECT } from "@kogito-tooling/guided-tour/dist/api";

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
  justifyContent: "space-between",
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

  const [invert, setInvert] = useState(false);
  const invertValue = useMemo(() => (invert ? "100" : "0"), [invert]);
  const tweakInvert = useCallback(
    isChecked => {
      setInvert(isChecked);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [invert]
  );

  const [sepia, setSepia] = useState("0");
  const tweakSepia = useCallback(
    e => {
      setSepia(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [sepia]
  );

  const [grayscale, setGrayscale] = useState("0");
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

    ctx.filter = `${TweakOption.CONTRAST}(${contrast}%) ${TweakOption.BRIGHTNESS}(${brightness}%) ${TweakOption.INVERT}(${invertValue}%) ${TweakOption.GRAYSCALE}(${grayscale}%) ${TweakOption.SEPIA}(${sepia}%) ${TweakOption.SATURATE}(${saturate}%)`;
    ctx.drawImage(image, 0, 0);

    setEditorContent(canvas.toDataURL());
  }, [contrast, sepia, saturate, grayscale, invert, brightness]);

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const image = document.getElementById("original") as HTMLImageElement;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
  }, []);

  return (
    <Page
      header={<PageHeader showNavToggle={true} isNavOpen={isNavOpen} onNavToggle={() => setIsNavOpen(!isNavOpen)} />}
      sidebar={
        <PageSidebar
          nav={
            <Nav aria-label="Nav">
              <NavList>
                <NavItem style={NavItemCss} itemId={0}>
                  <p>Contrast</p>
                  <input type="range" min="0" max="200" value={contrast} onChange={tweakContrast} />
                  <span>{contrast}</span>
                </NavItem>
                <NavItem style={NavItemCss} itemId={1}>
                  <p>Brightness</p>
                  <input type="range" min="0" max="200" value={brightness} onChange={tweakBrightness} />
                  <span>{brightness}</span>
                </NavItem>
                <NavItem style={NavItemCss} itemId={2}>
                  <p>Sepia</p>
                  <input type="range" min="0" max="100" value={sepia} onChange={tweakSepia} />
                  <span>{sepia}</span>
                </NavItem>
                <NavItem style={NavItemCss} itemId={3}>
                  <p>Grayscale</p>
                  <input type="range" min="0" max="100" value={grayscale} onChange={tweakGrayscale} />{" "}
                  <span>{grayscale}</span>
                </NavItem>
                <NavItem style={NavItemCss} itemId={4}>
                  <p>Saturate</p>
                  <input type="range" min="0" max="200" value={saturate} onChange={tweakSaturate} />
                  <span>{saturate}</span>
                </NavItem>
                <NavItem itemId={5}>
                  <div style={NavItemCss}>
                    <p>Invert</p>
                    <Switch id="invert-switch" isChecked={invert} onChange={tweakInvert} />
                  </div>
                </NavItem>
              </NavList>
            </Nav>
          }
          isNavOpen={isNavOpen}
        />
      }
    >
      <Bullseye>
        <div>
          <div style={{ display: "none" }}>
            <img id={"original"} src={originalContent} alt={"Original Image"} />
          </div>
          <canvas id={"canvas"} />
        </div>
      </Bullseye>
    </Page>
  );
};

export const ReactEditor = React.forwardRef(RefForwardingReactEditor);
