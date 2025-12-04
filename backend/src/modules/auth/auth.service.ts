import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        this.logger.log(`Processing registration for email: ${registerDto.email}`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            this.logger.warn(`Registration failed: Email ${registerDto.email} already exists`);
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                role: 'STUDENT', // Default role
            },
        });

        this.logger.log(`User registered successfully: ${user.id}`);
        return {
            message: 'User registered successfully',
            user: { id: user.id, email: user.email, role: user.role },
        };
    }

    async login(loginDto: LoginDto) {
        this.logger.log(`Processing login for email: ${loginDto.email}`);
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            this.logger.warn(`Login failed: User not found for email ${loginDto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password for email ${loginDto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User logged in successfully: ${user.id}`);
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
        };
    }
}
