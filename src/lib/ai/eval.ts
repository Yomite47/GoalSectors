
export interface EvalResult {
    score_total: number;
    scores: {
        schema: number;
        sector_compliance: number;
        usefulness: number;
        efficiency: number;
    };
    reasons: string[];
    violated_sector: boolean;
    empty_actions: boolean;
}

export function evaluateRun(input: {
    enabledSectors: string[];
    userMessage: string;
    assistantMessage: string;
    actions: any[]; // The validated actions array
    schemaValid: boolean;
    latencyMs: number;
}): EvalResult {
    const { enabledSectors, actions, schemaValid, latencyMs, assistantMessage } = input;
    const reasons: string[] = [];
    
    // 1. Schema Score (0-25)
    const schemaScore = schemaValid ? 25 : 0;
    if (!schemaValid) reasons.push("Schema validation failed");

    // 2. Sector Compliance (0-25)
    let sectorScore = 25;
    let violatedSector = false;
    
    // Check every action against enabled sectors
    for (const action of actions) {
        let sector = '';
        if (action.type === 'CREATE_TASK') sector = 'Productivity';
        else if (action.type === 'CREATE_HABIT') sector = 'Habits';
        else if (action.type === 'CREATE_GOAL_PLAN') sector = 'Goals';

        if (sector && !enabledSectors.includes(sector)) {
            sectorScore = 0;
            violatedSector = true;
            reasons.push(`Action ${action.type} attempted in disabled sector: ${sector}`);
            break; 
        }
    }

    // 3. Usefulness (0-25)
    // Useful if actions were taken OR the assistant gave a helpful message
    let usefulnessScore = 10;
    const hasActions = actions.length > 0;
    // Heuristic for "clear next step": decent length and not just an error
    const hasClearNextStep = assistantMessage && assistantMessage.length > 20 && !assistantMessage.includes("Error");
    
    if (hasActions || hasClearNextStep) {
        usefulnessScore = 25;
    } else {
        reasons.push("No actions and unclear next step");
    }

    // 4. Efficiency (0-25)
    let efficiencyScore = 5;
    if (latencyMs < 1200) {
        efficiencyScore = 25;
    } else if (latencyMs < 2500) {
        efficiencyScore = 15;
    } else {
        reasons.push(`High latency: ${latencyMs}ms`);
    }

    const total = schemaScore + sectorScore + usefulnessScore + efficiencyScore;

    return {
        score_total: total,
        scores: {
            schema: schemaScore,
            sector_compliance: sectorScore,
            usefulness: usefulnessScore,
            efficiency: efficiencyScore
        },
        reasons,
        violated_sector: violatedSector,
        empty_actions: !hasActions
    };
}
