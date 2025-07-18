import config from 'config';
import { join } from 'path';
import { isNil } from 'lodash';
class Config {
  get swagger() {
    return {
      enable: this.getBoolean('swagger.enable'),
      name: this.getString('swagger.name'),
      description: this.getString('swagger.description'),
      doc_url: this.getString('swagger.doc_url'),
      version: this.getString('swagger.version'),
      is_auth: this.getBoolean('swagger.is_auth'),
      username: this.getString('swagger.username'),
      password: this.getString('swagger.password'),
    };
  }

  private getString(key: string): string {
    const value = config.get<string>(key);
    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set');
    }
    return value.toString().replace(/\\n/g, '\n');
  }

  private getNumber(key: string): number {
    const value = this.getString(key);
    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.getString(key);
    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' environment variable is not a boolean');
    }
  }
}

export default new Config();
