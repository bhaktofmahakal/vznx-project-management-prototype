import { db } from '@/db';
import { tasks } from '@/db/schema';

async function main() {
    const sampleTasks = [
        // Project 1: Website Redesign (In Progress, 65%) - 4 tasks, 3 complete, 1 incomplete
        {
            projectId: 1,
            name: 'Design homepage mockups',
            status: 'complete',
            assignedTo: 1,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            projectId: 1,
            name: 'Create responsive navigation',
            status: 'complete',
            assignedTo: 2,
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 1,
            name: 'Implement new color scheme',
            status: 'complete',
            assignedTo: 3,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            projectId: 1,
            name: 'Optimize page load speed',
            status: 'incomplete',
            assignedTo: null,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },

        // Project 2: Mobile App Development (In Progress, 45%) - 3 tasks, 1 complete, 2 incomplete
        {
            projectId: 2,
            name: 'Setup React Native project',
            status: 'complete',
            assignedTo: 4,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            projectId: 2,
            name: 'Implement user authentication flow',
            status: 'incomplete',
            assignedTo: 4,
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            projectId: 2,
            name: 'Design app icon and splash screen',
            status: 'incomplete',
            assignedTo: 5,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },

        // Project 3: API Integration (Completed, 100%) - 3 tasks, all complete
        {
            projectId: 3,
            name: 'Write API documentation',
            status: 'complete',
            assignedTo: 1,
            createdAt: new Date('2023-12-01').toISOString(),
            updatedAt: new Date('2023-12-15').toISOString(),
        },
        {
            projectId: 3,
            name: 'Implement REST endpoints',
            status: 'complete',
            assignedTo: 2,
            createdAt: new Date('2023-12-05').toISOString(),
            updatedAt: new Date('2023-12-20').toISOString(),
        },
        {
            projectId: 3,
            name: 'Write integration tests',
            status: 'complete',
            assignedTo: null,
            createdAt: new Date('2023-12-10').toISOString(),
            updatedAt: new Date('2023-12-28').toISOString(),
        },

        // Project 4: Customer Portal (Completed, 100%) - 2 tasks, all complete
        {
            projectId: 4,
            name: 'Build customer dashboard',
            status: 'complete',
            assignedTo: 3,
            createdAt: new Date('2023-11-15').toISOString(),
            updatedAt: new Date('2023-12-10').toISOString(),
        },
        {
            projectId: 4,
            name: 'Deploy to production',
            status: 'complete',
            assignedTo: 5,
            createdAt: new Date('2023-12-05').toISOString(),
            updatedAt: new Date('2023-12-30').toISOString(),
        },

        // Project 5: Analytics Dashboard (Planning, 5%) - 2 tasks, all incomplete
        {
            projectId: 5,
            name: 'Setup database schema',
            status: 'incomplete',
            assignedTo: null,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            projectId: 5,
            name: 'Research analytics libraries',
            status: 'incomplete',
            assignedTo: 2,
            createdAt: new Date('2024-01-23').toISOString(),
            updatedAt: new Date('2024-01-23').toISOString(),
        },

        // Project 6: E-commerce Platform (Planning, 10%) - 2 tasks, all incomplete
        {
            projectId: 6,
            name: 'Integrate payment gateway',
            status: 'incomplete',
            assignedTo: null,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            projectId: 6,
            name: 'Design product catalog structure',
            status: 'incomplete',
            assignedTo: 1,
            createdAt: new Date('2024-01-26').toISOString(),
            updatedAt: new Date('2024-01-26').toISOString(),
        },

        // Project 7: Marketing Campaign (In Progress, 30%) - 3 tasks, 1 complete, 2 incomplete
        {
            projectId: 7,
            name: 'Create social media content',
            status: 'complete',
            assignedTo: 5,
            createdAt: new Date('2024-01-14').toISOString(),
            updatedAt: new Date('2024-01-19').toISOString(),
        },
        {
            projectId: 7,
            name: 'Setup email marketing automation',
            status: 'incomplete',
            assignedTo: 3,
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-21').toISOString(),
        },
        {
            projectId: 7,
            name: 'Design landing page templates',
            status: 'incomplete',
            assignedTo: null,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        }
    ];

    await db.insert(tasks).values(sampleTasks);
    
    console.log('✅ Tasks seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});