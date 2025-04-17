import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.rolePermission.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating roles...');
  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: RoleType.ADMIN,
      description: 'System administrator with full access',
    },
  });

  const employerRole = await prisma.role.create({
    data: {
      name: RoleType.EMPLOYER,
      description: 'Employer who can post jobs and manage applications',
    },
  });

  const candidateRole = await prisma.role.create({
    data: {
      name: RoleType.CANDIDATE,
      description: 'Job seeker who can apply for jobs',
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: RoleType.MODERATOR,
      description: 'Content moderator with limited admin access',
    },
  });

  const visitorRole = await prisma.role.create({
    data: {
      name: RoleType.VISITOR,
      description: 'Basic access for site visitors',
    },
  });

  console.log('Creating permissions...');
  // Create permissions
  const permissions = await Promise.all([
    // User management permissions
    prisma.permission.create({
      data: {
        name: 'Create Users',
        code: 'users:create',
        description: 'Ability to create new users',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Read Users',
        code: 'users:read',
        description: 'Ability to view user profiles',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Update Users',
        code: 'users:update',
        description: 'Ability to update user details',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Users',
        code: 'users:delete',
        description: 'Ability to remove users',
      },
    }),
    // Role management permissions
    prisma.permission.create({
      data: {
        name: 'Manage Roles',
        code: 'roles:manage',
        description: 'Ability to assign and revoke roles',
      },
    }),
    // Job management permissions
    prisma.permission.create({
      data: {
        name: 'Create Jobs',
        code: 'jobs:create',
        description: 'Ability to post new job listings',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Read Jobs',
        code: 'jobs:read',
        description: 'Ability to view job listings',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Update Jobs',
        code: 'jobs:update',
        description: 'Ability to modify job listings',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Delete Jobs',
        code: 'jobs:delete',
        description: 'Ability to remove job listings',
      },
    }),
    // Application management permissions
    prisma.permission.create({
      data: {
        name: 'Apply for Jobs',
        code: 'applications:create',
        description: 'Ability to apply for jobs',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'View Applications',
        code: 'applications:read',
        description: 'Ability to view job applications',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'Process Applications',
        code: 'applications:process',
        description: 'Ability to accept or reject applications',
      },
    }),
    // Content moderation permissions
    prisma.permission.create({
      data: {
        name: 'Moderate Content',
        code: 'content:moderate',
        description: 'Ability to review and moderate user-generated content',
      },
    }),
  ]);

  console.log('Assigning permissions to roles...');
  // Map of role IDs to permission codes they should have
  const rolePermissions = {
    [adminRole.id]: permissions.map((p) => p.id), // Admin gets all permissions
    [employerRole.id]: permissions
      .filter((p) =>
        ['jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete',
          'applications:read', 'applications:process'].includes(p.code)
      )
      .map((p) => p.id),
    [candidateRole.id]: permissions
      .filter((p) =>
        ['jobs:read', 'applications:create'].includes(p.code)
      )
      .map((p) => p.id),
    [moderatorRole.id]: permissions
      .filter((p) =>
        ['users:read', 'jobs:read', 'applications:read', 'content:moderate'].includes(p.code)
      )
      .map((p) => p.id),
    [visitorRole.id]: permissions
      .filter((p) =>
        ['jobs:read'].includes(p.code)
      )
      .map((p) => p.id),
  };

  // Assign permissions to roles
  for (const [roleId, permissionIds] of Object.entries(rolePermissions)) {
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log('Creating users...');
  // Create users with hashed passwords
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'System Administrator',
    },
  });

  const employer1 = await prisma.user.create({
    data: {
      email: 'employer1@example.com',
      password: hashedPassword,
      name: 'Tech Company Inc.',
    },
  });

  const employer2 = await prisma.user.create({
    data: {
      email: 'employer2@example.com',
      password: hashedPassword,
      name: 'Startup Ventures',
    },
  });

  const candidate1 = await prisma.user.create({
    data: {
      email: 'candidate1@example.com',
      password: hashedPassword,
      name: 'John Developer',
    },
  });

  const candidate2 = await prisma.user.create({
    data: {
      email: 'candidate2@example.com',
      password: hashedPassword,
      name: 'Jane Designer',
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@example.com',
      password: hashedPassword,
      name: 'Content Reviewer',
    },
  });

  console.log('Assigning roles to users...');
  // Assign roles to users
  await prisma.userRole.create({
    data: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: employer1.id,
      roleId: employerRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: employer2.id,
      roleId: employerRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: candidate1.id,
      roleId: candidateRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: candidate2.id,
      roleId: candidateRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: moderator.id,
      roleId: moderatorRole.id,
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
