import { Migration } from '@mikro-orm/migrations';

export class Migration20240520162848_alter_lesson_table extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `lessons` add `status` varchar(255) not null default \'PENDING\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table `lessons` drop `status`;');
  }

}
