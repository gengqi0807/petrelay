const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ 数据库 ${process.env.DB_NAME} 已创建`);

    await connection.end();
  } catch (error) {
    console.error('❌ 初始化数据库失败:', error.message);
    process.exit(1);
  }
}

initDatabase();
