const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const content = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL || ''}',
  supabaseKey: '${process.env.SUPABASE_KEY || ''}',
};
`;

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
console.log('environment.ts generado desde variables de entorno');
