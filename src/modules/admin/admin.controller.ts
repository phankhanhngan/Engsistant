import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
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

@Controller('Admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userService: UsersService,
  ) {}
  // Update

  @Post('/users/:id')
  @UseGuards(RoleAuthGuard([Role.ADMIN]))
  async updateUser(@Req() req, @Res() res, @Body() body: UpdateUserDto) {
    try {
      // Update a user
      const id = req.params.id;
      const user = await this.userService.updateUser(id, body);
      res.status(200).json({
        message: 'User updated successfully',
        status: ApiResponseStatus.SUCCESS,
        updatedUser: user,
      });
    } catch (error) {
      this.logger.error(
        `Error occurred while updating a user: ${error.message} ${error.stack}`,
      );
      res.status(500).json({
        message: `User updated failed due to error=${error.message} ${error.stack}`,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }

  // List
  @Post('/users')
  @UseGuards(RoleAuthGuard([Role.ADMIN]))
  async listUsers() {
    try {
      // List all users
      const users = await this.userService.listUsers();
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
