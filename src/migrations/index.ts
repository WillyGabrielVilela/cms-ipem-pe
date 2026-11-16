import * as migration_20261112_154351_initial_schema from './20261112_154351_initial_schema';
import * as migration_20261113_121212_media_storage_fields from './20261113_121212_media_storage_fields';

export const migrations = [
  {
    up: migration_20261112_154351_initial_schema.up,
    down: migration_20261112_154351_initial_schema.down,
    name: '20261112_154351_initial_schema',
  },
  {
    up: migration_20261113_121212_media_storage_fields.up,
    down: migration_20261113_121212_media_storage_fields.down,
    name: '20261113_121212_media_storage_fields'
  },
];
