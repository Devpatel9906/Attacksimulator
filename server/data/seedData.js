require('dotenv').config()
const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const User = require('../models/User')
const Organization = require('../models/Organization')
const Department = require('../models/Department')
const Employee = require('../models/Employee')
const { seedAwarenessModules } = require('./awarenessModules')
const { initAuditChain, createAuditLog } = require('../utils/auditLogger')

const DEMO_ORG = {
  name: 'Acme Corporation',
  domain: 'acmecorp.com',
  industry: 'financial_services'
}

const DEMO_USERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@acmecorp.com', password: 'Admin@123456', role: 'admin' },
  { name: 'Marcus Webb', email: 'marcus.webb@acmecorp.com', password: 'Analyst@123456', role: 'analyst' },
  { name: 'James Ford', email: 'james.ford@acmecorp.com', password: 'Defender@123456', role: 'defender' }
]

const DEPARTMENTS = ['Finance', 'HR', 'Engineering', 'IT', 'Marketing']

// Behavioral DNA distribution per department
const DEPT_ARCHETYPES = {
  Finance: ['rushed_responder','rushed_responder','rushed_responder','rushed_responder','rushed_responder','rushed_responder','rushed_responder','trusting_delegator','trusting_delegator','skeptical_verifier'],
  HR: ['trusting_delegator','trusting_delegator','trusting_delegator','trusting_delegator','trusting_delegator','rushed_responder','rushed_responder','rushed_responder','skeptical_verifier','skeptical_verifier'],
  Engineering: ['rushed_responder','rushed_responder','distracted_clicker','distracted_clicker','distracted_clicker','skeptical_verifier','skeptical_verifier','skeptical_verifier','skeptical_verifier','skeptical_verifier'],
  IT: ['rushed_responder','distracted_clicker','distracted_clicker','distracted_clicker','distracted_clicker','skeptical_verifier','skeptical_verifier','skeptical_verifier','skeptical_verifier','skeptical_verifier'],
  Marketing: ['rushed_responder','rushed_responder','rushed_responder','rushed_responder','trusting_delegator','trusting_delegator','trusting_delegator','trusting_delegator','skeptical_verifier','skeptical_verifier']
}

const DEPT_ROLES = {
  Finance: ['finance_manager','finance_analyst','finance_analyst','finance_analyst','finance_analyst','finance_analyst','finance_analyst','finance_analyst','finance_analyst','general_employee'],
  HR: ['hr_manager','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee'],
  Engineering: ['it_support','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee'],
  IT: ['it_support','it_support','it_support','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee'],
  Marketing: ['general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee','general_employee']
}

const EMPLOYEE_NAMES = {
  Finance: [
    ['Alex','Torres'],['Jordan','Kim'],['Taylor','Patel'],['Morgan','Singh'],['Casey','Lee'],
    ['Riley','Chen'],['Drew','Williams'],['Avery','Johnson'],['Blake','Martinez'],['Quinn','Davis']
  ],
  HR: [
    ['Sam','Brown'],['Jamie','Wilson'],['Chris','Anderson'],['Pat','Thompson'],['Lee','Jackson'],
    ['Dana','White'],['Terry','Harris'],['Jesse','Martin'],['Robin','Garcia'],['Skyler','Clark']
  ],
  Engineering: [
    ['Arjun','Sharma'],['Priya','Nair'],['Rohan','Verma'],['Sneha','Iyer'],['Kiran','Reddy'],
    ['Ananya','Gupta'],['Vikram','Mehta'],['Divya','Joshi'],['Rahul','Das'],['Pooja','Pillai']
  ],
  IT: [
    ['Max','Walker'],['Sam','Hall'],['Alex','Young'],['Jordan','Allen'],['Casey','Scott'],
    ['Riley','Adams'],['Drew','Baker'],['Avery','Nelson'],['Blake','Carter'],['Quinn','Mitchell']
  ],
  Marketing: [
    ['Emma','Roberts'],['Liam','Evans'],['Olivia','Turner'],['Noah','Phillips'],['Ava','Campbell'],
    ['William','Parker'],['Sophia','Edwards'],['James','Collins'],['Isabella','Stewart'],['Oliver','Sanchez']
  ]
}

