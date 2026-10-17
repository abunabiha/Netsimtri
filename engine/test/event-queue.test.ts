import { describe, it, expect, beforeEach } from "vitest";
import { EventQueue } from "../src/event-queue.js";
import { SimulationEvent } from "../src/types.js";

describe("Discrete Event Queue (FR-5)", () => {
  let queue: EventQueue<string>;

  beforeEach(() => {
    queue = new EventQueue<string>();
  });

  describe("Enqueue", () => {
    it("should enqueue events and update size and peek correctly", () => {
      expect(queue.isEmpty()).toBe(true);
      expect(queue.size()).toBe(0);
      expect(queue.peek()).toBeUndefined();

      const evt1 = queue.enqueue({ id: "e1", timestamp: 10, type: "TEST", payload: "data1" });
      expect(queue.isEmpty()).toBe(false);
      expect(queue.size()).toBe(1);
      expect(queue.peek()).toEqual(evt1);
      expect(evt1.sequence).toBe(0);

      const evt2 = queue.enqueue({ id: "e2", timestamp: 5, type: "TEST", payload: "data2" });
      expect(queue.size()).toBe(2);
      expect(queue.peek()).toEqual(evt2);
      expect(evt2.sequence).toBe(1);
    });

    it("should allow explicit sequence assignment if provided", () => {
      const evt = queue.enqueue({ id: "e1", timestamp: 10, sequence: 99, type: "TEST" });
      expect(evt.sequence).toBe(99);
    });
  });

  describe("Dequeue", () => {
    it("should return undefined when dequeuing an empty queue", () => {
      expect(queue.dequeue()).toBeUndefined();
    });

    it("should dequeue events in priority order and decrease size", () => {
      queue.enqueue({ id: "e1", timestamp: 20, type: "TEST" });
      queue.enqueue({ id: "e2", timestamp: 10, type: "TEST" });
      queue.enqueue({ id: "e3", timestamp: 30, type: "TEST" });

      const first = queue.dequeue();
      expect(first?.id).toBe("e2");
      expect(queue.size()).toBe(2);

      const second = queue.dequeue();
      expect(second?.id).toBe("e1");
      expect(queue.size()).toBe(1);

      const third = queue.dequeue();
      expect(third?.id).toBe("e3");
      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should clear all events and reset sequence counter", () => {
      queue.enqueue({ id: "e1", timestamp: 10, type: "TEST" });
      queue.enqueue({ id: "e2", timestamp: 20, type: "TEST" });
      queue.clear();

      expect(queue.size()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.peek()).toBeUndefined();

      const newEvt = queue.enqueue({ id: "e3", timestamp: 15, type: "TEST" });
      expect(newEvt.sequence).toBe(0);
    });
  });

  describe("Urutan Waktu (Chronological Ordering)", () => {
    it("should strictly order events by timestamp ascending regardless of insertion order", () => {
      const timestamps = [50, 10, 40, 20, 5, 30, 25];
      for (const ts of timestamps) {
        queue.enqueue({ id: `e-${ts}`, timestamp: ts, type: "TICK" });
      }

      const dequeuedTimestamps: number[] = [];
      while (!queue.isEmpty()) {
        const evt = queue.dequeue();
        if (evt) {
          dequeuedTimestamps.push(evt.timestamp);
        }
      }

      expect(dequeuedTimestamps).toEqual([5, 10, 20, 25, 30, 40, 50]);
    });

    it("should maintain FIFO order using sequence when timestamps are identical", () => {
      queue.enqueue({ id: "first", timestamp: 100, type: "STEP", payload: "1" });
      queue.enqueue({ id: "second", timestamp: 100, type: "STEP", payload: "2" });
      queue.enqueue({ id: "third", timestamp: 100, type: "STEP", payload: "3" });

      const e1 = queue.dequeue();
      const e2 = queue.dequeue();
      const e3 = queue.dequeue();

      expect(e1?.id).toBe("first");
      expect(e1?.sequence).toBe(0);

      expect(e2?.id).toBe("second");
      expect(e2?.sequence).toBe(1);

      expect(e3?.id).toBe("third");
      expect(e3?.sequence).toBe(2);
    });

    it("should return a non-mutating sorted copy with toArray()", () => {
      queue.enqueue({ id: "e3", timestamp: 30, type: "TEST" });
      queue.enqueue({ id: "e1", timestamp: 10, type: "TEST" });
      queue.enqueue({ id: "e2", timestamp: 20, type: "TEST" });

      const arr = queue.toArray();
      expect(arr.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
      expect(queue.size()).toBe(3); // ensures queue was not mutated
    });
  });

  describe("Determinisme (FR-5 Acceptance Criteria)", () => {
    it("should produce the exact same dequeued sequence given identical inputs", () => {
      const q1 = new EventQueue<number>();
      const q2 = new EventQueue<number>();

      const dataset = [
        { id: "pkt-3", timestamp: 15, payload: 3 },
        { id: "pkt-1", timestamp: 5, payload: 1 },
        { id: "pkt-4", timestamp: 20, payload: 4 },
        { id: "pkt-2a", timestamp: 10, payload: 21 },
        { id: "pkt-2b", timestamp: 10, payload: 22 },
      ];

      for (const item of dataset) {
        q1.enqueue({ ...item, type: "PACKET" });
        q2.enqueue({ ...item, type: "PACKET" });
      }

      const res1: SimulationEvent<number>[] = [];
      const res2: SimulationEvent<number>[] = [];

      while (!q1.isEmpty()) {
        res1.push(q1.dequeue()!);
      }
      while (!q2.isEmpty()) {
        res2.push(q2.dequeue()!);
      }

      expect(res1).toEqual(res2);
      expect(res1.map((e) => e.id)).toEqual(["pkt-1", "pkt-2a", "pkt-2b", "pkt-3", "pkt-4"]);
    });
  });
});
