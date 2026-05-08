const fs = require('fs');
const path = require('path');
const specs = require('../config/swagger');

const outputPath = path.join(__dirname, '../../shared/openapi.json');

try {
  fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
  console.log(`✅ OpenAPI specification exported to ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to export OpenAPI specification:', error);
  process.exit(1);
}
