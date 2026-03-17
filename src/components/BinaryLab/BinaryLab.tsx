import { useState } from "react";
import { Plus, RefreshCw, Calculator } from "lucide-react";
import styles from "./BinaryLab.module.css";
import type { CalculationResult, MantissaCodes } from "../../types/global.types";

export const BinaryLab = () => {
  const [valA, setValA] = useState<number>(106.57);
  const [valB, setValB] = useState<number>(8.97);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const getBinaryData = (num: number) => {
    const absNum = Math.abs(num);
    const integerPart = Math.floor(absNum);
    let fractionalPart = absNum - integerPart;

    const binInt = integerPart.toString(2);
    let binFract = "";
    while (binFract.length < 15 && fractionalPart > 0) {
      fractionalPart *= 2;
      binFract += Math.floor(fractionalPart);
      fractionalPart -= Math.floor(fractionalPart);
    }

    const exponent = integerPart > 0 ? binInt.length : 0;
    const rawMantissa = (binInt + binFract).padEnd(12, "0").substring(0, 12);

    return { mantissa: rawMantissa, exp: exponent };
  };

  const getCodes = (mantissa: string, isNegative: boolean): MantissaCodes => {
    const sign = isNegative ? "11" : "00";
    const direct = `${sign},${mantissa}`;

    if (!isNegative) {
      return { direct, inverse: direct, complement: direct };
    }

    const inverseM = mantissa
      .split("")
      .map((b) => (b === "1" ? "0" : "1"))
      .join("");
    const inverse = `${sign},${inverseM}`;

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

  const handleCalculate = () => {
    const dataA = getBinaryData(valA);
    const dataB = getBinaryData(valB);

    const maxExp = Math.max(dataA.exp, dataB.exp);

    const alignMantissa = (m: string, currentExp: number, targetExp: number) => {
      const diff = targetExp - currentExp;
      if (diff <= 0) return m;
      return "0".repeat(diff) + m.substring(0, 12 - diff);
    };

    const mantA = alignMantissa(dataA.mantissa, dataA.exp, maxExp);
    const mantB = alignMantissa(dataB.mantissa, dataB.exp, maxExp);

    const codesA = getCodes(mantA, valA < 0);
    const codesB = getCodes(mantB, valB < 0);

    const sumMod = addBinary(codesA.complement, codesB.complement);

    setResult({
      exp: maxExp.toString(2).padStart(3, "0"),
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
