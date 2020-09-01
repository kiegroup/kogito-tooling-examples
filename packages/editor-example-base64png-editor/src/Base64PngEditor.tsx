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
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EditorApi, EditorInitArgs, KogitoEditorChannelApi } from "@kogito-tooling/editor/dist/api";
import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Nav,
  NavItem,
  NavList,
  Page,
  Switch,
  Title,
} from "@patternfly/react-core";
import { DEFAULT_RECT } from "@kogito-tooling/guided-tour/dist/api";
import CubesIcon from "@patternfly/react-icons/dist/js/icons/cubes-icon";

/**
 * channelApi Gives the editor the possibility to send requests and notifications to the channel, it implements the KogitoEditorChannelApi.
 * initArgs Initial arguments that is passed when the editor is created. It has the file extension, the initial locale (in case the editor implements i18n) and the envelope resources path.
 */
interface Props {
  channelApi: MessageBusClient<KogitoEditorChannelApi>;
  initArgs: EditorInitArgs;
}

// TODO: Add to CSS file
const NavItemCss = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

/**
 * This is an Editor component. By exposing its `ref` implementing EditorApi, this component exposes its imperative handles and gives control to its parent. To be able to do that, it's necessary to create a RefForwardingComponent.
 *
 * The EditorApi is a contract created by Kogito Tooling which determines the necessary methods for an Editor to implement so that the Channel can manipulate its contents and retrieve valuable information.
 *
 * @param props Any props that are necessary for this Editor to work. In this case..
 * @param props.channelApi The object which allows this Editor to communicate with its containing Channel.
 * @param props.initArgs Initial arguments sent by the Channel that enable this Editor to start properly.
 * @param props.initArgs.resourcesPathPrefix The prefix which must be prepended by static resources (e.g. JS/CSS files) to be loaded properly.
 * @param props.initArgs.fileExtension The file extension of the file that's being opened. Used when the same editor can handle multiple file extensions.
 */
