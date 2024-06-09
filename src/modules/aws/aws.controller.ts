import {
  Controller,
  Inject,
  ParseFilePipe,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Logger } from 'winston';
import { imageFilter } from '../users/helpers/file-filter.helper';
import { AWSService } from './aws.service';

@UseGuards(JwtAuthGuard)
@Controller('aws')
export class AwsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly awsService: AWSService,
  ) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 1, imageFilter))
  async uploadImage(
    @UploadedFiles(new ParseFilePipe({}))
    files: Array<Express.Multer.File>,
    @Res() res,
  ) {
    try {
      if (!files) {
        return res.status(400).json({
          status: 400,
          message: 'No file uploaded',
        });
      }

      if (files.length != 1) {
        return res.status(400).json({
          status: 400,
          message: 'Only one file is allowed',
        });
      }

      const result = await this.awsService.putObject(files[0], 'images');
      return res.status(200).json({
        status: 200,
        message: 'File uploaded successfully',
        url: result,
      });
    } catch (error) {
      this.logger.error('Calling upload()', error, AwsController.name);
      throw error;
    }
  }
}
