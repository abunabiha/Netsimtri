/**
 * Engine placeholder ping function.
 * Verifies test pipeline and basic engine logic.
 */
export function ping(target: string): string {
  if (!target) {
    throw new Error("Target is required");
  }
  return `pong from ${target}`;
}
