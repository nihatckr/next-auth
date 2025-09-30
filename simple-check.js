// Basit database kontrolü
const fs = require('fs');
const path = require('path');

console.log('🔍 Database durumunu kontrol ediyorum...');

// Prisma schema'yı kontrol et
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Prisma schema bulundu');
} else {
  console.log('❌ Prisma schema bulunamadı');
}

// .env dosyasını kontrol et
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env dosyası bulundu');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('DATABASE_URL')) {
    console.log('✅ DATABASE_URL tanımlı');
  } else {
    console.log('❌ DATABASE_URL bulunamadı');
  }
} else {
  console.log('❌ .env dosyası bulunamadı');
}

// node_modules kontrolü
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules bulundu');
} else {
  console.log('❌ node_modules bulunamadı');
}

console.log('\n🔍 Prisma generate çalıştırılıyor...');
const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma generate başarılı');
} catch (error) {
  console.log('❌ Prisma generate hatası:', error.message);
}
