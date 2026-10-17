import { EnqueueEventInput, SimulationEvent } from "./types.js";

/**
 * Deterministic Discrete Event Queue based on Min-Heap.
 * Ordered primarily by timestamp, and secondarily by sequence counter.
 */
export class EventQueue<T = unknown> {
  private heap: SimulationEvent<T>[] = [];
  private sequenceCounter = 0;

  /**
   * Enqueues an event. If sequence is not provided, assigns monotonically increasing sequence.
   */
  public enqueue(input: EnqueueEventInput<T>): SimulationEvent<T> {
    const event: SimulationEvent<T> = {
      ...input,
      sequence: input.sequence !== undefined ? input.sequence : this.sequenceCounter++,
    };

    this.heap.push(event);
    this.bubbleUp(this.heap.length - 1);
    return event;
  }

  /**
   * Dequeues the earliest event from the queue.
   */
  public dequeue(): SimulationEvent<T> | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    const root = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return root;
  }

  /**
   * Peeks the earliest event without removing it.
   */
  public peek(): SimulationEvent<T> | undefined {
    return this.heap[0];
  }

  /**
   * Returns current count of events in the queue.
   */
  public size(): number {
    return this.heap.length;
  }

  /**
   * Returns whether the queue is empty.
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Clears all events and resets sequence counter.
   */
  public clear(): void {
    this.heap = [];
    this.sequenceCounter = 0;
  }

  /**
   * Returns a copy of all events in sorted order without mutating the heap.
   */
  public toArray(): SimulationEvent<T>[] {
    const copy = [...this.heap];
    return copy.sort(this.compare);
  }

  private compare(a: SimulationEvent<T>, b: SimulationEvent<T>): number {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return a.sequence - b.sequence;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