export const Base64PngEditor = React.forwardRef<EditorApi, Props>((props, forwardedRef) => {
  /**
   * Editor Content - The current editor value (contains all edits).
   * The editorContent has the current value of all tweaks that has been done to the image. This value is the one displayed on the canvas.
   */
  const [editorContent, setEditorContent] = useState("");

  /**
   * Original Content - The original base64 value (can't be changed with edits).
   * All new edits are made on top of the original value.
   * This is used because changing the image contrast to 0 would tweak it to a gray image, and turning it back to 100 would apply the changes on top of the gray image. This is solved by using the originalContent on ever new edit, so it's not possible to lose the image metadata after an edit.
   */
  const [originalContent, setOriginalContent] = useState("");

  /**
   * Notify the channel that the Editor is ready after the first render. That enables it to open files, ...
   */
  useEffect(() => {
    props.channelApi.notify("receive_ready");
  }, []);

  /**
   * Callback exposed to the Channel that is called when a new file is opened. It sets the originalContent to the received value.
   * TODO: The setTimout is a bug
   */
  const setContent = useCallback((path: string, content: string) => {
    setOriginalContent(content);
    return new Promise<void>((res) => setTimeout(res, 50));
  }, []);

  /**
   * Callback exposed to the Channel to retrieve the current value of the editor. It returns the value of the editorContent which is the state that has the edit image.
   */
  const getContent = useCallback(() => {
    return editorContent;
  }, [editorContent]);

  /**
   * Callback exposed to the Channel to retrieve the SVG content of the editor. A SVG is a XML file that is wrapped with a <svg> tag. For this editor it's necessary to return the edited image (editorContent).
   */
  const getPreview = useCallback(() => {
    const width = imageRef.current!.width;
    const height = imageRef.current!.height;

    return `
<svg version="1.1" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
    <image width="${width}" height="${height}" xlink:href="${base64Header},${editorContent}" />
</svg>`;
  }, [editorContent]);

  /**
   * The useImperativeHandler give the control of the Editor component to who have it's reference, making it possible to communicate with the Editor.
   * It returns all methods that are determined on the EditorApi.
   */
  useImperativeHandle(forwardedRef, () => {
    return {
      getContent: () => Promise.resolve().then(() => getContent()),
      setContent: (path: string, content: string) => setContent(path, content),
      getPreview: () => Promise.resolve().then(() => getPreview()),
      undo: () => Promise.resolve(),
      redo: () => Promise.resolve(),
      getElementPosition: (selector: string) => Promise.resolve(DEFAULT_RECT),
    };
  });

  /**
   * State that handles if the commands are disable or not. It's useful in case of a broken image or empty file is open. It starts disabled by default, and when a image is successfully loaded it becomes false.
   */
  const [disabled, setDisabled] = useState(true);

  /**
   * The base64 PNG header is used to append to the originalContent/editorContent so it can be properly rendered on the <img> tag
   */
  const base64Header = useMemo(() => "data:image/png;base64", []);

  /**
   * The reference of the canvas. It allows to access/modify the canvas properties imperatively.
   * The canvas renders the editorContent.
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * The reference of the image. It allows to access/modify the canvas properties imperatively.
   * The image renders the originalContent.
   */
  const imageRef = useRef<HTMLImageElement>(null);

  /**
   * State that handles the contrast value, 100% is the starting value.
   */
  const [contrast, setContrast] = useState("100");

  /**
   * Callback to tweak the contrast value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakContrast = useCallback(
    (e) => {
      setContrast(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [contrast]
  );

  /**
   * State that handles the brightness value, 100% is the starting value.
   */
  const [brightness, setBrightness] = useState("100");

  /**
   * Callback to tweak the brightness value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakBrightness = useCallback(
    (e) => {
      setBrightness(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [brightness]
  );

  /**
   * State that handles if the image is inverted or not. This state is modified by a switch, so it's only possible to have two values (false/true).
   * The false is by default the starting value, which represents a no-inverted image.
   */
  const [invert, setInvert] = useState(false);

  /**
   * The invert value is discrete, and has a value on the interval [0%, 100%]. This editor implements only two possible values: 0% (false) and 100% (true). The invertValue is re-calculated everytime the invert state is changed.
   */
  const invertValue = useMemo(() => (invert ? "100" : "0"), [invert]);

  /**
   * Callback to tweak the invert value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakInvert = useCallback(
    (isChecked) => {
      setInvert(isChecked);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [invert]
  );

  /**
   * State that handles the sepia value, 0% is the starting value.
   */
  const [sepia, setSepia] = useState("0");

  /**
   * Callback to tweak the sepia value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakSepia = useCallback(
    (e) => {
      setSepia(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [sepia]
  );

  /**
   * State that handles the grayscale value, 0% is the starting value.
   */
  const [grayscale, setGrayscale] = useState("0");

  /**
   * Callback to tweak the grayscale value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakGrayscale = useCallback(
    (e) => {
      setGrayscale(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [grayscale]
  );

  /**
   * State that handles the saturation value, 0% is the starting value.
   */
  const [saturate, setSaturate] = useState("100");

  /**
   * Callback to tweak the saturation value. It also notifies to the Channel that a new edit happened on the editor.
   * The Channel will handle this notification by updating the channel state control with the new edit, so it stays synced with the state control of the editor.
   */
  const tweakSaturate = useCallback(
    (e) => {
      setSaturate(e.target.value);
      props.channelApi.notify("receive_newEdit", { id: new Date().getTime().toString() });
    },
    [saturate]
  );

  /**
   * After a new edit is made by the user, it will change one of the states that handle the tweak values (contrast/brightness/invert/grayscale/sepia/saturate), and the content of the canvas need to be re-printed applying a filter with the current values. The resultant image is converted to base64 (toDataURL) and then saved in the editorContent after the base64 header is removed (split(",")[1]).
   */
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")!;

    ctx.filter = `contrast(${contrast}%) brightness(${brightness}%) invert(${invertValue}%) grayscale(${grayscale}%) sepia(${sepia}%) saturate(${saturate}%)`;
    ctx.drawImage(imageRef.current!, 0, 0);

    setEditorContent(canvasRef.current!.toDataURL().split(",")[1]);
  }, [contrast, sepia, saturate, grayscale, invert, brightness]);

  /**
   * When the editor starts, it must determine the canvas dimensions, and to do so it requires the image dimension. On the first render, the image will not be loaded yet, so it's necessary to add a callback to when the image finishes loading, it'll set the canvas dimensions and show the image. If the image is loaded, the controls are not disabled; otherwise, the controls will remain disabled.
   */
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")!;
    canvasRef.current!.width = 0;
    canvasRef.current!.height = 0;

    imageRef.current!.onload = () => {
      canvasRef.current!.width = imageRef.current!.width;
      canvasRef.current!.height = imageRef.current!.height;
      ctx.drawImage(imageRef.current!, 0, 0);
      setEditorContent(canvasRef.current!.toDataURL().split(",")[1]);
      setDisabled(false);
    };

    return () => {
      imageRef.current!.onload = null;
    };
  }, []);

  return (
    <Page style={{ backgroundColor: "rgb(240, 240, 240)" }}>
      <div style={{ display: "flex", height: "100%", width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
          <div style={{ display: "none" }}>
            <img ref={imageRef} id={"original"} src={`${base64Header},${originalContent}`} alt={"Original Image"} />
          </div>
          {disabled && (
            <EmptyState>
              <EmptyStateIcon icon={CubesIcon} />
              <Title headingLevel="h5" size="4xl">
                Empty image
              </Title>
              <EmptyStateBody>Load a valid base64png file using our gallery!</EmptyStateBody>
            </EmptyState>
          )}
          <canvas ref={canvasRef} id={"canvas"} style={{ maxWidth: "600px", maxHeight: "600px" }} />
        </div>
        <div style={{ backgroundColor: "rgb(24, 24, 24)", height: "100%", width: "350px" }}>
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
      </div>
    </Page>
  );
});
