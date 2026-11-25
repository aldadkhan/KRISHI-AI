import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
const dataFile = path.join(dataDirectory, 'demo-store.json');

let demoSeeded = false;

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

const savedStore = readStore();
demoSeeded = savedStore.demoSeeded === true;
export const users = new Map((savedStore.users || []).filter(entry =>
  Array.isArray(entry) && typeof entry[0] === 'string' && entry[1] && typeof entry[1] === 'object'
));
export const queryRecords = savedStore.queryRecords || [];

function saveStore() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify({
    users: [...users.entries()],
    queryRecords,
    nextUserId,
    nextQueryId,
    demoSeeded
  }, null, 2));
  fs.renameSync(temporaryFile, dataFile);
}

let nextUserId = savedStore.nextUserId || Math.max(0, ...[...users.values()].map(user => user.id)) + 1;
let nextQueryId = savedStore.nextQueryId || Math.max(0, ...queryRecords.map(record => record.id)) + 1;

if (process.env.DEMO_MODE === 'true' && !demoSeeded) {
  const demoFarmers = [
    { name: 'Anjali Krishnan', district: 'Ernakulam' },
    { name: 'Rajan Nair', district: 'Alappuzha' },
    { name: 'Meera Thomas', district: 'Kottayam' },
    { name: 'Suresh Kumar', district: 'Palakkad' },
    { name: 'Fathima Basheer', district: 'Malappuram' },
    { name: 'Joseph Mathew', district: 'Idukki' }
  ].map(({ name, district }) => {
    const id = nextUserId++;
    const email = `demo.farmer.${id}@example.invalid`;
    const farmer = {
      id,
      name,
      email,
      identifier: email,
      passwordHash: null,
      role: 'farmer',
      district,
      preferred_language: 'en',
      main_crop: null,
      created_at: new Date(Date.now() - id * 86400000).toISOString()
    };
    users.set(email, farmer);
    return farmer;
  });
  const reports = [
    ['Banana', 'Ernakulam', 'Yellowing leaves on young banana plants after several days of rain.', 'Check drainage around the root zone and remove badly affected leaves. Ask the local Agriculture Officer to inspect if symptoms continue.', 'answered'],
    ['Rice', 'Alappuzha', 'Some paddy leaves have brown spots and the plants are growing slowly.', 'Record how quickly the spots are spreading and check water levels. Seek a field diagnosis before applying any treatment.', 'escalation_recommended'],
    ['Coconut', 'Kottayam', 'Tender coconuts are dropping earlier than usual.', 'Check soil moisture and recent weather stress. A local extension officer can help assess nutrition and pest factors.', 'answered'],
    ['Pepper', 'Idukki', 'Pepper vines look wilted even though the soil is wet.', 'Avoid adding more water until drainage is checked. This symptom needs an in-person root and stem inspection.', 'escalation_recommended'],
    ['Rubber', 'Kottayam', 'The bark tapping panel looks unusually dry.', 'Pause tapping on damaged areas and have an experienced extension worker assess the panel before resuming.', 'answered'],
    ['Tomato', 'Palakkad', 'Small insects are visible under tomato leaves.', 'Inspect several plants and note whether leaves are curling. Use local integrated pest management advice before selecting a control.', 'answered'],
    ['Rice', 'Malappuram', 'How can I prepare the field before the next rice planting?', 'Plan field levelling and water management, and check the current local sowing calendar with the Krishi Bhavan.', 'answered'],
    ['Banana', 'Ernakulam', 'The edges of older banana leaves are turning brown.', 'Check irrigation consistency and look for damage on multiple plants. A soil or nutrient assessment can clarify the cause.', 'escalation_recommended'],
    ['Coconut', 'Alappuzha', 'There are dry patches on a few coconut fronds.', 'Photograph the affected fronds and check whether symptoms are isolated or spreading. Request an officer visit for diagnosis.', 'answered'],
    ['Pepper', 'Idukki', 'What should I check after heavy rain in my pepper plot?', 'Inspect drainage, supports and new growth. Avoid field work on slippery slopes and report any rapidly spreading wilt.', 'answered'],
    ['Tomato', 'Palakkad', 'Tomato flowers are falling before fruit forms.', 'Review watering consistency and recent heat conditions. Note the growth stage and ask an extension worker if it persists.', 'escalation_recommended'],
    ['Rubber', 'Kottayam', 'Can I tap rubber trees during persistent rain?', 'Avoid tapping when the panel is wet. Follow local guidance on safe tapping conditions and protect the exposed panel.', 'answered']
  ];

  reports.forEach(([crop, district, query_text, ai_response, status], index) => {
    const farmer = demoFarmers[index % demoFarmers.length];
    queryRecords.push({
      id: nextQueryId++,
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      identifier: farmer.identifier,
      query_text,
      language: 'en',
      crop,
      district,
      image_url: null,
      ai_response,
      confidence: status === 'answered' ? 78 : 42,
      status,
      created_at: new Date(Date.now() - index * 6 * 3600000).toISOString()
    });
  });
  demoSeeded = true;
  saveStore();
}

export function getUser(identifier) {
  return users.get(identifier);
}

export function getUserById(id) {
  const targetId = Number(id);
  return [...users.values()].find(user => Number(user.id) === targetId) || null;
}

export function updateUserProfile(id, updates) {
  const user = getUserById(id);
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  const nextIdentifier = updates.email || user.email || user.identifier;
  const previousIdentifier = user.identifier;

  if (previousIdentifier !== nextIdentifier) {
    users.delete(previousIdentifier);
  }

  updatedUser.identifier = nextIdentifier;
  users.set(nextIdentifier, updatedUser);
  saveStore();
  return updatedUser;
}

export function addUser({ name, email, passwordHash, role = 'farmer' }) {
  const user = {
    id: nextUserId++,
    name,
    email,
    identifier: email,
    passwordHash,
    role,
    district: null,
    preferred_language: 'en',
    main_crop: null,
    created_at: new Date().toISOString()
  };
  users.set(email, user);
  saveStore();
  return user;
}

export function addOtpUser(identifier) {
  const user = users.get(identifier);
  if (user) return user;

  const farmer = {
    id: nextUserId++,
    name: null,
    email: identifier.includes('@') ? identifier : null,
    identifier,
    passwordHash: null,
    role: 'farmer',
    district: null,
    preferred_language: 'en',
    main_crop: null,
    created_at: new Date().toISOString()
  };
  users.set(identifier, farmer);
  saveStore();
  return farmer;
}

export function addQuery(query) {
  const record = { id: nextQueryId++, created_at: new Date().toISOString(), ...query };
  queryRecords.unshift(record);
  saveStore();
  return record;
}

export function getFarmerCount() {
  return [...users.values()].filter(user => user.role === 'farmer').length;
}