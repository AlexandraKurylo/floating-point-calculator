// Типи для кодів мантис
export interface MantissaCodes {
  direct: string;
  inverse: string;
  complement: string;
}

// Додаємо поле sign для об'єктів A та B
export interface ExtendedCodes extends MantissaCodes {
  sign: string;
}

// Cтруктура всього об'єкта результату
export interface CalculationResult {
  exp: string;
  A: ExtendedCodes;
  B: ExtendedCodes;
  C: {
    mod: string;
    c10: string;
  };
}
