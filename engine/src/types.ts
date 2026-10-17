/**
 * Discrete Event Simulation Types according to FR-5 (NetSimTRI PRD).
 */

export type HopDecisionType = "mac_learning" | "flooding" | "forwarding" | "drop";

export interface HopDecision {
  type: HopDecisionType;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface Frame {
  id: string;
  srcMac: string;
  dstMac: string;
  etherType?: string;
  payload?: unknown;
}

export interface SimulationEvent<T = unknown> {
  id: string;
  timestamp: number;
  sequence: number;
  type: string;
  sourceDevice?: string;
  sourceInterface?: string;
  targetDevice?: string;
  targetInterface?: string;
  payload?: T;
  decision?: HopDecision;
}

export type EnqueueEventInput<T = unknown> = Omit<SimulationEvent<T>, "sequence"> & {
  sequence?: number;
};

export type EventHandler<T = unknown> = (event: SimulationEvent<T>) => void;
