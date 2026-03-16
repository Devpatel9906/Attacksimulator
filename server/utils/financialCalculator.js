const BREACH_COSTS = {
  email_phishing: { average: 130000, source: 'FBI IC3 2023' },
  credential_harvesting: { average: 4450000, source: 'IBM Cost of Breach 2023' },
  social_engineering: { average: 240000, source: 'FBI IC3 2023' },
  malware_simulation: { average: 4450000, source: 'Verizon DBIR 2023' },
  sim_swap: { average: 2700000, source: 'FBI IC3 2023' }
}

const INDUSTRY_MULTIPLIERS = {
  healthcare: 1.99,
  financial_services: 1.74,
  technology: 1.32,
  education: 1.15,
  retail: 0.89,
  other: 1.0
}

const ROLE_WEIGHTS = {
  admin: 1.0,
  it_support: 0.9,
  finance_manager: 0.8,
  finance_analyst: 0.6,
  hr_manager: 0.7,
  general_employee: 0.4
}

function calculateExposure({ compromisedEmployees, attackTypes, industry }) {
  const multiplier = INDUSTRY_MULTIPLIERS[industry] || 1.0
  let totalExposure = 0
  const breakdown = []

  for (const employee of compromisedEmployees) {
    const roleWeight = ROLE_WEIGHTS[employee.role] || 0.4
    for (const attackType of attackTypes) {
      const breachCost = BREACH_COSTS[attackType]?.average || 130000
      const exposure = roleWeight * breachCost * multiplier
      totalExposure += exposure
      breakdown.push({
        employeeId: employee._id,
        employeeName: employee.displayName,
        role: employee.role,
        attackType,
        roleWeight,
        breachCost,
        multiplier,
        exposure: Math.round(exposure)
      })
    }
  }

  return {
    totalExposure: Math.round(totalExposure),
    breakdown,
    industry,
    multiplier,
    sources: ['IBM Cost of Data Breach 2023', 'Verizon DBIR 2023', 'FBI IC3 2023']
  }
}

function calculateROI({ exposureBefore, exposureAfter, trainingCost = 3200 }) {
  const reduction = exposureBefore - exposureAfter
  const roi = reduction / trainingCost
  return {
    exposureBefore,
    exposureAfter,
    reductionAmount: Math.round(reduction),
    reductionPercent: Math.round((reduction / exposureBefore) * 100),
    trainingCost,
    roi: Math.round(roi),
    roiLabel: `${Math.round(roi)}x`
  }
}

function calculateInsuranceGap({ totalExposure, insuranceLimit }) {
  const gap = Math.max(0, totalExposure - insuranceLimit)
  return {
    totalExposure,
    insuranceLimit,
    coverageGap: gap,
    covered: totalExposure <= insuranceLimit,
    gapLabel: gap > 0 ? `$${(gap / 1000000).toFixed(1)}M uncovered` : 'Fully covered'
  }
}

module.exports = { calculateExposure, calculateROI, calculateInsuranceGap, BREACH_COSTS, INDUSTRY_MULTIPLIERS }