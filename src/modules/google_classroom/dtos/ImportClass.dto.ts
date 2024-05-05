export class ImportClassDto {
  classes: ImportClassInfoDto[];
}

export class ImportClassInfoDto {
  name!: string;
  description?: string;
  descriptionHeading?: string;
  alternativeLink?: string;
  driveLink?: string;
  id!: string;
  ownerId?: string;
}
