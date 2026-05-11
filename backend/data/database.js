const fs = require('fs');
const path = require('path');

const usersSeed = require('./users');
const gameDataSeed = require('./gameData');
const adminSettingsSeed = require('./adminSettings');

const clone = (value) => JSON.parse(JSON.stringify(value));

const resolveDataDirectory = () => {
  const preferredDirectory = process.env.DATA_DIR || __dirname;

  try {
    fs.mkdirSync(preferredDirectory, { recursive: true });
    const testPath = path.join(preferredDirectory, '.write-test');
    fs.writeFileSync(testPath, 'ok');
    fs.unlinkSync(testPath);
    return preferredDirectory;
  } catch (error) {
    return __dirname;
  }
};

const dataDirectory = resolveDataDirectory();
const dbPath = path.join(dataDirectory, 'db.json');

const createSeedDatabase = () => ({
  users: clone(usersSeed),
  gameData: clone(gameDataSeed),
  adminSettings: clone(adminSettingsSeed)
});

const normalizeDatabase = (database) => {
  const normalized = database && typeof database === 'object' ? database : {};

  if (!Array.isArray(normalized.users)) {
    normalized.users = clone(usersSeed);
  }

  // Backfill fields added after launch so existing db.json rows keep working.
  normalized.users = normalized.users.map((user) => ({
    character: null,
    xp: 0,
    pathProgress: {},
    ...user,
  }));

  if (!normalized.gameData || typeof normalized.gameData !== 'object') {
    normalized.gameData = clone(gameDataSeed);
  }

  if (!Array.isArray(normalized.gameData.wordBank)) {
    normalized.gameData.wordBank = clone(gameDataSeed.wordBank);
  }

  if (!normalized.adminSettings || typeof normalized.adminSettings !== 'object') {
    normalized.adminSettings = clone(adminSettingsSeed);
  } else {
    normalized.adminSettings = {
      ...clone(adminSettingsSeed),
      ...normalized.adminSettings,
      appTheme: {
        ...clone(adminSettingsSeed.appTheme),
        ...(normalized.adminSettings.appTheme || {})
      },
      layout: {
        ...clone(adminSettingsSeed.layout),
        ...(normalized.adminSettings.layout || {})
      },
      sounds: {
        ...clone(adminSettingsSeed.sounds),
        ...(normalized.adminSettings.sounds || {})
      },
      notifications: {
        ...clone(adminSettingsSeed.notifications),
        ...(normalized.adminSettings.notifications || {})
      },
      gameSettings: {
        ...clone(adminSettingsSeed.gameSettings),
        ...(normalized.adminSettings.gameSettings || {})
      }
    };
  }

  return normalized;
};

const ensureDatabase = () => {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(createSeedDatabase(), null, 2));
  }
};

const readDatabase = () => {
  ensureDatabase();
  try {
    const database = normalizeDatabase(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
    writeDatabase(database);
    return database;
  } catch (error) {
    const backupPath = path.join(dataDirectory, `db-invalid-${Date.now()}.json`);
    fs.copyFileSync(dbPath, backupPath);
    const database = createSeedDatabase();
    writeDatabase(database);
    return database;
  }
};

const writeDatabase = (database) => {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
  return database;
};

const updateDatabase = (updater) => {
  const database = readDatabase();
  const result = updater(database);
  writeDatabase(database);
  return result;
};

module.exports = {
  readDatabase,
  writeDatabase,
  updateDatabase
};
