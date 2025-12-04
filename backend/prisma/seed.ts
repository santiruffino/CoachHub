import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';

    const existingAdmin = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Super Admin',
                role: Role.ADMIN,
            },
        });
        console.log(`Created admin user: ${admin.email}`);
    } else {
        console.log('Admin user already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
