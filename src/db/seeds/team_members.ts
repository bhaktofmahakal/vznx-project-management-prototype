import { db } from '@/db';
import { teamMembers } from '@/db/schema';

async function main() {
    const sampleTeamMembers = [
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'Frontend Developer',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Michael Chen',
            email: 'michael.chen@company.com',
            role: 'Backend Developer',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@company.com',
            role: 'Project Manager',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'David Thompson',
            email: 'david.thompson@company.com',
            role: 'Designer',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Jessica Kim',
            email: 'jessica.kim@company.com',
            role: 'QA Engineer',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(teamMembers).values(sampleTeamMembers);
    
    console.log('✅ Team members seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});