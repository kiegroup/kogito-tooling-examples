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

import * as React from "react";
import { EditorApi, EditorInitArgs, KogitoEditorChannelApi } from "@kogito-tooling/editor/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import { ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Page, Nav, NavItem, NavList, Switch } from "@patternfly/react-core";
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
    const width = imageRef.current!.width;
    const height = imageRef.current!.height;

    return `<svg version="1.1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image width="${width}" height="${height}" xlink:href="${base64Header},${editorContent}" /></svg>`;
  }, [editorContent]);

  useImperativeHandle(forwardedRef, () => {
    return {
      getContent: () => Promise.resolve().then(() => getContent()),
      setContent: (path: string, content: string) => Promise.resolve().then(() => setContent(path, content)),
      getPreview: () => Promise.resolve().then(() => getPreview()),
      undo: () => Promise.resolve(),
      redo: () => Promise.resolve(),
      getElementPosition: (selector: string) => Promise.resolve(DEFAULT_RECT)
    };
  });

  const [disabled, setDisabled] = useState(false);
  const base64Header = useMemo(() => "data:image/png;base64", []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
    const ctx = canvasRef.current?.getContext("2d")!;

    ctx.filter = `${TweakOption.CONTRAST}(${contrast}%) ${TweakOption.BRIGHTNESS}(${brightness}%) ${TweakOption.INVERT}(${invertValue}%) ${TweakOption.GRAYSCALE}(${grayscale}%) ${TweakOption.SEPIA}(${sepia}%) ${TweakOption.SATURATE}(${saturate}%)`;
    ctx.drawImage(imageRef.current!, 0, 0);

    setEditorContent(canvasRef.current!.toDataURL().split(",")[1]);
  }, [contrast, sepia, saturate, grayscale, invert, brightness]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")!;

    imageRef.current!.onload = () => {
      canvasRef.current!.width = imageRef.current!.width;
      canvasRef.current!.height = imageRef.current!.height;
      ctx.drawImage(imageRef.current!, 0, 0);
      setEditorContent(canvasRef.current!.toDataURL().split(",")[1]);
      setDisabled(false);
    };

    setDisabled(true);
  }, []);

  return (
    <Page>
      <div style={{ height: "100%", width: "100%" }}>
        <div style={{ float: "right", backgroundColor: "black", height: "100%", width: "300px" }}>
          <Nav aria-label="Image tweaker">
            <NavList>
              <NavItem style={NavItemCss} itemId={0}>
                <p>Contrast</p>
                <div style={{ display: "flex" }}>
                  <input
                    disabled={disabled}
                    style={{ width: "100px" }}
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={tweakContrast}
                  />
                  <span style={{ width: "40px", textAlign: "right" }}>{contrast}</span>
                </div>
              </NavItem>
              <NavItem style={NavItemCss} itemId={1}>
                <p>Brightness</p>
                <div style={{ display: "flex" }}>
                  <input
                    disabled={disabled}
                    style={{ width: "100px" }}
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={tweakBrightness}
                  />
                  <span style={{ width: "40px", textAlign: "right" }}>{brightness}</span>
                </div>
              </NavItem>
              <NavItem style={NavItemCss} itemId={2}>
                <p>Sepia</p>
                <div style={{ display: "flex" }}>
                  <input
                    disabled={disabled}
                    style={{ width: "100px" }}
                    type="range"
                    min="0"
                    max="100"
                    value={sepia}
                    onChange={tweakSepia}
                  />
                  <span style={{ width: "40px", textAlign: "right" }}>{sepia}</span>
                </div>
              </NavItem>
              <NavItem style={NavItemCss} itemId={3}>
                <p>Grayscale</p>
                <div style={{ display: "flex" }}>
                  <input
                    disabled={disabled}
                    style={{ width: "100px" }}
                    type="range"
                    min="0"
                    max="100"
                    value={grayscale}
                    onChange={tweakGrayscale}
                  />
                  <span style={{ width: "40px", textAlign: "right" }}>{grayscale}</span>
                </div>
              </NavItem>
              <NavItem style={NavItemCss} itemId={4}>
                <p>Saturate</p>
                <div style={{ display: "flex" }}>
                  <input
                    disabled={disabled}
                    style={{ width: "100px" }}
                    type="range"
                    min="0"
                    max="200"
                    value={saturate}
                    onChange={tweakSaturate}
                  />
                  <span style={{ width: "40px", textAlign: "right" }}>{saturate}</span>
                </div>
              </NavItem>
              <NavItem itemId={5}>
                <div style={NavItemCss}>
                  <p>Invert</p>
                  <Switch id="invert-switch" isDisabled={disabled} isChecked={invert} onChange={tweakInvert} />
                </div>
              </NavItem>
            </NavList>
          </Nav>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <div style={{ display: "none" }}>
            <img ref={imageRef} id={"original"} src={`${base64Header},${originalContent}`} alt={"Original Image"} />
          </div>
          <canvas ref={canvasRef} id={"canvas"} />
        </div>
      </div>
    </Page>
  );
};

export const ReactEditor = React.forwardRef(RefForwardingReactEditor);
