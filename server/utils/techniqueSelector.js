const TECHNIQUES = {
  T1: { id: 'T1', name: 'Peer document share', suspicion: 'low', targetArchetypes: ['trusting_delegator'] },
  T2: { id: 'T2', name: 'Urgent IT request', suspicion: 'medium', targetArchetypes: ['rushed_responder'] },
  T3: { id: 'T3', name: 'Authority impersonation', suspicion: 'high', targetArchetypes: ['rushed_responder', 'trusting_delegator'] },
  T4: { id: 'T4', name: 'Credential relay', suspicion: 'technical', targetArchetypes: ['distracted_clicker'] },
  T5: { id: 'T5', name: 'CEO fraud', suspicion: 'high', targetArchetypes: ['trusting_delegator', 'rushed_responder'] },
  T6: { id: 'T6', name: 'Vendor impersonation', suspicion: 'medium', targetArchetypes: ['trusting_delegator'] },
  T7: { id: 'T7', name: 'Helpdesk social engineering', suspicion: 'low', targetArchetypes: ['distracted_clicker', 'rushed_responder'] },
  T8: { id: 'T8', name: 'Password reset chain', suspicion: 'technical', targetArchetypes: ['rushed_responder'] }
}

// Skeptical verifier — ghost avoids this archetype
const AVOID_ARCHETYPE = 'skeptical_verifier'

function selectTechnique({ targetArchetype, failedTechniques = [], aggressionLevel = 1 }) {
  if (targetArchetype === AVOID_ARCHETYPE) return null

  // Filter out already failed techniques
  const available = Object.values(TECHNIQUES).filter(t => !failedTechniques.includes(t.id))
  if (available.length === 0) return null

  // Filter by archetype match
  const matched = available.filter(t => t.targetArchetypes.includes(targetArchetype))
  const pool = matched.length > 0 ? matched : available

  // Higher aggression = pick higher suspicion techniques
  if (aggressionLevel >= 4) {
    const high = pool.filter(t => t.suspicion === 'high' || t.suspicion === 'technical')
    if (high.length > 0) return high[Math.floor(Math.random() * high.length)]
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

function getNextTargets({ sourceEmployee, allEmployees, compromisedIds, failedIds }) {
  // Lateral — same department colleagues
  const lateral = allEmployees.filter(e =>
    e.department.toString() === sourceEmployee.department.toString() &&
    e._id.toString() !== sourceEmployee._id.toString() &&
    !compromisedIds.includes(e._id.toString()) &&
    !failedIds.includes(e._id.toString()) &&
    e.behavioralArchetype !== AVOID_ARCHETYPE
  )

  // Longitudinal — manager chain upward
  const longitudinal = allEmployees.filter(e =>
    e._id.toString() === sourceEmployee.manager?.toString() &&
    !compromisedIds.includes(e._id.toString()) &&
    e.behavioralArchetype !== AVOID_ARCHETYPE
  )

  return { lateral, longitudinal }
}

module.exports = { selectTechnique, getNextTargets, TECHNIQUES }