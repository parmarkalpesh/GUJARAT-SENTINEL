// ============================================================
// Gujarat Sentinel — Database Seed
// Realistic synthetic data for 50 cameras across Gujarat
// ⚠ DEMONSTRATION DATA — Not real government records
// ============================================================
import { v4 as uuid } from 'uuid';
import bcryptjs from 'bcryptjs';
import { initDatabase, getDb, closeDatabase } from './db';

// ── Gujarat Locations ──
const locations = [
  { name: 'SG Highway Junction', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Ashram Road', district: 'Ahmedabad', lat: 23.0258, lng: 72.5800 },
  { name: 'CG Road', district: 'Ahmedabad', lat: 23.0300, lng: 72.5650 },
  { name: 'Maninagar Circle', district: 'Ahmedabad', lat: 23.0000, lng: 72.6000 },
  { name: 'Naroda GIDC', district: 'Ahmedabad', lat: 23.0800, lng: 72.6500 },
  { name: 'Satellite Road', district: 'Ahmedabad', lat: 23.0150, lng: 72.5200 },
  { name: 'Vastrapur Lake', district: 'Ahmedabad', lat: 23.0350, lng: 72.5280 },
  { name: 'Kalupur Station', district: 'Ahmedabad', lat: 23.0380, lng: 72.6050 },
  { name: 'Paldi Cross Road', district: 'Ahmedabad', lat: 23.0100, lng: 72.5600 },
  { name: 'Bopal Junction', district: 'Ahmedabad', lat: 23.0310, lng: 72.4650 },
  { name: 'Gandhinagar Sector 21', district: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
  { name: 'Infocity Circle', district: 'Gandhinagar', lat: 23.2100, lng: 72.6800 },
  { name: 'Akshardham Temple Road', district: 'Gandhinagar', lat: 23.2225, lng: 72.6550 },
  { name: 'Sector 7 Circle', district: 'Gandhinagar', lat: 23.2300, lng: 72.6400 },
  { name: 'CH-1 Circle', district: 'Gandhinagar', lat: 23.2180, lng: 72.6500 },
  { name: 'Mehsana Highway Entry', district: 'Mehsana', lat: 23.5880, lng: 72.3693 },
  { name: 'Mehsana Bus Stand', district: 'Mehsana', lat: 23.5920, lng: 72.3750 },
  { name: 'Modhera Road', district: 'Mehsana', lat: 23.5800, lng: 72.3800 },
  { name: 'Mehsana Railway Station', district: 'Mehsana', lat: 23.5950, lng: 72.3700 },
  { name: 'Mehsana GIDC', district: 'Mehsana', lat: 23.6000, lng: 72.3600 },
  { name: 'Patan Main Road', district: 'Patan', lat: 23.8500, lng: 72.1266 },
  { name: 'Patan Rani Ki Vav', district: 'Patan', lat: 23.8590, lng: 72.1020 },
  { name: 'Patan Highway Junction', district: 'Patan', lat: 23.8400, lng: 72.1300 },
  { name: 'Rajkot Kalavad Road', district: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  { name: 'Rajkot Race Course', district: 'Rajkot', lat: 22.2950, lng: 70.7950 },
  { name: 'Rajkot University Road', district: 'Rajkot', lat: 22.3100, lng: 70.7800 },
  { name: 'Rajkot Gondal Road', district: 'Rajkot', lat: 22.2800, lng: 70.8100 },
  { name: 'Jamnagar Teen Batti', district: 'Jamnagar', lat: 22.4707, lng: 70.0577 },
  { name: 'Jamnagar Lakhota Lake', district: 'Jamnagar', lat: 22.4750, lng: 70.0650 },
  { name: 'Dwarka Temple Road', district: 'Dwarka', lat: 22.2394, lng: 68.9678 },
  { name: 'Dwarka Beach Road', district: 'Dwarka', lat: 22.2350, lng: 68.9600 },
  { name: 'Somnath Temple Gate', district: 'Somnath', lat: 20.8880, lng: 70.4013 },
  { name: 'Somnath Beach Rd', district: 'Somnath', lat: 20.8850, lng: 70.4050 },
  { name: 'Dahod Bus Terminus', district: 'Dahod', lat: 22.8372, lng: 74.2544 },
  { name: 'Dahod Highway', district: 'Dahod', lat: 22.8400, lng: 74.2600 },
  { name: 'Valsad Station Road', district: 'Valsad', lat: 20.5992, lng: 72.9342 },
  { name: 'Valsad NH8 Junction', district: 'Valsad', lat: 20.6050, lng: 72.9400 },
  { name: 'Surat Ring Road', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Surat Diamond Bourse', district: 'Surat', lat: 21.1800, lng: 72.8200 },
  { name: 'Surat VIP Road', district: 'Surat', lat: 21.1600, lng: 72.8400 },
  { name: 'Vadodara Alkapuri', district: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Vadodara Fatehgunj', district: 'Vadodara', lat: 22.3200, lng: 73.1900 },
  { name: 'Vadodara Sayajigunj', district: 'Vadodara', lat: 22.3100, lng: 73.2000 },
  { name: 'Bhuj Station Road', district: 'Kutch', lat: 23.2420, lng: 69.6669 },
  { name: 'Anand Charasta', district: 'Anand', lat: 22.5645, lng: 72.9289 },
  { name: 'Nadiad Tower', district: 'Kheda', lat: 22.6916, lng: 72.8634 },
  { name: 'Bharuch Bridge', district: 'Bharuch', lat: 21.6900, lng: 72.9700 },
  { name: 'Junagadh Uperkot', district: 'Junagadh', lat: 21.5222, lng: 70.4579 },
  { name: 'Porbandar MG Road', district: 'Porbandar', lat: 21.6417, lng: 69.6293 },
  { name: 'Surendranagar Highway', district: 'Surendranagar', lat: 22.7287, lng: 71.6370 },
];

const departments = [
  { name: 'Home Department', code: 'HOME' },
  { name: 'RTO', code: 'RTO' },
  { name: 'Food & Civil Supplies', code: 'FCS' },
  { name: 'Municipal Corporation', code: 'MUNI' },
  { name: 'Gujarat Police', code: 'POLICE' },
  { name: 'Transport Department', code: 'TRANS' },
  { name: 'Urban Development', code: 'URBAN' },
];

const vendors = ['Hikvision', 'Dahua', 'CP Plus', 'Bosch', 'Axis', 'Honeywell', 'Pelco', 'Samsung'];
const vmsOptions = ['Milestone XProtect', 'Genetec', 'iVMS-4200', 'SmartPSS', 'BriefCam', 'Digifort', 'Nx Witness', 'Custom VMS'];
const cameraTypes: Array<'IP' | 'ANALOG' | 'PTZ' | 'DOME' | 'BULLET'> = ['IP', 'PTZ', 'DOME', 'BULLET', 'IP'];
const protocols: Array<'RTSP' | 'ONVIF' | 'HTTP'> = ['RTSP', 'ONVIF', 'RTSP'];

// ── Sample vehicles ──
const sampleVehicles = [
  { plate: 'GJ01AB1234', type: 'Sedan', color: 'White' },
  { plate: 'GJ01CD5678', type: 'SUV', color: 'Black' },
  { plate: 'GJ03EF9012', type: 'Hatchback', color: 'Silver' },
  { plate: 'GJ05GH3456', type: 'Truck', color: 'Blue' },
  { plate: 'GJ06JK7890', type: 'Auto', color: 'Yellow' },
  { plate: 'GJ01MN4567', type: 'Sedan', color: 'Red' },
  { plate: 'GJ02PQ8901', type: 'SUV', color: 'Grey' },
  { plate: 'GJ03RS2345', type: 'Van', color: 'White' },
  { plate: 'GJ06TU6789', type: 'Bike', color: 'Black' },
  { plate: 'GJ01VW0123', type: 'Bus', color: 'Red' },
];

function normalizePlate(plate: string): string {
  return plate.replace(/[\s-]/g, '').toUpperCase();
}

async function seed() {
  console.log('\n🌱 Gujarat Sentinel — Seeding Database...');
  console.log('⚠  DEMONSTRATION DATA — Not real government records\n');

  initDatabase();
  const db = getDb();

  // Clear existing data
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM system_metrics;
    DELETE FROM events;
    DELETE FROM incidents;
    DELETE FROM alerts;
    DELETE FROM vehicle_detections;
    DELETE FROM watchlist_entries;
    DELETE FROM cameras;
    DELETE FROM departments;
    DELETE FROM integrations;
    DELETE FROM users;
  `);

  // ── Seed Users ──
  console.log('👤 Seeding users...');
  const passwordHash = bcryptjs.hashSync('admin123', 10);
  const operatorHash = bcryptjs.hashSync('operator123', 10);

  const users = [
    { id: uuid(), username: 'admin', email: 'admin@sentinel.guj.gov.in', password_hash: passwordHash, full_name: 'System Administrator', role: 'SUPER_ADMIN', department: 'Home Department' },
    { id: uuid(), username: 'sp_ahmedabad', email: 'sp.ahmedabad@sentinel.guj.gov.in', password_hash: passwordHash, full_name: 'SP Ahmedabad', role: 'POLICE_ADMIN', department: 'Gujarat Police' },
    { id: uuid(), username: 'operator1', email: 'operator1@sentinel.guj.gov.in', password_hash: operatorHash, full_name: 'Control Room Operator 1', role: 'CONTROL_ROOM_OPERATOR', department: 'Home Department' },
    { id: uuid(), username: 'investigator1', email: 'inv1@sentinel.guj.gov.in', password_hash: operatorHash, full_name: 'Inspector R. Patel', role: 'INVESTIGATOR', department: 'Gujarat Police' },
    { id: uuid(), username: 'rto_user', email: 'rto@sentinel.guj.gov.in', password_hash: operatorHash, full_name: 'RTO Officer', role: 'DEPARTMENT_USER', department: 'RTO' },
    { id: uuid(), username: 'viewer', email: 'viewer@sentinel.guj.gov.in', password_hash: operatorHash, full_name: 'View Only User', role: 'VIEW_ONLY', department: 'General' },
  ];

  const insertUser = db.prepare(`INSERT INTO users (id, username, email, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  for (const u of users) {
    insertUser.run(u.id, u.username, u.email, u.password_hash, u.full_name, u.role, u.department);
  }

  // ── Seed Departments ──
  console.log('🏛️  Seeding departments...');
  const insertDept = db.prepare(`INSERT INTO departments (id, name, code, description) VALUES (?, ?, ?, ?)`);
  for (const d of departments) {
    insertDept.run(uuid(), d.name, d.code, `${d.name} CCTV Operations`);
  }

  // ── Seed 50 Cameras ──
  console.log('📷 Seeding 50 cameras...');
  const insertCamera = db.prepare(`
    INSERT INTO cameras (id, camera_id, name, department, location, district, latitude, longitude, camera_type, vendor, model, ip_address, protocol, vms, nvr, resolution, fps, storage_type, retention_days, installation_date, amc_status, status, health_status, ai_capabilities, last_heartbeat, stream_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cameraList: Array<{ cameraId: string; location: string; district: string; lat: number; lng: number }> = [];

  for (let i = 0; i < 50; i++) {
    const loc = locations[i];
    const dept = departments[i % departments.length];
    const vendor = vendors[i % vendors.length];
    const vms = vmsOptions[i % vmsOptions.length];
    const cameraType = cameraTypes[i % cameraTypes.length];
    const protocol = protocols[i % protocols.length];
    const camNum = String(i + 1).padStart(3, '0');
    const cameraId = `CAM-${camNum}`;
    const isOffline = i === 12 || i === 27 || i === 43; // 3 cameras offline
    const isWarning = i === 8 || i === 31;
    const status = isOffline ? 'OFFLINE' : isWarning ? 'WARNING' : 'ONLINE';
    const health = isOffline ? 'CRITICAL' : isWarning ? 'WARNING' : 'HEALTHY';

    cameraList.push({ cameraId, location: loc.name, district: loc.district, lat: loc.lat, lng: loc.lng });

    insertCamera.run(
      uuid(), cameraId, `${loc.name} Camera`, dept.name, loc.name, loc.district,
      loc.lat, loc.lng, cameraType, vendor, `${vendor}-${cameraType}-${camNum}`,
      `192.168.${Math.floor(i / 255)}.${(i % 255) + 1}`, protocol, vms,
      `NVR-${loc.district.substring(0, 3).toUpperCase()}-${Math.ceil((i + 1) / 5)}`,
      i % 3 === 0 ? '4K' : i % 3 === 1 ? '1080p' : '720p',
      i % 2 === 0 ? 30 : 25,
      i % 4 === 0 ? 'CLOUD' : i % 4 === 1 ? 'NVR' : i % 4 === 2 ? 'LOCAL' : 'HYBRID',
      i % 3 === 0 ? 30 : i % 3 === 1 ? 15 : 7,
      `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
      i % 5 === 0 ? 'EXPIRED' : 'ACTIVE',
      status, health,
      'ANPR,VEHICLE_DETECTION,OBJECT_DETECTION',
      isOffline ? null : new Date().toISOString(),
      `rtsp://192.168.${Math.floor(i / 255)}.${(i % 255) + 1}:554/stream1`
    );
  }

  // ── Seed Watchlist ──
  console.log('🔍 Seeding watchlist...');
  const insertWatchlist = db.prepare(`
    INSERT INTO watchlist_entries (id, watchlist_id, category, entity_type, vehicle_number, vehicle_type, vehicle_color, case_number, status, priority, department, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const watchlistData = [
    { wid: 'WL-2026-001', category: 'STOLEN_VEHICLE', vehicle: 'GJ01AB1234', type: 'Sedan', color: 'White', case: 'CR-2026-AHM-4521', priority: 'CRITICAL', notes: 'Stolen from Satellite Road, Ahmedabad on 2026-08-15. White Honda City.' },
    { wid: 'WL-2026-002', category: 'BLACKLISTED_VEHICLE', vehicle: 'GJ05GH3456', type: 'Truck', color: 'Blue', case: 'CR-2026-RAJ-0891', priority: 'HIGH', notes: 'Vehicle involved in smuggling case. Blue Tata truck.' },
    { wid: 'WL-2026-003', category: 'STOLEN_VEHICLE', vehicle: 'GJ03EF9012', type: 'Hatchback', color: 'Silver', case: 'CR-2026-GNR-1234', priority: 'HIGH', notes: 'Stolen from Gandhinagar. Silver Maruti Swift.' },
    { wid: 'WL-2026-004', category: 'SUSPECT', vehicle: 'GJ06JK7890', type: 'Auto', color: 'Yellow', case: 'CR-2026-SUR-5678', priority: 'MEDIUM', notes: 'Suspect vehicle in robbery case.' },
    { wid: 'WL-2026-005', category: 'BLACKLISTED_VEHICLE', vehicle: 'GJ01MN4567', type: 'Sedan', color: 'Red', case: 'CR-2026-AHM-8901', priority: 'LOW', notes: 'Repeated traffic violations. Red Hyundai Verna.' },
  ];

  for (const w of watchlistData) {
    insertWatchlist.run(uuid(), w.wid, w.category, 'VEHICLE', w.vehicle, w.type, w.color, w.case, 'ACTIVE', w.priority, 'Gujarat Police', w.notes);
  }

  // ── Seed Vehicle Detections for GJ01AB1234 journey ──
  console.log('🚗 Seeding vehicle detections (primary demo journey)...');
  const insertDetection = db.prepare(`
    INSERT INTO vehicle_detections (id, detection_id, camera_id, plate_number, plate_normalized, timestamp, latitude, longitude, location, district, vehicle_type, vehicle_color, confidence, direction, watchlist_match, watchlist_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Primary journey: GJ01AB1234 across Gujarat
  const primaryJourney = [
    { cam: 'CAM-001', time: '2026-08-30T10:05:22', conf: 96.7, dir: 'NB' },
    { cam: 'CAM-003', time: '2026-08-30T10:08:45', conf: 94.2, dir: 'NB' },
    { cam: 'CAM-007', time: '2026-08-30T10:16:41', conf: 97.1, dir: 'NB' },
    { cam: 'CAM-009', time: '2026-08-30T10:22:30', conf: 93.8, dir: 'NW' },
    { cam: 'CAM-011', time: '2026-08-30T10:28:15', conf: 95.5, dir: 'NB' },
    { cam: 'CAM-014', time: '2026-08-30T10:32:50', conf: 96.4, dir: 'NB' },
    { cam: 'CAM-015', time: '2026-08-30T10:38:17', conf: 92.9, dir: 'NB' },
    { cam: 'CAM-016', time: '2026-08-30T10:42:33', conf: 95.8, dir: 'NW' },
    { cam: 'CAM-017', time: '2026-08-30T10:48:05', conf: 94.6, dir: 'NB' },
    { cam: 'CAM-018', time: '2026-08-30T10:55:20', conf: 97.3, dir: 'NW' },
    { cam: 'CAM-019', time: '2026-08-30T11:00:00', conf: 96.1, dir: 'NB' },
    { cam: 'CAM-020', time: '2026-08-30T11:02:30', conf: 93.4, dir: 'NB' },
    { cam: 'CAM-021', time: '2026-08-30T11:04:53', conf: 98.2, dir: 'NW' },
    { cam: 'CAM-022', time: '2026-08-30T11:08:10', conf: 95.0, dir: 'NB' },
    { cam: 'CAM-023', time: '2026-08-30T11:12:45', conf: 96.8, dir: 'NW' },
    { cam: 'CAM-005', time: '2026-08-30T14:32:15', conf: 96.4, dir: 'SB' },
    { cam: 'CAM-002', time: '2026-08-30T15:10:22', conf: 97.5, dir: 'SB' },
  ];

  for (const det of primaryJourney) {
    const cam = cameraList.find(c => c.cameraId === det.cam);
    if (cam) {
      insertDetection.run(
        uuid(), `DET-${uuid().substring(0, 8).toUpperCase()}`, det.cam,
        'GJ01AB1234', 'GJ01AB1234', det.time,
        cam.lat, cam.lng, cam.location, cam.district,
        'Sedan', 'White', det.conf, det.dir, 1, 'WL-2026-001'
      );
    }
  }

  // Secondary vehicle detections (random vehicles)
  const today = '2026-08-30';
  let detectionCount = 0;
  for (const vehicle of sampleVehicles) {
    const numDetections = 3 + Math.floor(Math.random() * 8);
    for (let d = 0; d < numDetections; d++) {
      const camIdx = Math.floor(Math.random() * 50);
      const cam = cameraList[camIdx];
      const hour = 6 + Math.floor(Math.random() * 16);
      const min = Math.floor(Math.random() * 60);
      const sec = Math.floor(Math.random() * 60);
      const timestamp = `${today}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      const isWatchlisted = watchlistData.some(w => w.vehicle === vehicle.plate);
      const watchId = isWatchlisted ? watchlistData.find(w => w.vehicle === vehicle.plate)?.wid || null : null;

      insertDetection.run(
        uuid(), `DET-${uuid().substring(0, 8).toUpperCase()}`, cam.cameraId,
        vehicle.plate, normalizePlate(vehicle.plate), timestamp,
        cam.lat, cam.lng, cam.location, cam.district,
        vehicle.type, vehicle.color, 85 + Math.random() * 14,
        ['NB', 'SB', 'EB', 'WB'][Math.floor(Math.random() * 4)],
        isWatchlisted ? 1 : 0, watchId
      );
      detectionCount++;
    }
  }
  console.log(`   → ${primaryJourney.length + detectionCount} detections created`);

  // ── Seed Alerts ──
  console.log('🚨 Seeding alerts...');
  const insertAlert = db.prepare(`
    INSERT INTO alerts (id, alert_id, type, priority, camera_id, camera_name, location, district, latitude, longitude, timestamp, detected_entity, entity_type, confidence, watchlist_id, watchlist_category, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alertsData = [
    { aid: 'ALT-2026-0192', type: 'WATCHLIST_MATCH', priority: 'CRITICAL', cam: 'CAM-001', entity: 'GJ01AB1234', conf: 96.7, wid: 'WL-2026-001', wcat: 'STOLEN_VEHICLE', status: 'ACKNOWLEDGED', time: '2026-08-30T10:05:22' },
    { aid: 'ALT-2026-0193', type: 'STOLEN_VEHICLE', priority: 'CRITICAL', cam: 'CAM-014', entity: 'GJ01AB1234', conf: 96.4, wid: 'WL-2026-001', wcat: 'STOLEN_VEHICLE', status: 'NEW', time: '2026-08-30T14:32:15' },
    { aid: 'ALT-2026-0194', type: 'WATCHLIST_MATCH', priority: 'HIGH', cam: 'CAM-024', entity: 'GJ05GH3456', conf: 91.2, wid: 'WL-2026-002', wcat: 'BLACKLISTED_VEHICLE', status: 'INVESTIGATING', time: '2026-08-30T11:15:30' },
    { aid: 'ALT-2026-0195', type: 'WATCHLIST_MATCH', priority: 'HIGH', cam: 'CAM-011', entity: 'GJ03EF9012', conf: 93.8, wid: 'WL-2026-003', wcat: 'STOLEN_VEHICLE', status: 'NEW', time: '2026-08-30T12:45:10' },
    { aid: 'ALT-2026-0196', type: 'CAMERA_OFFLINE', priority: 'MEDIUM', cam: 'CAM-013', entity: 'CAM-013', conf: 100, wid: null, wcat: null, status: 'NEW', time: '2026-08-30T09:00:00' },
    { aid: 'ALT-2026-0197', type: 'CAMERA_OFFLINE', priority: 'MEDIUM', cam: 'CAM-028', entity: 'CAM-028', conf: 100, wid: null, wcat: null, status: 'ACKNOWLEDGED', time: '2026-08-30T08:30:00' },
    { aid: 'ALT-2026-0198', type: 'UNUSUAL_ACTIVITY', priority: 'LOW', cam: 'CAM-038', entity: 'Motion Cluster', conf: 78.5, wid: null, wcat: null, status: 'DISMISSED', time: '2026-08-30T03:22:00' },
    { aid: 'ALT-2026-0199', type: 'WATCHLIST_MATCH', priority: 'MEDIUM', cam: 'CAM-045', entity: 'GJ06JK7890', conf: 88.3, wid: 'WL-2026-004', wcat: 'SUSPECT', status: 'NEW', time: '2026-08-30T13:10:45' },
  ];

  for (const a of alertsData) {
    const cam = cameraList.find(c => c.cameraId === a.cam);
    if (cam) {
      insertAlert.run(
        uuid(), a.aid, a.type, a.priority, a.cam, `${cam.location} Camera`,
        cam.location, cam.district, cam.lat, cam.lng, a.time,
        a.entity, 'VEHICLE', a.conf, a.wid, a.wcat, a.status
      );
    }
  }

  // ── Seed Incidents ──
  console.log('📋 Seeding incidents...');
  const insertIncident = db.prepare(`
    INSERT INTO incidents (id, incident_id, alert_id, title, priority, location, district, assigned_officer, status, description, related_vehicles, timeline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIncident.run(
    uuid(), 'INC-2026-0001', 'ALT-2026-0192',
    'Stolen Vehicle Detected — GJ01AB1234',
    'CRITICAL', 'SG Highway Junction', 'Ahmedabad',
    'Inspector R. Patel', 'INVESTIGATING',
    'Stolen white Honda City (GJ01AB1234) detected on SG Highway Junction camera at 10:05:22. Vehicle has been tracked moving northward through Gandhinagar and Mehsana. Currently last seen near Patan. All units alerted.',
    'GJ01AB1234',
    JSON.stringify([
      { time: '10:05:22', event: 'Vehicle first detected on CAM-001 (SG Highway Junction)' },
      { time: '10:05:23', event: 'ANPR completed — Plate: GJ01AB1234, Confidence: 96.7%' },
      { time: '10:05:24', event: 'Watchlist match — STOLEN VEHICLE (WL-2026-001)' },
      { time: '10:05:25', event: 'Critical alert generated (ALT-2026-0192)' },
      { time: '10:08:00', event: 'Alert acknowledged by Operator 1' },
      { time: '10:10:00', event: 'Incident created, assigned to Inspector R. Patel' },
      { time: '10:16:41', event: 'Vehicle detected on CAM-007 (Ashram Road)' },
      { time: '10:38:17', event: 'Vehicle detected on CAM-015 (Mehsana Highway Entry) — Cross-district movement confirmed' },
      { time: '11:04:53', event: 'Vehicle detected on CAM-022 (Patan Highway Junction)' },
    ])
  );

  // ── Seed Events ──
  console.log('📊 Seeding events...');
  const insertEvent = db.prepare(`
    INSERT INTO events (id, event_id, event_type, source, source_id, description, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const eventsData = [
    { type: 'VEHICLE_DETECTED', source: 'ANPR', sid: 'CAM-001', desc: 'Vehicle GJ01AB1234 detected', time: '2026-08-30T10:05:22' },
    { type: 'ANPR_COMPLETED', source: 'ANPR', sid: 'CAM-001', desc: 'ANPR: GJ01AB1234 (96.7%)', time: '2026-08-30T10:05:23' },
    { type: 'WATCHLIST_MATCHED', source: 'WATCHLIST', sid: 'WL-2026-001', desc: 'Watchlist match: STOLEN VEHICLE', time: '2026-08-30T10:05:24' },
    { type: 'ALERT_CREATED', source: 'ALERT', sid: 'ALT-2026-0192', desc: 'Critical alert: Stolen Vehicle GJ01AB1234', time: '2026-08-30T10:05:25' },
    { type: 'ALERT_ACKNOWLEDGED', source: 'OPERATOR', sid: 'USER-102', desc: 'Alert ALT-2026-0192 acknowledged', time: '2026-08-30T10:08:00' },
    { type: 'INCIDENT_CREATED', source: 'INCIDENT', sid: 'INC-2026-0001', desc: 'Incident created for stolen vehicle', time: '2026-08-30T10:10:00' },
    { type: 'VEHICLE_DETECTED', source: 'ANPR', sid: 'CAM-007', desc: 'Vehicle GJ01AB1234 detected (cross-camera)', time: '2026-08-30T10:16:41' },
    { type: 'VEHICLE_DETECTED', source: 'ANPR', sid: 'CAM-015', desc: 'Vehicle GJ01AB1234 detected (Mehsana)', time: '2026-08-30T10:38:17' },
    { type: 'VEHICLE_DETECTED', source: 'ANPR', sid: 'CAM-022', desc: 'Vehicle GJ01AB1234 detected (Patan)', time: '2026-08-30T11:04:53' },
    { type: 'CAMERA_DISCONNECTED', source: 'HEALTH', sid: 'CAM-013', desc: 'Camera CAM-013 offline', time: '2026-08-30T09:00:00' },
    { type: 'CAMERA_DISCONNECTED', source: 'HEALTH', sid: 'CAM-028', desc: 'Camera CAM-028 offline', time: '2026-08-30T08:30:00' },
    { type: 'SYSTEM_WARNING', source: 'SYSTEM', sid: 'GPU-01', desc: 'GPU utilization exceeded 85%', time: '2026-08-30T11:30:00' },
  ];

  for (const e of eventsData) {
    insertEvent.run(uuid(), `EVT-${uuid().substring(0, 8).toUpperCase()}`, e.type, e.source, e.sid, e.desc, null, e.time);
  }

  // ── Seed Integrations ──
  console.log('🔗 Seeding integrations...');
  const insertIntegration = db.prepare(`
    INSERT INTO integrations (id, name, system_type, status, last_sync, records_count, endpoint, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const integrationsData = [
    { name: 'VAHAN', type: 'VEHICLE_DATABASE', status: 'CONNECTED', sync: '2026-08-30T14:31:04', records: 12458921, endpoint: 'https://vahan.parivahan.gov.in/api', desc: 'National Vehicle Registration Database' },
    { name: 'SARTHI', type: 'LICENSE_DATABASE', status: 'CONNECTED', sync: '2026-08-30T14:28:00', records: 8234567, endpoint: 'https://sarathi.parivahan.gov.in/api', desc: 'Driving License Database' },
    { name: 'eGujCop', type: 'POLICE_DATABASE', status: 'SYNCING', sync: '2026-08-30T14:25:00', records: 2456789, endpoint: 'https://egujcop.gujarat.gov.in/api', desc: 'Gujarat Police CCTNS Platform' },
    { name: 'AFIS', type: 'FINGERPRINT_DATABASE', status: 'CONNECTED', sync: '2026-08-30T13:00:00', records: 1890234, endpoint: 'https://afis.ncrb.gov.in/api', desc: 'Automated Fingerprint Identification System' },
    { name: 'NAFIS', type: 'FINGERPRINT_DATABASE', status: 'DISCONNECTED', sync: null, records: 0, endpoint: 'https://nafis.ncrb.gov.in/api', desc: 'National Automated Fingerprint Identification System' },
  ];

  for (const i of integrationsData) {
    insertIntegration.run(uuid(), i.name, i.type, i.status, i.sync, i.records, i.endpoint, i.desc);
  }

  // ── Seed System Metrics ──
  console.log('📈 Seeding system metrics...');
  const insertMetrics = db.prepare(`
    INSERT INTO system_metrics (id, cpu_usage, memory_usage, gpu_usage, storage_usage, network_in, network_out, active_streams, ai_inference_fps, queue_length, alert_latency_ms, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMetrics.run(uuid(), 41, 62, 74, 58, 1250, 890, 47, 31, 12, 180, new Date().toISOString());

  // ── Summary ──
  const counts = {
    users: (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c,
    cameras: (db.prepare('SELECT COUNT(*) as c FROM cameras').get() as any).c,
    detections: (db.prepare('SELECT COUNT(*) as c FROM vehicle_detections').get() as any).c,
    watchlist: (db.prepare('SELECT COUNT(*) as c FROM watchlist_entries').get() as any).c,
    alerts: (db.prepare('SELECT COUNT(*) as c FROM alerts').get() as any).c,
    incidents: (db.prepare('SELECT COUNT(*) as c FROM incidents').get() as any).c,
    events: (db.prepare('SELECT COUNT(*) as c FROM events').get() as any).c,
    integrations: (db.prepare('SELECT COUNT(*) as c FROM integrations').get() as any).c,
  };

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log(`   Users:       ${counts.users}`);
  console.log(`   Cameras:     ${counts.cameras}`);
  console.log(`   Detections:  ${counts.detections}`);
  console.log(`   Watchlist:   ${counts.watchlist}`);
  console.log(`   Alerts:      ${counts.alerts}`);
  console.log(`   Incidents:   ${counts.incidents}`);
  console.log(`   Events:      ${counts.events}`);
  console.log(`   Integrations:${counts.integrations}`);
  console.log('─────────────────────────────────\n');

  closeDatabase();
}

seed().catch(console.error);
