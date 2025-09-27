export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Survey validation
export function validateSurveyForm(data: {
  title: string;
  description: string;
  expectedResponses: number;
  reward: number;
  questions: any[];
}): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title.trim()) {
    errors.push({ field: 'title', message: 'Survey title is required' });
  } else if (data.title.length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters long' });
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must not exceed 100 characters' });
  }

  // Description validation
  if (!data.description.trim()) {
    errors.push({ field: 'description', message: 'Survey description is required' });
  } else if (data.description.length < 20) {
    errors.push({ field: 'description', message: 'Description must be at least 20 characters long' });
  } else if (data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
  }

  // Expected responses validation
  if (!data.expectedResponses || data.expectedResponses < 1) {
    errors.push({ field: 'expectedResponses', message: 'Expected responses must be at least 1' });
  } else if (data.expectedResponses > 10000) {
    errors.push({ field: 'expectedResponses', message: 'Expected responses cannot exceed 10,000' });
  }

  // Reward validation
  if (!data.reward || data.reward <= 0) {
    errors.push({ field: 'reward', message: 'Reward must be greater than 0' });
  } else if (data.reward > 100) {
    errors.push({ field: 'reward', message: 'Reward cannot exceed 100 ETH per response' });
  }

  // Questions validation
  if (!data.questions || data.questions.length === 0) {
    errors.push({ field: 'questions', message: 'At least one question is required' });
  } else if (data.questions.length > 50) {
    errors.push({ field: 'questions', message: 'Survey cannot have more than 50 questions' });
  } else {
    // Validate each question
    data.questions.forEach((question, index) => {
      const questionErrors = validateQuestion(question, index);
      errors.push(...questionErrors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateQuestion(question: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const fieldPrefix = `question-${index}`;

  // Title validation
  if (!question.title?.trim()) {
    errors.push({ field: `${fieldPrefix}-title`, message: `Question ${index + 1}: Title is required` });
  } else if (question.title.length < 5) {
    errors.push({ field: `${fieldPrefix}-title`, message: `Question ${index + 1}: Title must be at least 5 characters long` });
  } else if (question.title.length > 200) {
    errors.push({ field: `${fieldPrefix}-title`, message: `Question ${index + 1}: Title must not exceed 200 characters` });
  }

  // Type-specific validation
  if (question.type === 'multiple-choice' || question.type === 'poll') {
    if (!question.options || question.options.length < 2) {
      errors.push({ field: `${fieldPrefix}-options`, message: `Question ${index + 1}: At least 2 options are required` });
    } else if (question.options.length > 10) {
      errors.push({ field: `${fieldPrefix}-options`, message: `Question ${index + 1}: Maximum 10 options allowed` });
    } else {
      // Validate each option
      question.options.forEach((option: string, optionIndex: number) => {
        if (!option?.trim()) {
          errors.push({ field: `${fieldPrefix}-option-${optionIndex}`, message: `Question ${index + 1}: Option ${optionIndex + 1} cannot be empty` });
        } else if (option.length > 100) {
          errors.push({ field: `${fieldPrefix}-option-${optionIndex}`, message: `Question ${index + 1}: Option ${optionIndex + 1} must not exceed 100 characters` });
        }
      });
    }
  }

  if (question.type === 'rating') {
    if (!question.minRating || question.minRating < 1) {
      errors.push({ field: `${fieldPrefix}-minRating`, message: `Question ${index + 1}: Minimum rating must be at least 1` });
    }
    if (!question.maxRating || question.maxRating < question.minRating) {
      errors.push({ field: `${fieldPrefix}-maxRating`, message: `Question ${index + 1}: Maximum rating must be greater than minimum rating` });
    }
    if (question.maxRating > 10) {
      errors.push({ field: `${fieldPrefix}-maxRating`, message: `Question ${index + 1}: Maximum rating cannot exceed 10` });
    }
  }

  return errors;
}

// Survey response validation
export function validateSurveyResponse(answers: any[], questions: any[]): ValidationResult {
  const errors: ValidationError[] = [];

  questions.forEach((question, index) => {
    const answer = answers.find(a => a.questionId === question.id);

    if (question.required && (!answer || !answer.value)) {
      errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} is required` });
      return;
    }

    if (answer && answer.value) {
      // Type-specific validation
      if (question.type === 'text') {
        if (typeof answer.value !== 'string') {
          errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} must be text` });
        } else if (answer.value.length > 1000) {
          errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} must not exceed 1000 characters` });
        }
      }

      if (question.type === 'rating') {
        const rating = Number(answer.value);
        if (isNaN(rating) || rating < question.minRating || rating > question.maxRating) {
          errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} rating must be between ${question.minRating} and ${question.maxRating}` });
        }
      }

      if (question.type === 'multiple-choice') {
        if (!question.options?.includes(answer.value)) {
          errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} has an invalid option selected` });
        }
      }

      if (question.type === 'poll') {
        if (!Array.isArray(answer.value)) {
          errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} must have array values` });
        } else {
          const invalidOptions = answer.value.filter((v: string) => !question.options?.includes(v));
          if (invalidOptions.length > 0) {
            errors.push({ field: `answer-${question.id}`, message: `Question ${index + 1} has invalid options selected` });
          }
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Email validation (for future use)
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Wallet address validation (for future Web3 integration)
export function validateWalletAddress(address: string): boolean {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

// Generic field validation
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationError | null {
  if (value && value.length < minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${minLength} characters long` };
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationError | null {
  if (value && value.length > maxLength) {
    return { field: fieldName, message: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return null;
}

export function validateRange(value: number, min: number, max: number, fieldName: string): ValidationError | null {
  if (value < min || value > max) {
    return { field: fieldName, message: `${fieldName} must be between ${min} and ${max}` };
  }
  return null;
}