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

/**
 *
 * ========================================================================
 * THIS FILE NEEDS TO GO TO kogito-tooling AND REPLACE EmbeddedEnvelope.tsx
 * ========================================================================
 *
 */
import {
  EditorApi,
  EditorEnvelopeLocator,
  KogitoEditorChannelApi,
  KogitoEditorEnvelopeApi,
} from "@kogito-tooling/editor/dist/api";
import { ChannelType } from "@kogito-tooling/channel-common-api";
import { useSyncedKeyboardEvents } from "@kogito-tooling/keyboard-shortcuts/dist/channel";
import { useGuidedTourPositionProvider } from "@kogito-tooling/guided-tour/dist/channel";
import * as CSS from "csstype";
import * as React from "react";
import { useImperativeHandle, useMemo, useRef } from "react";
import { File, StateControl, useEffectAfterFirstRender } from "@kogito-tooling/editor/dist/embedded";
import { KogitoEditorChannelApiImpl } from "./KogitoEditorChannelApiImpl";
import { EnvelopeServer } from "@kogito-tooling/envelope-bus/dist/channel";
import { useConnectedEnvelopeServer } from "@kogito-tooling/envelope-bus/dist/hooks";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type ChannelApiMethodsAlreadyImplementedByEmbeddedEditor =
  | "receive_guidedTourUserInteraction"
  | "receive_guidedTourRegisterTutorial"
  | "receive_contentRequest";

type EmbeddedEditorChannelApiOverrides = Partial<
  Omit<KogitoEditorChannelApi, ChannelApiMethodsAlreadyImplementedByEmbeddedEditor>
>;

export type Props = EmbeddedEditorChannelApiOverrides & {
  file: File;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  channelType: ChannelType;
  locale: string;
};

/**
 * Forward reference for the `EmbeddedEditor` to support consumers to call upon embedded operations.
 */
export type EmbeddedEditorRef =
  | (EditorApi & {
      getStateControl(): StateControl;
      getEnvelopeServer(): EnvelopeServer<KogitoEditorChannelApi, KogitoEditorEnvelopeApi>;
    })
  | null;

const containerStyles: CSS.Properties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  width: "100%",
  height: "100%",
  border: "none",
  margin: 0,
  padding: 0,
  overflow: "hidden",
};

const RefForwardingEmbeddedEditor: React.RefForwardingComponent<EmbeddedEditorRef, Props> = (
  props: Props,
  forwardedRef
) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stateControl = useMemo(() => new StateControl(), []);

  const envelopeMapping = useMemo(() => props.editorEnvelopeLocator.mapping.get(props.file.fileExtension), [
    props.editorEnvelopeLocator,
    props.file,
  ]);

  //Setup envelope bus communication
  const kogitoEditorChannelApiImpl = useMemo(() => {
    return new KogitoEditorChannelApiImpl(stateControl, props.file, props.locale, props);
  }, [stateControl, props.file, props]);

  const envelopeServer = useMemo(() => {
    return new EnvelopeServer<KogitoEditorChannelApi, KogitoEditorEnvelopeApi>(
      { postMessage: (message) => iframeRef.current?.contentWindow?.postMessage(message, "*") },
      props.editorEnvelopeLocator.targetOrigin,
      (self) =>
        self.client.request(
          "receive_initRequest",
          { origin: self.origin, envelopeServerId: self.id },
          {
            fileExtension: props.file.fileExtension,
            resourcesPathPrefix: envelopeMapping?.resourcesPathPrefix ?? "",
          }
        )
    );
  }, [envelopeMapping, props.file, props.editorEnvelopeLocator]);

  useConnectedEnvelopeServer(envelopeServer, kogitoEditorChannelApiImpl);

  useEffectAfterFirstRender(() => {
    envelopeServer.client.notify("receive_localeChange", props.locale);
  }, [props.locale]);

  useEffectAfterFirstRender(() => {
    props.file.getFileContents().then((content) => {
      envelopeServer.client.notify("receive_contentChanged", { content: content! });
    });
  }, [props.file]);

  // Register position provider for Guided Tour
  useGuidedTourPositionProvider(envelopeServer.client, iframeRef);

  // Forward keyboard events to the EditorEnvelope
  useSyncedKeyboardEvents(envelopeServer.client);

  //Forward reference methods
  useImperativeHandle(
    forwardedRef,
    () => {
      return {
        getStateControl: () => stateControl,
        getEnvelopeServer: () => envelopeServer,
        getElementPosition: (selector) =>
          envelopeServer.client.request("receive_guidedTourElementPositionRequest", selector),
        undo: () => Promise.resolve(envelopeServer.client.notify("receive_editorUndo")),
        redo: () => Promise.resolve(envelopeServer.client.notify("receive_editorRedo")),
        getContent: () => envelopeServer.client.request("receive_contentRequest").then((c) => c.content),
        getPreview: () => envelopeServer.client.request("receive_previewRequest"),
        setContent: async (content) => envelopeServer.client.notify("receive_contentChanged", { content: content }),
      };
    },
    [envelopeServer, stateControl]
  );

  return (
    <>
      {!envelopeMapping && (
        <>
          <span>{`No Editor available for '${props.file.fileExtension}' extension`}</span>
        </>
      )}
      {envelopeMapping && (
        <iframe
          key={envelopeMapping.envelopePath}
          ref={iframeRef}
          id={"kogito-iframe"}
          data-testid={"kogito-iframe"}
          src={envelopeMapping.envelopePath}
          title="Kogito editor"
          style={containerStyles}
          data-envelope-channel={props.channelType}
        />
      )}
    </>
  );
};

export const EmbeddedEditor = React.forwardRef(RefForwardingEmbeddedEditor);
