const mongoSanitize = require('mongo-sanitize')
const { z } = require('zod')
const AwarenessModule = require('../models/AwarenessModule')
const EmployeeProgress = require('../models/EmployeeProgress')
const SecurityBadge = require('../models/SecurityBadge')
const Employee = require('../models/Employee')
const SimulationEvent = require('../models/SimulationEvent')
const { createAuditLog } = require('../utils/auditLogger')

function actor(request) {
  return { actorId: request.user?.id, actorRole: request.user?.role, ipAddress: request.ip }
}

// Assign module to employee after scenario
async function assignModule(employeeId, attackType, scenarioId, orgId) {
  const module = await AwarenessModule.findOne({ attackType, isActive: true })
    .sort({ difficulty: 1 })
  if (!module) return null

  const existing = await EmployeeProgress.findOne({ employee: employeeId, module: module._id })
  if (existing) return existing

  const progress = new EmployeeProgress({
    employee: employeeId,
    organization: orgId,
    module: module._id,
    scenario: scenarioId,
    status: 'assigned'
  })
  await progress.save()
  return progress
}

async function getEmployeeModules(request, reply) {
  try {
    const { employeeId } = request.params
    const progress = await EmployeeProgress.find({ employee: mongoSanitize(employeeId) })
      .populate('module')
      .sort({ createdAt: -1 })

    return reply.status(200).send({
      modules: progress.map(p => ({
        progressId: p._id,
        module: {
          id: p.module._id, title: p.module.title,
          attackType: p.module.attackType, difficulty: p.module.difficulty,
          estimatedMinutes: p.module.estimatedMinutes,
          simulationType: p.module.simulationType
        },
        status: p.status, quizScore: p.quizScore,
        completedAt: p.completedAt, assignedAt: p.createdAt
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function getModule(request, reply) {
  try {
    const { moduleId } = request.params
    const module = await AwarenessModule.findById(mongoSanitize(moduleId))
    if (!module) return reply.status(404).send({ error: 'Module not found' })

    // Mark in progress
    if (request.query.employeeId) {
      await EmployeeProgress.findOneAndUpdate(
        { employee: mongoSanitize(request.query.employeeId), module: module._id },
        { status: 'in_progress' }
      )
    }

    return reply.status(200).send({ module })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

const SubmitQuizSchema = z.object({
  employeeId: z.string().min(1),
  answers: z.array(z.number())
})

async function submitQuiz(request, reply) {
  try {
    const { moduleId } = request.params
    const body = mongoSanitize(request.body)
    const validated = SubmitQuizSchema.parse(body)

    const module = await AwarenessModule.findById(mongoSanitize(moduleId))
    if (!module) return reply.status(404).send({ error: 'Module not found' })

    // Score the quiz
    let correct = 0
    for (let i = 0; i < module.quiz.length; i++) {
      if (validated.answers[i] === module.quiz[i].correctIndex) correct++
    }
    const score = Math.round((correct / module.quiz.length) * 100)
    const passed = score >= 70

    // Update progress
    const progress = await EmployeeProgress.findOneAndUpdate(
      { employee: validated.employeeId, module: module._id },
      {
        status: passed ? 'completed' : 'in_progress',
        quizScore: score,
        $inc: { quizAttempts: 1 },
        completedAt: passed ? new Date() : null
      },
      { new: true }
    )

    if (passed) {
      // Update employee score and completed count
      const emp = await Employee.findById(validated.employeeId)
      if (emp) {
        emp.awarModulesCompleted += 1
        emp.securityScore = Math.min(100, emp.securityScore + 10)
        emp.scenariosCompleted += 1
        await emp.save()
      }

      // Award badge if first completion
      await awardBadgeIfEligible(validated.employeeId, module.attackType, progress?.organization)
    }

    await createAuditLog({
      ...actor(request), action: 'awareness.quiz_submitted',
      outcome: passed ? 'SUCCESS' : 'FAILED',
      metadata: { moduleId, employeeId: validated.employeeId, score }
    })

    return reply.status(200).send({
      score, passed,
      correctAnswers: module.quiz.map(q => q.correctIndex),
      explanations: module.quiz.map(q => q.explanation),
      message: passed ? 'Well done! Module completed.' : 'Keep learning. Try again.'
    })
  } catch (err) {
    if (err.name === 'ZodError') return reply.status(400).send({ error: 'Validation failed', details: err.errors })
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

async function awardBadgeIfEligible(employeeId, attackType, orgId) {
  const emp = await Employee.findById(employeeId)
  if (!emp) return

  const badges = []

  // First Responder — reported a simulation
  const reported = await SimulationEvent.findOne({ employee: employeeId, result: 'reported' })
  if (reported) badges.push({ name: 'first_responder', label: 'First Responder', description: 'Reported a phishing simulation', icon: '🚨' })

  // Skeptic — behavioral archetype
  if (emp.behavioralArchetype === 'skeptical_verifier') {
    badges.push({ name: 'skeptic', label: 'Skeptic', description: 'Identified as a Skeptical Verifier', icon: '🔍' })
  }

  // Perfect Defense — 100% quiz score
  const perfect = await EmployeeProgress.findOne({ employee: employeeId, quizScore: 100 })
  if (perfect) badges.push({ name: 'perfect_defense', label: 'Perfect Defense', description: 'Scored 100% on a quiz', icon: '🏆' })

  for (const badge of badges) {
    const exists = await SecurityBadge.findOne({ employee: employeeId, name: badge.name })
    if (!exists) {
      const b = new SecurityBadge({ ...badge, employee: employeeId, organization: orgId })
      await b.save()
      await Employee.findByIdAndUpdate(employeeId, { $push: { badges: b._id } })
    }
  }
}

async function getLeaderboard(request, reply) {
  try {
    const { orgId } = request.params
    const employees = await Employee.find({ organization: mongoSanitize(orgId), isActive: true })
      .populate('department', 'name')
      .sort({ securityScore: -1 })
      .limit(20)
      .select('firstName lastName displayName role department securityScore awarModulesCompleted behavioralArchetype badges')

    return reply.status(200).send({
      leaderboard: employees.map((e, i) => ({
        rank: i + 1,
        id: e._id, displayName: e.displayName, role: e.role,
        department: e.department, securityScore: e.securityScore,
        modulesCompleted: e.awarModulesCompleted, badgeCount: e.badges.length,
        archetype: e.behavioralArchetype
      }))
    })
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send({ error: 'Internal server error' })
  }
}

module.exports = { assignModule, getEmployeeModules, getModule, submitQuiz, getLeaderboard }