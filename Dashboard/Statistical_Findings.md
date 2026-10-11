# Statistical Findings – Smart Irrigation Advisory

Workbook: `Smart_Irrigation_Statistical_Analysis.xlsx` (all results are live Excel formulas).
Dataset: `Crop_recommendationV2_final.csv`, 2,200 records: temperature (°C), rainfall (mm), soil moisture (%), plus derived categories and an irrigation status.

## 1. Data validation
No missing values, duplicate records, out-of-range values or inconsistent labels were found. Temperature and rainfall categories match the cutoffs inferred from the data (Cool < 20 °C, Hot ≥ 30 °C; Low < 50 mm, High ≥ 150 mm).

## 2. Descriptive statistics

| Variable | Mean | Median | SD | Min | Max | Q1 | Q3 | Skew |
|---|---|---|---|---|---|---|---|---|
| Temperature (°C) | 25.62 | 25.60 | 5.06 | 8.83 | 43.68 | 22.77 | 28.56 | 0.18 |
| Rainfall (mm) | 103.46 | 94.87 | 54.96 | 20.21 | 298.56 | 64.55 | 124.27 | 0.97 |
| Soil moisture (%) | 20.15 | 20.09 | 5.79 | 10.02 | 30.00 | 15.18 | 25.26 | -0.02 |

- Soil moisture is spread almost evenly from 10% to 30% (kurtosis -1.22, flatter than normal).
- Rainfall is right-skewed (mean above median); use the median for "typical" rainfall.
- No raw value repeats, so the mode is reported as a modal class: temperature 23–26 °C, rainfall 50–75 mm, soil moisture 28–30%.

## 3. Correlation

| Pair | r | p-value | Strength |
|---|---|---|---|
| Temperature vs rainfall | -0.030 | 0.158 | Negligible |
| Temperature vs soil moisture | -0.010 | 0.645 | Negligible |
| Rainfall vs soil moisture | -0.049 | 0.023 | Negligible |

All relationships are negligible. Rainfall vs moisture is detectable at n = 2,200 but explains only about 0.2% of variation. Real fields normally show a clear positive link between rainfall and soil moisture, so its absence suggests soil moisture was not derived from rainfall.

## 4. Cross-tabulation (rainfall category × irrigation status)

| Rainfall | Irrigate Now | Monitor | No Irrigation Needed |
|---|---|---|---|
| Low | 38.7% | 61.3% | 0.0% |
| Moderate | 22.7% | 65.6% | 11.7% |
| High | 0.0% | 77.6% | 22.4% |

Chi-square = 229.2, p < 0.001, Cramér's V = 0.23 (weak-to-moderate). This pattern is built in, because rainfall is an input of the irrigation rule.

## 5. Outliers (IQR, k = 1.5)
- Temperature: 86 outliers (38 cold, 48 hot), 3.9%
- Rainfall: 100 high outliers, 4.5%
- Soil moisture: none

These are plausible extremes, not entry errors, so they were kept.

## 6. Comparison by irrigation status

| Status | N | Avg moisture (%) | Avg rainfall (mm) | Avg temperature (°C) |
|---|---|---|---|---|
| Irrigate Now | 456 | 13.99 | 64.96 | 26.17 |
| Monitor | 1,480 | 20.72 | 108.05 | 25.58 |
| No Irrigation Needed | 264 | 27.61 | 144.25 | 24.87 |

## 7. Engineering insights
- Irrigation status follows a fixed rule: **Irrigate Now** if moisture < 18% and rainfall < 100 mm; **No Irrigation** if moisture ≥ 25% and rainfall ≥ 100 mm; otherwise **Monitor**. All 2,200 rows match it.
- Between the two extreme statuses, moisture differs by about 2.4 SD, rainfall by 1.4 SD and temperature by 0.26 SD. Soil moisture is therefore the variable most closely associated with irrigation need, then rainfall; temperature is not in the rule.
- These are associations in a rule-labelled dataset. They do not show that moisture or rainfall cause irrigation need, and correlation alone would not support that claim.

## 8. Limitations
- Soil moisture appears simulated (even spread, no relationship with rainfall, many decimals).
- The system is rule-based (fixed thresholds), not machine learning.
- The README currently describes 20 observations and different thresholds (25/30/35%); it should be updated to match this dataset.
