// ============================================================
// Gujarat Sentinel — Demo Engine ("Mission Sentry")
// Scripted real-time demonstration scenario
// ============================================================
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { getDb } from '../database/db';

interface DemoPhase {
  phase: number;
  name: string;
  description: string;
  duration: number; // ms
  events: DemoEvent[];
}

interface DemoEvent {
  delay: number; // ms from phase start
  type: string;
  data: any;
}

let demoRunning = false;
let demoTimer: NodeJS.Timeout | null = null;

export function isDemoRunning(): boolean {
  return demoRunning;
}

export function stopDemo(): void {
  demoRunning = false;
  if (demoTimer) {
    clearTimeout(demoTimer);
    demoTimer = null;
  }
}

export function startMissionSentry(io: SocketIOServer): void {
  if (demoRunning) return;
  demoRunning = true;

  const phases: DemoPhase[] = [
    {
      phase: 1,
      name: 'SYSTEM INITIALIZATION',
      description: '50 cameras connecting to Gujarat Sentinel platform',
      duration: 8000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Initializing Gujarat Sentinel...', icon: '🔄' } },
        { delay: 1500, type: 'demo:event', data: { message: 'Connecting to camera network...', icon: '📡' } },
        { delay: 3000, type: 'demo:event', data: { message: '25/50 cameras connected', icon: '📷' } },
        { delay: 4500, type: 'demo:event', data: { message: '47/50 cameras online (3 offline)', icon: '✅' } },
        { delay: 6000, type: 'demo:event', data: { message: 'AI Analytics Engine active', icon: '🤖' } },
        { delay: 7000, type: 'demo:event', data: { message: 'Watchlist database loaded (5 entries)', icon: '📋' } },
      ],
    },
    {
      phase: 2,
      name: 'LIVE NETWORK',
      description: 'Multiple camera feeds become active',
      duration: 6000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'CCTV feeds streaming across 10 districts', icon: '📺' } },
        { delay: 2000, type: 'camera:status', data: { camera_id: 'CAM-001', status: 'ONLINE', ai_active: true } },
        { delay: 3000, type: 'camera:status', data: { camera_id: 'CAM-007', status: 'ONLINE', ai_active: true } },
        { delay: 4000, type: 'camera:status', data: { camera_id: 'CAM-014', status: 'ONLINE', ai_active: true } },
        { delay: 5000, type: 'demo:event', data: { message: 'All AI pipelines active — ANPR ready', icon: '🎯' } },
      ],
    },
    {
      phase: 3,
      name: 'TARGET DETECTION',
      description: 'Vehicle GJ01AB1234 detected on Camera 01',
      duration: 6000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: '🚗 Vehicle entering SG Highway Junction...', icon: '🚗' } },
        { delay: 2000, type: 'detection:new', data: {
          detection_id: `DET-DEMO-001`,
          camera_id: 'CAM-001',
          camera_name: 'SG Highway Junction Camera',
          plate_number: 'GJ01AB1234',
          confidence: 96.7,
          location: 'SG Highway Junction',
          district: 'Ahmedabad',
          latitude: 23.0225,
          longitude: 72.5714,
          vehicle_type: 'Sedan',
          vehicle_color: 'White',
          timestamp: new Date().toISOString(),
          direction: 'NB',
        }},
        { delay: 4000, type: 'demo:event', data: { message: 'Vehicle detected — initiating ANPR...', icon: '🔍' } },
      ],
    },
    {
      phase: 4,
      name: 'ANPR PROCESSING',
      description: 'Number plate recognized: GJ01AB1234 (96.7%)',
      duration: 5000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Image preprocessing...', icon: '🖼️' } },
        { delay: 1500, type: 'demo:event', data: { message: 'OCR processing...', icon: '🔤' } },
        { delay: 2500, type: 'demo:event', data: { message: 'Plate identified: GJ01AB1234', icon: '🔢' } },
        { delay: 3500, type: 'demo:event', data: { message: 'Confidence: 96.7% — Normalizing...', icon: '✅' } },
        { delay: 4500, type: 'demo:event', data: { message: 'ANPR complete — checking watchlist...', icon: '🔍' } },
      ],
    },
    {
      phase: 5,
      name: 'WATCHLIST CHECK',
      description: 'System checks watchlist — MATCH FOUND',
      duration: 5000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Searching watchlist database...', icon: '🔎' } },
        { delay: 1500, type: 'demo:event', data: { message: 'Comparing GJ01AB1234...', icon: '⚡' } },
        { delay: 3000, type: 'demo:event', data: { message: '🚨 MATCH FOUND — STOLEN VEHICLE (WL-2026-001)', icon: '🚨' } },
        { delay: 4000, type: 'demo:event', data: { message: 'Priority: CRITICAL — Generating alert...', icon: '⚠️' } },
      ],
    },
    {
      phase: 6,
      name: 'CRITICAL ALERT',
      description: 'Real-time critical alert generated',
      duration: 6000,
      events: [
        { delay: 500, type: 'alert:new', data: {
          alert_id: `ALT-DEMO-${Date.now()}`,
          type: 'WATCHLIST_MATCH',
          priority: 'CRITICAL',
          camera_id: 'CAM-001',
          camera_name: 'SG Highway Junction Camera',
          location: 'SG Highway Junction',
          district: 'Ahmedabad',
          latitude: 23.0225,
          longitude: 72.5714,
          timestamp: new Date().toISOString(),
          detected_entity: 'GJ01AB1234',
          entity_type: 'VEHICLE',
          confidence: 96.7,
          watchlist_id: 'WL-2026-001',
          watchlist_category: 'STOLEN_VEHICLE',
          status: 'NEW',
        }},
        { delay: 2000, type: 'demo:event', data: { message: '🔔 Alert pushed to all control rooms', icon: '🔔' } },
        { delay: 3500, type: 'demo:event', data: { message: 'GIS marker updated — camera pulsing red', icon: '🗺️' } },
        { delay: 5000, type: 'demo:event', data: { message: 'Alert sound activated', icon: '🔊' } },
      ],
    },
    {
      phase: 7,
      name: 'CROSS-CAMERA TRACKING',
      description: 'Vehicle tracked across multiple cameras',
      duration: 12000,
      events: [
        { delay: 1000, type: 'detection:new', data: {
          detection_id: `DET-DEMO-002`, camera_id: 'CAM-007', camera_name: 'Ashram Road Camera',
          plate_number: 'GJ01AB1234', confidence: 97.1, location: 'Ashram Road', district: 'Ahmedabad',
          latitude: 23.0258, longitude: 72.5800, vehicle_type: 'Sedan', vehicle_color: 'White',
          timestamp: new Date(Date.now() + 660000).toISOString(), direction: 'NB',
        }},
        { delay: 2000, type: 'demo:event', data: { message: 'Vehicle detected on CAM-007 (Ashram Road)', icon: '📷' } },
        { delay: 4000, type: 'detection:new', data: {
          detection_id: `DET-DEMO-003`, camera_id: 'CAM-015', camera_name: 'Mehsana Highway Entry Camera',
          plate_number: 'GJ01AB1234', confidence: 92.9, location: 'Mehsana Highway Entry', district: 'Mehsana',
          latitude: 23.5880, longitude: 72.3693, vehicle_type: 'Sedan', vehicle_color: 'White',
          timestamp: new Date(Date.now() + 1980000).toISOString(), direction: 'NB',
        }},
        { delay: 5000, type: 'demo:event', data: { message: '⚡ Cross-district: Vehicle entered Mehsana', icon: '⚡' } },
        { delay: 7000, type: 'detection:new', data: {
          detection_id: `DET-DEMO-004`, camera_id: 'CAM-022', camera_name: 'Patan Highway Junction Camera',
          plate_number: 'GJ01AB1234', confidence: 98.2, location: 'Patan Highway Junction', district: 'Patan',
          latitude: 23.8400, longitude: 72.1300, vehicle_type: 'Sedan', vehicle_color: 'White',
          timestamp: new Date(Date.now() + 3600000).toISOString(), direction: 'NW',
        }},
        { delay: 8000, type: 'demo:event', data: { message: 'Vehicle detected on CAM-022 (Patan)', icon: '📷' } },
        { delay: 10000, type: 'demo:event', data: { message: 'Complete cross-camera correlation established', icon: '🔗' } },
      ],
    },
    {
      phase: 8,
      name: 'GIS ROUTE',
      description: 'Complete movement route displayed on GIS',
      duration: 6000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Building vehicle route...', icon: '🗺️' } },
        { delay: 2000, type: 'demo:event', data: { message: 'Route: Ahmedabad → Gandhinagar → Mehsana → Patan', icon: '📍' } },
        { delay: 3500, type: 'demo:event', data: { message: 'Route animation rendering on GIS', icon: '🎬' } },
        { delay: 5000, type: 'demo:event', data: { message: '4 districts, 8 cameras, 17 detections', icon: '📊' } },
      ],
    },
    {
      phase: 9,
      name: 'INVESTIGATION',
      description: 'Operator opens Vehicle Intelligence',
      duration: 5000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Operator opens Vehicle Intelligence page', icon: '🔍' } },
        { delay: 2000, type: 'demo:event', data: { message: 'Vehicle profile loaded — complete history', icon: '📋' } },
        { delay: 3500, type: 'demo:event', data: { message: 'Detection timeline, snapshots, and route ready', icon: '📸' } },
      ],
    },
    {
      phase: 10,
      name: 'INCIDENT CREATED',
      description: 'Operator creates incident for investigation',
      duration: 5000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Creating incident INC-2026-DEMO...', icon: '📝' } },
        { delay: 2000, type: 'incident:new', data: {
          incident_id: 'INC-2026-DEMO', title: 'Stolen Vehicle Detected — GJ01AB1234',
          priority: 'CRITICAL', location: 'Multi-district', status: 'OPEN',
          assigned_officer: 'Inspector R. Patel',
        }},
        { delay: 3500, type: 'demo:event', data: { message: 'Incident assigned to Inspector R. Patel', icon: '👮' } },
      ],
    },
    {
      phase: 11,
      name: 'MISSION COMPLETE',
      description: 'Investigation report available',
      duration: 5000,
      events: [
        { delay: 500, type: 'demo:event', data: { message: 'Generating vehicle movement report...', icon: '📄' } },
        { delay: 2000, type: 'demo:event', data: { message: '✅ Report ready for download', icon: '📥' } },
        { delay: 3500, type: 'demo:event', data: { message: '🎯 MISSION SENTRY — DEMONSTRATION COMPLETE', icon: '🎯' } },
      ],
    },
  ];

  let totalDelay = 0;

  for (const phase of phases) {
    // Emit phase start
    const phaseDelay = totalDelay;
    setTimeout(() => {
      if (!demoRunning) return;
      io.emit('demo:phase', {
        phase: phase.phase,
        name: phase.name,
        description: phase.description,
        totalPhases: phases.length,
      });
    }, phaseDelay);

    // Emit phase events
    for (const event of phase.events) {
      setTimeout(() => {
        if (!demoRunning) return;
        io.emit(event.type, event.data);
      }, phaseDelay + event.delay);
    }

    totalDelay += phase.duration;
  }

  // Demo complete
  setTimeout(() => {
    if (!demoRunning) return;
    io.emit('demo:complete', { message: 'Mission Sentry demonstration complete' });
    demoRunning = false;
  }, totalDelay);
}
