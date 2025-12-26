import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clean up existing data
    await prisma.application.deleteMany()
    await prisma.job.deleteMany()
    await prisma.recruiter.deleteMany()
    await prisma.candidate.deleteMany()

    // Create Recruiters
    const alice = await prisma.recruiter.create({
        data: {
            name: 'Alice Recruiter',
            email: 'alice@company.com',
        },
    })

    const bob = await prisma.recruiter.create({
        data: {
            name: 'Bob Recruiter',
            email: 'bob@company.com',
        },
    })

    // Create Jobs
    const jobA = await prisma.job.create({
        data: {
            title: 'Frontend Developer',
            description: 'React and TypeScript expert needed.',
            recruiterId: alice.id,
        },
    })

    const jobB = await prisma.job.create({
        data: {
            title: 'Backend Engineer',
            description: 'Node.js and Database specialist.',
            recruiterId: bob.id,
        },
    })

    console.log({ alice, bob, jobA, jobB })
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
