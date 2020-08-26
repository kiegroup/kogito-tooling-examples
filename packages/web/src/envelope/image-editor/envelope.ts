import * as EditorEnvelope from '@kogito-tooling/editor/dist/envelope';
import { CompositeEditorFactory } from '@kogito-tooling/editor/dist/envelope';
import { EnvelopeBusMessage } from '@kogito-tooling/envelope-bus/dist/api';
import { SimpleReactEditorsFactory } from 'simple-react-editors';
import { ChannelType, getOperatingSystem } from '@kogito-tooling/channel-common-api';

EditorEnvelope.init({
    container: document.getElementById('envelope-app')!,
    bus: {
        postMessage<D, Type>(message: EnvelopeBusMessage<D, Type>, targetOrigin?: string, _?: any) {
            window.parent.postMessage(message, '*', _);
        }
    },
    editorFactory: new CompositeEditorFactory([new SimpleReactEditorsFactory()]),
    editorContext: { channel: ChannelType.EMBEDDED, operatingSystem: getOperatingSystem() }
});
