import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { RegisterUseCase } from "../../application/use-cases/register.use-case.js";
import {
  LoginUseCase,
  LoginResponse,
} from "../../application/use-cases/login.use-case.js";
import { RegisterDto } from "../../application/dto/register.dto.js";
import { LoginDto } from "../../application/dto/login.dto.js";
import { JwtAuthGuard } from "../guards/jwt-auth.guard.js";
import { UserResponseDto } from "../../application/dto/user.response.dto.js";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  /**
   * POST /auth/register
   *
   * Example request body:
   * {
   *   "email": "doctor@piedrazul.com",
   *   "username": "dr_garcia",
   *   "password": "securePass123",
   *   "roles": ["DOCTOR"]
   * }
   */
  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  /**
   * POST /auth/login
   *
   * Example request body:
   * {
   *   "email": "doctor@piedrazul.com",
   *   "password": "securePass123"
   * }
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.loginUseCase.execute(dto);
  }

  /**
   * GET /auth/profile
   * Protected endpoint — requires a valid JWT.
   * Example: Accessible by any authenticated user.
   */
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  getProfile(): { message: string } {
    return { message: "You are authenticated" };
  }
}
