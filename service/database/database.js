import pg from "pg";
import env from "dotenv";

class DB {
  constructor() {
    env.config();
    this.pool = new pg.Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }

  async query(sql, params) {
    const client = await this.pool.connect();
    try {
      const query = await client.query(sql, params);
      return query;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async endPool() {
    await this.pool.end();
  }
}

export default DB;
