import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { LoginResponseDto } from './dtos/login-response-dto';
import { RefreshDto } from './dtos/refresh-dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { UserResponseDto } from './dtos/user-response-dto';
import { JwtGuard } from 'src/common/auth/guards/jwt.guard';
import { Roles } from 'src/common/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/common/auth/guards/roles.guard';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Get('protected')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  protectedRoute() {
    return { message: 'Ok.' };
  }

  @Get('user-exists/:id')
  async userExists(
    @Param('id') id: string
  ): Promise<{ exists: boolean }> {
    const exists = await this.authService.userExists(id);
    return { exists };
  }

  // ── CORRECCIÓN Bug 3: endpoints de listado ahora requieren autenticación ──
  // /all-doctors: cualquier usuario autenticado puede ver los médicos
  // (paciente necesita la lista para agendar, agendador también).
  @Get('all-doctors')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'PATIENT', 'SCHEDULER', 'DOCTOR')
  async getAllDoctors(): Promise<{ id: string; name: string; lastnames: string }[]> {
    return this.authService.getAllDoctors();
  }

  // /all-patients: solo el agendador y el admin necesitan ver pacientes.
  @Get('all-patients')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'SCHEDULER')
  async getAllPatients(): Promise<{ id: string; name: string; lastnames: string }[]> {
    return this.authService.getAllPatients();
  }
  // ─────────────────────────────────────────────────────────────────────────

  @Get('patient/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'SCHEDULER', 'DOCTOR')
  async getPatientById(
    @Param('id') id: string
  ): Promise<{ id: string; name: string; lastnames: string } | null> {
    return this.authService.getPatientById(id);
  }

  // /all-users: solo el admin ve la lista completa de usuarios.
  @Get('all-users')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'SCHEDULER', 'PATIENT')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
}