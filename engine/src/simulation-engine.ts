import { EventQueue } from "./event-queue.js";
import {
  EnqueueEventInput,
  EventHandler,
  Frame,
  HopDecision,
  SimulationEvent,
} from "./types.js";

export interface ForwardFrameParams {
  id?: string;
  frame: Frame;
  fromInterface: string;
  toInterface: string;
  fromDevice?: string;
  toDevice?: string;
  delay?: number;
  decision: HopDecision;
}

/**
 * Discrete Event Simulation Engine conforming to NetSimTRI FR-5.
 * Dispatches events in strict chronological and deterministic order.
 */
export class DiscreteEventEngine {
  private queue = new EventQueue();
  private currentTime = 0;
  private eventIdCounter = 0;
  private history: SimulationEvent[] = [];
  private handlers = new Map<string, Set<EventHandler>>();

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getHistory(): SimulationEvent[] {
    return [...this.history];
  }

  public getPendingEvents(): SimulationEvent[] {
    return this.queue.toArray();
  }

  /**
   * Schedules a general simulation event.
   */
  public schedule<T = unknown>(input: EnqueueEventInput<T>): SimulationEvent<T> {
    if (input.timestamp < this.currentTime) {
      throw new Error(
        `Cannot schedule event in the past (currentTime: ${this.currentTime}, eventTime: ${input.timestamp})`
      );
    }

    return this.queue.enqueue({
      ...input,
      id: input.id || `evt-${++this.eventIdCounter}`,
    }) as SimulationEvent<T>;
  }

  /**
   * Forwards a frame between interfaces as a discrete event.
   * Records hop decisions (mac_learning, flooding, forwarding, or drop with reason).
   */
  public forwardFrame(params: ForwardFrameParams): SimulationEvent<Frame> {
    const delay = params.delay !== undefined ? Math.max(0, params.delay) : 1;
    const timestamp = this.currentTime + delay;

    return this.schedule<Frame>({
      id: params.id || `frame-evt-${++this.eventIdCounter}`,
      timestamp,
      type: "FRAME_FORWARD",
      sourceDevice: params.fromDevice,
      sourceInterface: params.fromInterface,
      targetDevice: params.toDevice,
      targetInterface: params.toInterface,
      payload: params.frame,
      decision: params.decision,
    });
  }

  /**
   * Registers an event listener for a given event type or "*" for all.
   */
  public on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const handlerSet = this.handlers.get(eventType)!;
    handlerSet.add(handler as EventHandler);

    return () => {
      handlerSet.delete(handler as EventHandler);
    };
  }

  /**
   * Advances simulation by executing the next single event.
   */
  public step(): SimulationEvent | undefined {
    const event = this.queue.dequeue();
    if (!event) {
      return undefined;
    }

    this.currentTime = event.timestamp;
    this.history.push(event);

    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(event);
      }
    }

    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(event);
      }
    }

    return event;
  }

  /**
   * Runs the simulation up to a target time.
   */
  public runUntil(targetTime: number, maxSteps = 10000): SimulationEvent[] {
    const executed: SimulationEvent[] = [];
    let steps = 0;

    while (!this.queue.isEmpty() && steps < maxSteps) {
      const next = this.queue.peek();
      if (!next || next.timestamp > targetTime) {
        break;
      }

      const event = this.step();
      if (event) {
        executed.push(event);
      }
      steps++;
    }

    if (steps >= maxSteps && !this.queue.isEmpty()) {
      throw new Error(`Simulation reached maximum safety limit of ${maxSteps} steps`);
    }

    return executed;
  }

  /**
   * Runs all pending events in the queue.
   */
  public runAll(maxSteps = 10000): SimulationEvent[] {
    const executed: SimulationEvent[] = [];
    let steps = 0;

    while (!this.queue.isEmpty() && steps < maxSteps) {
      const event = this.step();
      if (event) {
        executed.push(event);
      }
      steps++;
    }

    if (steps >= maxSteps && !this.queue.isEmpty()) {
      throw new Error(`Simulation reached maximum safety limit of ${maxSteps} steps`);
    }

    return executed;
  }

  /**
   * Resets simulation engine state, clock, queue, and history.
   */
  public reset(): void {
    this.queue.clear();
    this.currentTime = 0;
    this.eventIdCounter = 0;
    this.history = [];
  }
}
