import * as React from "react";
import { Editor, EditorApi, EditorInitArgs, KogitoEditorEnvelopeContextType } from "@kogito-tooling/editor/dist/api";
import { ReactEditor } from "./SimpleReactEditor";

export class SimpleReactEditorInterface implements Editor {
  private editorRef: React.RefObject<EditorApi>;
  public af_isReact = true;
  public af_componentId: "txt-editor";
  public af_componentTitle: "Txt Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType,
    private readonly initArgs: EditorInitArgs
  ) {
    this.editorRef = React.createRef<EditorApi>();
  }

  public getContent(): Promise<string> {
    return this.editorRef.current?.getContent()!;
  }

  public getElementPosition(selector: string) {
    return this.editorRef.current?.getElementPosition(selector)!;
  }

  public setContent(path: string, content: string): Promise<void> {
    return this.editorRef.current?.setContent(path, content)!;
  }

  public getPreview(): Promise<string | undefined> {
    return this.editorRef.current?.getPreview()!;
  }

  public undo(): Promise<void> {
    return this.editorRef.current?.undo()!;
  }

  public redo(): Promise<void> {
    return this.editorRef.current?.redo()!;
  }

  public af_componentRoot() {
    return <ReactEditor ref={this.editorRef} channelApi={this.envelopeContext.channelApi} initArgs={this.initArgs} />;
  }
}
