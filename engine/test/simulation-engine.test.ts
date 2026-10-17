import { describe, it, expect, beforeEach } from "vitest";
import { DiscreteEventEngine } from "../src/simulation-engine.js";
import { Frame, SimulationEvent } from "../src/types.js";

describe("Discrete Event Engine - FR-5 Frame Forwarding & Simulation", () => {
  let engine: DiscreteEventEngine;

  beforeEach(() => {
    engine = new DiscreteEventEngine();
  });

  describe("Clock and Scheduling", () => {
    it("should start with clock at 0 and advance monotonically with step()", () => {
      expect(engine.getCurrentTime()).toBe(0);

      engine.schedule({ id: "e1", timestamp: 5, type: "EVENT" });
      engine.schedule({ id: "e2", timestamp: 12, type: "EVENT" });

      const step1 = engine.step();
      expect(step1?.id).toBe("e1");
      expect(engine.getCurrentTime()).toBe(5);

      const step2 = engine.step();
      expect(step2?.id).toBe("e2");
      expect(engine.getCurrentTime()).toBe(12);

      const step3 = engine.step();
      expect(step3).toBeUndefined();
      expect(engine.getCurrentTime()).toBe(12);
    });

    it("should throw error when attempting to schedule an event in the past", () => {
      engine.schedule({ id: "e1", timestamp: 20, type: "EVENT" });
      engine.step(); // clock is now 20

      expect(() => {
        engine.schedule({ id: "e-past", timestamp: 15, type: "EVENT" });
      }).toThrow("Cannot schedule event in the past");
    });
  });

  describe("Frame Forwarding and Hop Decisions (FR-5)", () => {
    const sampleFrame: Frame = {
      id: "frm-101",
      srcMac: "00:AA:00:11:22:33",
      dstMac: "00:BB:00:44:55:66",
      etherType: "0x0800",
    };

    it("should forward frame between interfaces with delay and record decision", () => {
      const evt = engine.forwardFrame({
        frame: sampleFrame,
        fromInterface: "Fa0/1",
        toInterface: "Fa0/2",
        fromDevice: "SW-1",
        toDevice: "SW-2",
        delay: 2,
        decision: {
          type: "forwarding",
          reason: "Destination MAC found in MAC address table on port Fa0/2",
        },
      });

      expect(evt.type).toBe("FRAME_FORWARD");
      expect(evt.timestamp).toBe(2);
      expect(evt.sourceInterface).toBe("Fa0/1");
      expect(evt.targetInterface).toBe("Fa0/2");
      expect(evt.decision?.type).toBe("forwarding");
      expect(evt.decision?.reason).toContain("MAC address table");
    });

    it("should record mac_learning decision at ingress hop", () => {
      engine.forwardFrame({
        frame: sampleFrame,
        fromInterface: "eth0",
        toInterface: "Fa0/1",
        fromDevice: "PC-A",
        toDevice: "SW-1",
        delay: 1,
        decision: {
          type: "mac_learning",
          reason: "Learned source MAC 00:AA:00:11:22:33 on VLAN 1 port Fa0/1",
        },
      });

      const processed = engine.step();
      expect(processed?.decision?.type).toBe("mac_learning");
      expect(processed?.decision?.reason).toContain("Learned source MAC");
    });

    it("should record flooding decision when destination MAC is unknown", () => {
      engine.forwardFrame({
        frame: sampleFrame,
        fromInterface: "Fa0/1",
        toInterface: "Fa0/3",
        fromDevice: "SW-1",
        toDevice: "SW-3",
        delay: 1,
        decision: {
          type: "flooding",
          reason: "Destination MAC unknown unicast, flooded to all active ports in VLAN 1",
        },
      });

      const processed = engine.step();
      expect(processed?.decision?.type).toBe("flooding");
    });

    it("should record drop decision with explicit reason (e.g. port shutdown)", () => {
      engine.forwardFrame({
        frame: sampleFrame,
        fromInterface: "Fa0/1",
        toInterface: "Fa0/4",
        fromDevice: "SW-1",
        toDevice: "SW-4",
        delay: 1,
        decision: {
          type: "drop",
          reason: "Target interface Fa0/4 is administratively down (shutdown)",
        },
      });

      const processed = engine.step();
      expect(processed?.decision?.type).toBe("drop");
      expect(processed?.decision?.reason).toContain("administratively down");
    });
  });

  describe("Event Listeners and Batch Execution", () => {
    it("should notify registered event listeners and wildcard listener", () => {
      const receivedTypes: string[] = [];
      const wildcardEvents: string[] = [];

      const unsubType = engine.on("FRAME_FORWARD", (evt) => {
        receivedTypes.push(evt.type);
      });
      const unsubWildcard = engine.on("*", (evt) => {
        wildcardEvents.push(evt.id);
      });

      engine.schedule({ id: "e1", timestamp: 1, type: "FRAME_FORWARD" });
      engine.schedule({ id: "e2", timestamp: 2, type: "OTHER" });

      engine.step();
      engine.step();

      expect(receivedTypes).toEqual(["FRAME_FORWARD"]);
      expect(wildcardEvents).toEqual(["e1", "e2"]);

      unsubType();
      unsubWildcard();
    });

    it("should execute events up to target time with runUntil", () => {
      engine.schedule({ id: "e1", timestamp: 5, type: "EVT" });
      engine.schedule({ id: "e2", timestamp: 10, type: "EVT" });
      engine.schedule({ id: "e3", timestamp: 15, type: "EVT" });

      const executed = engine.runUntil(10);
      expect(executed.map((e) => e.id)).toEqual(["e1", "e2"]);
      expect(engine.getCurrentTime()).toBe(10);
      expect(engine.getPendingEvents().length).toBe(1);
    });

    it("should execute all events with runAll and record complete history", () => {
      engine.schedule({ id: "e1", timestamp: 2, type: "EVT" });
      engine.schedule({ id: "e2", timestamp: 4, type: "EVT" });
      engine.schedule({ id: "e3", timestamp: 6, type: "EVT" });

      const executed = engine.runAll();
      expect(executed.length).toBe(3);
      expect(engine.getHistory().map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
      expect(engine.getPendingEvents().length).toBe(0);
    });

    it("should reset engine state and history cleanly", () => {
      engine.schedule({ id: "e1", timestamp: 5, type: "EVT" });
      engine.step();
      expect(engine.getHistory().length).toBe(1);
      expect(engine.getCurrentTime()).toBe(5);

      engine.reset();
      expect(engine.getHistory().length).toBe(0);
      expect(engine.getCurrentTime()).toBe(0);
      expect(engine.getPendingEvents().length).toBe(0);
    });
  });

  describe("Determinisme (FR-5 Acceptance Criteria)", () => {
    it("should produce exactly identical simulation traces across multiple independent runs", () => {
      function runScenario(): SimulationEvent[] {
        const sim = new DiscreteEventEngine();

        // Hop 1: PC-A sends frame to SW-1 (ingress MAC learning)
        sim.forwardFrame({
          id: "hop-1",
          frame: { id: "f1", srcMac: "00:AA:00:11:22:33", dstMac: "FF:FF:FF:FF:FF:FF" },
          fromDevice: "PC-A",
          fromInterface: "eth0",
          toDevice: "SW-1",
          toInterface: "Fa0/1",
          delay: 1,
          decision: {
            type: "mac_learning",
            reason: "Source MAC learned on Fa0/1",
          },
        });

        // Hop 2a & 2b: SW-1 floods broadcast to Fa0/2 and Fa0/3 at the same simulation tick
        sim.forwardFrame({
          id: "hop-2a",
          frame: { id: "f1", srcMac: "00:AA:00:11:22:33", dstMac: "FF:FF:FF:FF:FF:FF" },
          fromDevice: "SW-1",
          fromInterface: "Fa0/2",
          toDevice: "PC-B",
          toInterface: "eth0",
          delay: 2,
          decision: {
            type: "flooding",
            reason: "Flooded broadcast frame out Fa0/2",
          },
        });

        sim.forwardFrame({
          id: "hop-2b",
          frame: { id: "f1", srcMac: "00:AA:00:11:22:33", dstMac: "FF:FF:FF:FF:FF:FF" },
          fromDevice: "SW-1",
          fromInterface: "Fa0/3",
          toDevice: "PC-C",
          toInterface: "eth0",
          delay: 2,
          decision: {
            type: "drop",
            reason: "Target interface Fa0/3 administratively down",
          },
        });

        sim.runAll();
        return sim.getHistory();
      }

      const run1 = runScenario();
      const run2 = runScenario();
      const run3 = runScenario();

      expect(run1).toEqual(run2);
      expect(run2).toEqual(run3);

      expect(run1.map((e) => ({ id: e.id, time: e.timestamp, decision: e.decision?.type }))).toEqual([
        { id: "hop-1", time: 1, decision: "mac_learning" },
        { id: "hop-2a", time: 2, decision: "flooding" },
        { id: "hop-2b", time: 2, decision: "drop" },
      ]);
    });
  });
});
