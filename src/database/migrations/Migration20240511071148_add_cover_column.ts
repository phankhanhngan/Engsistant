import { Migration } from '@mikro-orm/migrations';

export class Migration20240511071148_add_cover_column extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `classes` add `cover` varchar(255) not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `classes` drop `cover`;');
  }

}
