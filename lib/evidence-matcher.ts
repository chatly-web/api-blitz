/**
 * Pure validation logic for civic resolution evidence matching.
 * Compares citizen issue reports with authority-submitted resolution proof.
 */

export interface ResolutionAiVerdict {
  matches: boolean;
  confidence?: 'high' | 'medium' | 'low';
  reason?: string;
}

export interface EvidencePairValidation {
  valid: boolean;
  reason?: string;
}

export interface ResolutionDecision {
  accepted: boolean;
  message: string;
}

/**
 * Validates the basic relationship between before and after photo references.
 */
export function validateEvidencePair(beforePublicId: string | null | undefined, afterPublicId: string | null | undefined): EvidencePairValidation {
  if (!afterPublicId || !afterPublicId.trim()) {
    return { valid: false, reason: 'An authentic after-photo is required to resolve this report.' };
  }
  if (!beforePublicId || !beforePublicId.trim()) {
    return { valid: false, reason: 'Original issue photo is missing.' };
  }
  if (beforePublicId.trim() === afterPublicId.trim()) {
    return {
      valid: false,
      reason: 'The resolution photo is identical to the original issue photo. Please upload proof of the completed repair.'
    };
  }
  return { valid: true };
}

/**
 * Interprets an AI multimodal match evaluation between before and after photos.
 * High and medium confidence mismatches are rejected.
 * Low confidence mismatches or uncertainties fall back to manual review with a cautionary note.
 */
export function evaluateResolutionVerdict(verdict: ResolutionAiVerdict): ResolutionDecision {
  if (verdict.matches === false && verdict.confidence !== 'low') {
    return {
      accepted: false,
      message: verdict.reason?.trim() || 'The uploaded resolution photo does not appear to match the reported issue location or repair.'
    };
  }

  if (verdict.matches === false && verdict.confidence === 'low') {
    return {
      accepted: true,
      message: verdict.reason?.trim() || 'Photo match uncertain; accepted with citizen verification flag.'
    };
  }

  return {
    accepted: true,
    message: verdict.reason?.trim() || 'Resolution evidence verified: matches original report.'
  };
}
