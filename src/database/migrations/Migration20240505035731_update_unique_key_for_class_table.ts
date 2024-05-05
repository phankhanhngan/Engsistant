import { Migration } from '@mikro-orm/migrations';

export class Migration20240505035731_update_unique_key_for_class_table extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `classes` add unique `classes_google_course_id_unique`(`google_course_id`);');
  }

  async down(): Promise<void> {
    this.addSql('alter table `classes` drop index `classes_google_course_id_unique`;');
  }

}
