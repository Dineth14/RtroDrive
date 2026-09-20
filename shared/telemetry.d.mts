export interface Sample { value: number | null; valid: boolean; source: 'obd' | 'gnss' | 'imu' | 'external' | 'derived' | 'simulated'; ageMs: number; unit: string }
export interface TelemetryPacket {
  schemaVersion: 1; type: 'telemetry'; sessionId: string; sequence: number; timestampMs: number;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'fault'; vehicleProfile: string;
  ignition: 'unknown' | 'off' | 'acc' | 'on' | 'start'; engineRunning: boolean; channels: Record<string, Sample>;
}
export const CHANNELS: Readonly<Record<string, { id: number; name: string; unit: string; scale: number; min: number; max: number }>>;
export const SOURCES: readonly string[];
export function validateTelemetry(packet: unknown): TelemetryPacket;
export function sample(name: string, value: number | null, source?: Sample['source'], ageMs?: number): Sample;
export function isNewerSequence(next: number, previous: number): boolean;
export function telemetrySchema(): unknown;
