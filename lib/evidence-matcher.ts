/**
 * Pure validation logic for civic resolution evidence matching.
 * Compares citizen issue reports with authority-submitted resolution proof.
 */

export interface ResolutionAiVerdict {
  matchesLocation?: boolean;
  matches?: boolean;
  isResolved?: boolean;
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
 * Rejects if:
 * 1. The photo is an unrelated location or object (matchesLocation === false).
 * 2. The photo is the same location, but the problem is STILL UNSOLVED (isResolved === false).
 * Low confidence mismatches or uncertainties fall back to manual review with a cautionary note.
 */
export function evaluateResolutionVerdict(verdict: ResolutionAiVerdict): ResolutionDecision {
  const matchesLoc = verdict.matchesLocation !== undefined ? verdict.matchesLocation : verdict.matches !== false;
  const isResolved = verdict.isResolved !== undefined ? verdict.isResolved : verdict.matches !== false;

  // Case 1: Unrelated scene / wrong location
  if (!matchesLoc && verdict.confidence !== 'low') {
    return {
      accepted: false,
      message: verdict.reason?.trim() || 'The uploaded resolution photo does not appear to match the reported issue location.'
    };
  }

  // Case 2: Same location, but problem is STILL UNSOLVED / unrepaired
  if (!isResolved && verdict.confidence !== 'low') {
    return {
      accepted: false,
      message: verdict.reason?.trim() || 'The civic issue is not solved. The uploaded photo still shows the problem unrepaired or uncleaned.'
    };
  }

  // Case 3: Low confidence uncertainty
  if ((!matchesLoc || !isResolved) && verdict.confidence === 'low') {
    return {
      accepted: true,
      message: verdict.reason?.trim() || 'Resolution proof accepted pending community verification.'
    };
  }

  // Case 4: Verified match and verified resolved
  return {
    accepted: true,
    message: verdict.reason?.trim() || 'Resolution evidence verified: issue has been repaired/cleared.'
  };
}
