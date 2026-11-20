const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const cloudinary = require('../config/cloudinary');
const db = require('../config/db');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const MAPPING_FILE = path.join(__dirname, 'migration_mapping.json');

// List of tables and columns to update in the database
const TARGET_COLUMNS = [
  { table: 'items', column: 'image_url' },
  { table: 'users_details', column: 'profile_pic_url' },
  { table: 'users_details', column: 'coverphoto' },
  { table: 'users_details', column: 'nic_photo_front_url' },
  { table: 'users_details', column: 'nic_photo_back_url' },
  { table: 'posts', column: 'image_url' },
  { table: 'notifications', column: 'image_url' }
];

async function runMigration() {
  console.log('🚀 Starting Cloudinary Image Migration...');

  // 1. Check Cloudinary credentials
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary environment variables are missing in .env!');
    process.exit(1);
  }

  // 2. Check Database connection
  try {
    const conn = await db.getConnection();
    console.log('✅ Connected to Aiven MySQL database.');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }

  // 3. Load existing mapping if any (makes script resume-able)
  let mapping = {};
  if (fs.existsSync(MAPPING_FILE)) {
    try {
      mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
      console.log(`ℹ️ Loaded existing mapping with ${Object.keys(mapping).length} files.`);
    } catch (e) {
      console.warn('⚠️ Could not parse existing mapping file, starting fresh.');
    }
  }

  // 4. Scan uploads folder
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('❌ uploads/ directory not found at:', UPLOADS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter(file => {
    // Ignore hidden files like .DS_Store
    return !file.startsWith('.') && fs.statSync(path.join(UPLOADS_DIR, file)).isFile();
  });

  console.log(`📁 Found ${files.length} files in uploads/ folder.`);

  // 5. Upload files to Cloudinary
  let uploadCount = 0;
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(UPLOADS_DIR, filename);

    if (mapping[filename]) {
      // Already uploaded
      continue;
    }

    try {
      console.log(`[${i + 1}/${files.length}] Uploading: ${filename}...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'renthub_uploads',
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto'
      });

      mapping[filename] = result.secure_url;
      uploadCount++;

      // Save mapping file incrementally
      fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf8');
    } catch (uploadErr) {
      console.error(`❌ Failed to upload ${filename}:`, uploadErr.message);
    }
  }

  console.log(`\n🎉 Uploaded ${uploadCount} new files to Cloudinary. Total mapped: ${Object.keys(mapping).length}`);

  // 6. Update Aiven Database Records
  console.log('\n🔄 Updating Aiven Database records...');
  let totalRowsUpdated = 0;

  for (const { table, column } of TARGET_COLUMNS) {
    // Check if table exists
    try {
      const [tableCheck] = await db.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        [table]
      );
      if (tableCheck[0].count === 0) {
        console.log(`⏭️ Table '${table}' does not exist, skipping.`);
        continue;
      }

      // Check if column exists
      const [colCheck] = await db.query(
        `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column]
      );
      if (colCheck[0].count === 0) {
        console.log(`⏭️ Column '${column}' in table '${table}' does not exist, skipping.`);
        continue;
      }

      // Update matching rows
      let tableUpdates = 0;
      for (const [filename, secureUrl] of Object.entries(mapping)) {
        // Match '/uploads/filename' or 'uploads/filename' but ignore already migrated URLs (starting with http)
        const [res] = await db.query(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` LIKE ? AND \`${column}\` NOT LIKE 'http%'`,
          [secureUrl, `%${filename}`]
        );
        if (res.affectedRows > 0) {
          tableUpdates += res.affectedRows;
        }
      }

      console.log(`✅ Table '${table}' column '${column}': Updated ${tableUpdates} rows.`);
      totalRowsUpdated += tableUpdates;
    } catch (dbErr) {
      console.error(`❌ Error updating ${table}.${column}:`, dbErr.message);
    }
  }

  console.log(`\n✨ Migration completed successfully! Total database rows updated: ${totalRowsUpdated}`);
  console.log(`📄 Mapping log saved at: ${MAPPING_FILE}`);
  console.log(`🔒 Your original uploads/ folder is safe and untouched.\n`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
