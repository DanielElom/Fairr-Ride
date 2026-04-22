import { IsString, IsUrl } from 'class-validator';

export class KycDto {
  @IsUrl()
  idDocument: string;

  @IsUrl()
  licenseDocument: string;

  @IsUrl()
  bikePapers: string;

  @IsString()
  bvnNin: string;
}
