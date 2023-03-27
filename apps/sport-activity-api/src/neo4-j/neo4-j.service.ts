import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class Neo4jQueryService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async read(query: string, params: object = {}): Promise<any> {
    const session = this.neo4jService
      .getDriver()
      .session({ defaultAccessMode: 'READ' });
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } finally {
      session.close();
    }
  }

  async write(query: string, params: object = {}): Promise<any> {
    const session = this.neo4jService
      .getDriver()
      .session({ defaultAccessMode: 'WRITE' });
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } finally {
      session.close();
    }
  }
}
