import { Migration } from '@mikro-orm/migrations';

export class Migration20240601025051_remove_image_url_from_vocab_table extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `vocabularies` drop `image_url`;');
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table `vocabularies` add `image_url` varchar(255) not null;',
    );
  }
}
