import { db } from '@/db';
import { projects } from '@/db/schema';

async function main() {
    const sampleProjects = [
        {
            name: 'Website Redesign',
            status: 'In Progress',
            progress: 65,
            description: 'Complete overhaul of company website with modern design and improved user experience.',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-03-10').toISOString(),
        },
        {
            name: 'Mobile App Development',
            status: 'In Progress',
            progress: 45,
            description: 'Native mobile application for iOS and Android platforms with offline capabilities.',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-03-12').toISOString(),
        },
        {
            name: 'API Integration',
            status: 'Completed',
            progress: 100,
            description: 'Integration of third-party payment gateway and shipping provider APIs.',
            createdAt: new Date('2023-11-20').toISOString(),
            updatedAt: new Date('2024-01-30').toISOString(),
        },
        {
            name: 'Customer Portal',
            status: 'Completed',
            progress: 100,
            description: 'Self-service portal for customers to manage accounts and track orders.',
            createdAt: new Date('2023-12-01').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            name: 'Analytics Dashboard',
            status: 'Planning',
            progress: 5,
            description: 'Real-time analytics dashboard with custom reporting and data visualization.',
            createdAt: new Date('2024-03-01').toISOString(),
            updatedAt: new Date('2024-03-05').toISOString(),
        },
        {
            name: 'E-commerce Platform',
            status: 'Planning',
            progress: 10,
            description: 'Full-featured e-commerce platform with inventory management and customer reviews.',
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: new Date('2024-03-08').toISOString(),
        },
        {
            name: 'Marketing Campaign',
            status: 'In Progress',
            progress: 30,
            description: 'Multi-channel marketing campaign launch with email automation and social media integration.',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-03-11').toISOString(),
        },
    ];

    await db.insert(projects).values(sampleProjects);
    
    console.log('✅ Projects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});