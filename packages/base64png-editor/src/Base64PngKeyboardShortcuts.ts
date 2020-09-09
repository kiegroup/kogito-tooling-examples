import { useEffect } from "react";

export function useRegisterKeyboardShortcuts(envelopeContext: any, contentState: any, disabled: boolean, tweak: any) {
  useEffect(() => {
    const contrastValue = parseInt(contentState.contrast, 10);
    const increaseContrastId = envelopeContext.services.keyboardShortcuts.registerKeyPress(
      "c",
      `Edit | Increase Contrast`,
      async () => {
        if (!disabled && (contrastValue <= 200 || contrastValue >= 0)) {
          tweak(`${contrastValue + 1}`);
        }
      }
    );

    const decreaseContrastId = envelopeContext.services.keyboardShortcuts.registerKeyPress(
      "v",
      `Edit | Decrease Contrast`,
      async () => {
        if (!disabled && (contrastValue <= 200 || contrastValue >= 0)) {
          tweak(`${contrastValue - 1}`);
        }
      }
    );
    return () => {
      envelopeContext.services.keyboardShortcuts.deregister(increaseContrastId);
      envelopeContext.services.keyboardShortcuts.deregister(decreaseContrastId);
    };
  }, [contentState, disabled]);
}
