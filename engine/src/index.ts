export * from "./types.js";
export * from "./event-queue.js";
export * from "./simulation-engine.js";
export * from "./topology/types.js";
export * from "./topology/platform-catalog.js";
export * from "./topology/topology-manager.js";

/**
 * Engine placeholder ping function.
 * Kept for basic connectivity checks and backward compatibility.
 */
export function ping(target: string): string {
  if (!target) {
    throw new Error("Target is required");
  }
  return `pong from ${target}`;
}
