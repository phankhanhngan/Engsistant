import { Migration } from '@mikro-orm/migrations';

export class Migration20240525072555_add_pronunciation_written_column_into_vocab_table extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `vocabularies` add `pronunciation_written` varchar(255) null;',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table `vocabularies` drop `pronunciation_written`;');
  }
}
