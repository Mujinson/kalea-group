/**
 * Clears a zero only in the focused input's DOM value, without dispatching a
 * change event. The next keystroke therefore replaces zero instead of being
 * appended to it, while the form's stored numeric value remains unchanged.
 */
export function clearZeroOnFocus(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget;
  if (input.type === "number" && input.value.trim() !== "" && Number(input.value) === 0) {
    input.value = "";
  }
}
