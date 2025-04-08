export function validateCep(cep: string): void {
    if (!cep.match(/^\d{5}-?\d{3}$/)) {
      throw new Error('Invalid CEP format');
    }
  }