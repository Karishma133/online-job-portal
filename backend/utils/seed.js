/**
 * Run with: node utils/seed.js
 * Populates the DB with a sample recruiter, student, and a few jobs
 * so you can test the app immediately without manual signup.
 */
import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Job from '../models/Job.js'
import Application from '../models/Application.js'

dotenv.config()

const run = async () => {
  await connectDB()

  console.log('Clearing existing data...')
  await Promise.all([User.deleteMany(), Job.deleteMany(), Application.deleteMany()])

  console.log('Creating users...')
  const recruiter = await User.create({
    name: 'Priya Sharma',
    email: 'recruiter@demo.com',
    password: 'password123',
    role: 'recruiter',
    companyName: 'Acme Tech',
  })

  const student = await User.create({
    name: 'Rahul Verma',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Git'],
    bio: 'Final year CS student looking for frontend roles.',
    location: 'Kanpur, India',
  })

  await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
  })

  console.log('Creating jobs...')
  await Job.create([
    {
      title: 'Frontend Developer Intern',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Remote',
      jobType: 'Internship',
      category: 'Software Development',
      experienceLevel: 'Fresher',
      salaryMin: 15000,
      salaryMax: 25000,
      description: 'Work on our React-based dashboard alongside senior engineers.',
      responsibilities: ['Build reusable UI components', 'Fix bugs reported by QA', 'Write unit tests'],
      requiredSkills: ['React', 'JavaScript', 'CSS', 'Git'],
    },
    {
      title: 'Backend Developer',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Bangalore',
      jobType: 'Full-time',
      category: 'Software Development',
      experienceLevel: '1-2 years',
      salaryMin: 600000,
      salaryMax: 1000000,
      description: 'Own our Node.js APIs and MongoDB data layer.',
      responsibilities: ['Design REST APIs', 'Optimize database queries', 'Mentor interns'],
      requiredSkills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker'],
    },
    {
      title: 'Data Analyst',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Mumbai',
      jobType: 'Full-time',
      category: 'Data Science & Analytics',
      experienceLevel: 'Fresher',
      salaryMin: 400000,
      salaryMax: 700000,
      description: 'Analyze product usage data and build dashboards for leadership.',
      responsibilities: ['Build SQL queries', 'Create dashboards', 'Present insights'],
      requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Pandas'],
    },
    {
      title: 'Web Developer',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Noida',
      jobType: 'Full-time',
      category: 'Software Development',
      experienceLevel: 'Fresher',
      salaryMin: 300000,
      salaryMax: 500000,
      description: 'Build and maintain responsive websites and landing pages for our marketing team.',
      responsibilities: ['Build responsive web pages', 'Optimize page load speed', 'Cross-browser testing'],
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
    },
    {
      title: 'React Developer',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Remote',
      jobType: 'Full-time',
      category: 'Software Development',
      experienceLevel: '1-2 years',
      salaryMin: 500000,
      salaryMax: 900000,
      description: 'Own the component library and state management for our flagship React application.',
      responsibilities: ['Build reusable React components', 'Manage app state with Redux', 'Collaborate with design on UI'],
      requiredSkills: ['React', 'JavaScript', 'Redux', 'Tailwind CSS', 'Git'],
    },
    {
      title: 'MERN Stack Developer',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Bangalore',
      jobType: 'Full-time',
      category: 'Software Development',
      experienceLevel: '1-2 years',
      salaryMin: 600000,
      salaryMax: 1200000,
      description: 'Build end-to-end features across our MongoDB, Express, React, and Node.js stack.',
      responsibilities: ['Design REST APIs', 'Build React frontends', 'Manage MongoDB schemas'],
      requiredSkills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
    },
    {
      title: 'Full Stack Developer',
      company: 'Acme Tech',
      postedBy: recruiter._id,
      location: 'Hyderabad',
      jobType: 'Full-time',
      category: 'Software Development',
      experienceLevel: '2-5 years',
      salaryMin: 900000,
      salaryMax: 1600000,
      description: 'Take full ownership of features from database design to polished UI, across our whole stack.',
      responsibilities: ['Design system architecture', 'Build and ship features end-to-end', 'Mentor junior developers'],
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'TypeScript'],
    },
  ])

  console.log('✅ Seed complete!')
  console.log('   Recruiter login: recruiter@demo.com / password123')
  console.log('   Student login:   student@demo.com / password123')
  console.log('   Admin login:     admin@demo.com / password123')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