async function clearExistingData() {
  await Employee.deleteMany({})
  await Department.deleteMany({})
  await Organization.deleteMany({})
  await User.deleteMany({})
  console.log('Cleared existing data')
}

async function seedUsers(orgId) {
  const users = []
  for (const u of DEMO_USERS) {
    const existing = await User.findByEmail(u.email)
    if (!existing) {
      const user = new User({ name: u.name, role: u.role, organizationId: orgId })
      await User.setEmail(user, u.email)
      await user.setPassword(u.password)
      await user.save()
      users.push(user)
      console.log(`Seeded user: ${u.email}`)
    }
  }
  return users
}

async function seedOrg(adminUserId) {
  const org = new Organization({ ...DEMO_ORG, createdBy: adminUserId })
  await org.save()
  console.log(`Seeded org: ${org.name}`)
  return org
}

async function seedDepartmentsAndEmployees(org) {
  const deptMap = {}

  for (const deptName of DEPARTMENTS) {
    const dept = new Department({ name: deptName, organization: org._id })
    await dept.save()
    deptMap[deptName] = dept
    console.log(`Seeded department: ${deptName}`)
  }

  for (const deptName of DEPARTMENTS) {
    const dept = deptMap[deptName]
    const names = EMPLOYEE_NAMES[deptName]
    const archetypes = DEPT_ARCHETYPES[deptName]
    const roles = DEPT_ROLES[deptName]

    for (let i = 0; i < 10; i++) {
      const [firstName, lastName] = names[i]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acmecorp.com`

      const emp = new Employee({
        firstName, lastName,
        role: roles[i],
        department: dept._id,
        organization: org._id,
        behavioralArchetype: archetypes[i]
      })
      Employee.setEmail(emp, email)
      await emp.save()

      dept.employeeCount += 1
      org.employeeCount += 1
    }

    await dept.save()
    console.log(`Seeded 10 employees for ${deptName}`)
  }

  await org.save()
  return deptMap
}

async function runSeed() {
  try {
    await connectDB()
    await initAuditChain()

    console.log('\n=== SEEDING DEMO DATA ===\n')

    await clearExistingData()

    // Seed admin user first (org needs createdBy)
    const tempAdmin = new User({ name: 'Sarah Chen', role: 'admin' })
    await User.setEmail(tempAdmin, 'sarah.chen@acmecorp.com')
    await tempAdmin.setPassword('Admin@123456')
    await tempAdmin.save()

    const org = await seedOrg(tempAdmin._id)

    // Update admin with org
    tempAdmin.organizationId = org._id
    await tempAdmin.save()

    // Seed analyst and defender
    for (const u of DEMO_USERS.slice(1)) {
      const user = new User({ name: u.name, role: u.role, organizationId: org._id })
      await User.setEmail(user, u.email)
      await user.setPassword(u.password)
      await user.save()
      console.log(`Seeded user: ${u.email}`)
    }

    await seedDepartmentsAndEmployees(org)
    await seedAwarenessModules()

    await createAuditLog({
      actorId: tempAdmin._id, actorRole: 'admin',
      action: 'seed.complete', outcome: 'SUCCESS',
      metadata: { org: org.name, employeeCount: org.employeeCount }
    })

    console.log('\n=== SEED COMPLETE ===')
    console.log(`Organization: ${org.name}`)
    console.log(`Employees: ${org.employeeCount}`)
    console.log('\nDemo credentials:')
    console.log('Admin:    sarah.chen@acmecorp.com / Admin@123456')
    console.log('Analyst:  marcus.webb@acmecorp.com / Analyst@123456')
    console.log('Defender: james.ford@acmecorp.com / Defender@123456')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

runSeed()