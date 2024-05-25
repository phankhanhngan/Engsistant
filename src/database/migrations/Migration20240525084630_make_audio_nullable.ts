import { Migration } from '@mikro-orm/migrations';

export class Migration20240525084630_make_audio_nullable extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `vocabularies` modify `pronunciation_audio` varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `vocabularies` modify `pronunciation_audio` varchar(255) not null;');
  }

}
