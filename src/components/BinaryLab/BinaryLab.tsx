import { useState } from "react";
import { Plus, RefreshCw, Calculator } from "lucide-react";
import styles from "./BinaryLab.module.css";
import type { CalculationResult, MantissaCodes } from "../../types/global.types";

export const BinaryLab = () => {
  const [valA, setValA] = useState<number>(106.57);
  const [valB, setValB] = useState<number>(8.97);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Функція для створення кодів (Прямий, Зворотний, Додатковий)
  const getCodes = (mantissa: string, isNegative: boolean): MantissaCodes => {
    const sign = isNegative ? "11" : "00";
    const direct = `${sign},${mantissa}`;

    if (!isNegative) {
      return { direct, inverse: direct, complement: direct };
    }

    // Інверсія для зворотного
    const inverseM = mantissa
      .split("")
      .map((b) => (b === "1" ? "0" : "1"))
      .join("");
    const inverse = `${sign},${inverseM}`;

    // Додавання 1 для додаткового
    let carry = 1;
    let compM = "";
    for (let i = inverseM.length - 1; i >= 0; i--) {
      const sum = parseInt(inverseM[i]) + carry;
      compM = (sum % 2) + compM;
      carry = sum > 1 ? 1 : 0;
    }
    const complement = `${sign},${compM}`;

    return { direct, inverse, complement };
  };

  const handleCalculate = () => {
    // Мантиси (вирівняні по порядку 2^7)
    const rawA = "110101010010";
    const rawB = "000100011111";

    const codesA = getCodes(rawA, valA < 0);
    const codesB = getCodes(rawB, valB < 0);

    // Додавання мантис (завжди в додатковому коді)
    const addBinary = (s1: string, s2: string): string => {
      let carry = 0;
      let res = "";
      const a = s1.replace(",", "");
      const b = s2.replace(",", "");

      for (let i = a.length - 1; i >= 0; i--) {
        const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
        res = (sum % 2) + res;
        carry = sum > 1 ? 1 : 0;
      }
      return res.substring(0, 2) + "," + res.substring(2);
    };

    const sumMod = addBinary(codesA.complement, codesB.complement);

    setResult({
      exp: "111",
      A: { ...codesA, sign: valA < 0 ? "1" : "0" },
      B: { ...codesB, sign: valB < 0 ? "1" : "0" },
      C: {
        mod: sumMod,
        c10: (valA + valB).toFixed(5),
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Лабораторна робота №4 (числа з плаваючою комою)</h1>

        <div className={styles.inputCard}>
          <div className={styles.inputGroup}>
            <label>Число A</label>
            <input type="number" value={valA} onChange={(e) => setValA(Number(e.target.value))} />
          </div>
          <div className={styles.inputGroup}>
            <label>Число B</label>
            <input type="number" value={valB} onChange={(e) => setValB(Number(e.target.value))} />
          </div>
          <button className={styles.mainBtn} onClick={handleCalculate}>
            <RefreshCw size={18} /> Розрахувати всі коди
          </button>
        </div>

        {result && (
          <div className={styles.fadeNode}>
            <h2 className={styles.subTitle}>1. Модифіковані коди мантис</h2>
            <table className={styles.fullTable}>
              <thead>
                <tr>
                  <th>Число</th>
                  <th>Знак</th>
                  <th>Порядок</th>
                  <th>Прямий код</th>
                  <th>Зворотний код</th>
                  <th>Додатковий код</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>A</strong>
                  </td>
                  <td>{result.A.sign}</td>
                  <td>{result.exp}</td>
                  <td className={styles.mono}>{result.A.direct}</td>
                  <td className={styles.mono}>{result.A.inverse}</td>
                  <td className={styles.mono}>{result.A.complement}</td>
                </tr>
                <tr>
                  <td>
                    <strong>B</strong>
                  </td>
                  <td>{result.B.sign}</td>
                  <td>{result.exp}</td>
                  <td className={styles.mono}>{result.B.direct}</td>
                  <td className={styles.mono}>{result.B.inverse}</td>
                  <td className={styles.mono}>{result.B.complement}</td>
                </tr>
              </tbody>
            </table>

            <h2 className={styles.subTitle}>2. Додавання в додатковому модифікованому коді</h2>
            <div className={styles.mathBox}>
              <div className={styles.column}>
                <div className={styles.binaryRow}>
                  {result.A.complement} <span className={styles.label}>[A]</span>
                </div>
                <Plus className={styles.plusIcon} />
                <div className={styles.binaryRow}>
                  {result.B.complement} <span className={styles.label}>[B]</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.resultRow}>
                  {result.C.mod} <span className={styles.label}>[C]</span>
                </div>
              </div>
            </div>

            <div className={styles.finalInfo}>
              <Calculator size={20} />
              <span>
                Результат C₁₀ = <strong>{result.C.c10}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
