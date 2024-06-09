import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { UpdateUserDto } from './dtos/UpdateUser.dto';
import { UsersService } from '../users/users.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AdminListUsers,
  AdminUpdateUser,
} from 'src/common/swagger_types/swagger-type.dto';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userService: UsersService,
  ) {}
  // Update

  @Put('/users/:id')
  @UseGuards(RoleAuthGuard([Role.ADMIN]))
  @ApiResponse({
    status: 200,
    type: AdminUpdateUser,
  })
  async updateUser(@Req() req, @Res() res, @Body() body: UpdateUserDto) {
    try {
      // Update a user
      const id = req.params.id;
      const user = await this.userService.updateUser(
        id,
        body.name,
        body.photo,
        body.role,
      );
      res.status(200).json({
        message: 'User updated successfully',
        status: ApiResponseStatus.SUCCESS,
        updatedUser: user,
      });
    } catch (error) {
      this.logger.error(
        `Error occurred while updating a user: ${error.message} ${error.stack}`,
      );
      throw error;
    }
  }

  // List
  @Get('/users')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: AdminListUsers,
  })
  @UseGuards(RoleAuthGuard([Role.ADMIN]))
  async listUsers(@Query() role: Role, @Query() search: string | null) {
    try {
      // List all users
      const users = await this.userService.listUsers(role, search);
      return {
        message: 'List of users',
        status: ApiResponseStatus.SUCCESS,
        users: users,
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while listing users: ${error.message} ${error.stack}`,
      );
      return {
        message: `List users failed due to error=${error.message}`,
        status: ApiResponseStatus.FAILURE,
      };
    }
  }
}
