# AI-Based Smart Irrigation Advisory for Sugarcane

## Project Overview

The AI-Based Smart Irrigation Advisory project aims to support
irrigation-related decision-making using agricultural data,
statistical analysis, and a web-based advisory interface.

The project examines temperature, rainfall, and soil moisture
along with associated categories and irrigation recommendations.

The objective is to explore how data analysis can help identify
irrigation requirements and communicate useful recommendations.

## Problem Statement

Excessive or insufficient irrigation can affect crop growth and
water-use efficiency.

Farmers need practical ways to interpret environmental conditions
and make informed irrigation decisions.

This project investigates how statistical methods and a
rule-based advisory prototype can support irrigation planning.

## Objectives

- Analyze temperature, rainfall, and soil moisture.
- Calculate descriptive statistical measures.
- Prepare frequency distribution tables.
- Investigate relationships between numerical variables.
- Interpret irrigation-related patterns in the dataset.
- Develop a web-based irrigation advisory interface.
- Present the findings through graphs, tables, and a final report.

## Dataset

**Dataset file:** `Dataset/Crop_recommendationV2_final_modified.csv`

The final dataset contains:

- 2,200 observations
- 8 columns
- 0 missing values detected during validation
- 0 duplicate rows detected during validation

### Dataset Columns

| Column | Description |
|---|---|
| temperature | Temperature measurement |
| rainfall | Rainfall measurement |
| soil_moisture | Soil moisture value |
| Temperature Category | Temperature category |
| Rainfall Category | Rainfall category |
| Water Requirement | Water requirement classification |
| Irrigation Status | Irrigation status classification |
| AI Recommendation | Irrigation advice |

Refer to `Dataset/Dataset_Description.md` for the data source,
units, column definitions, and details of any modifications.

## Statistical Analysis

The project may include the following methods, depending on
the analyses completed:

- Mean
- Median
- Mode
- Range
- Variance
- Standard deviation
- Quartiles
- Frequency distributions
- Correlation analysis
- Outlier detection

The statistical results and interpretations are documented
in the `Statistics/` folder.

## Irrigation Advisory

The website provides an interface for examining input values
and displaying an irrigation recommendation.

The recommendation logic should be documented according to
the actual implementation in `Dashboard/script.js`.

Unless a trained machine-learning model is implemented and
evaluated, the prototype should be described as a rule-based
advisory system rather than a trained AI model.

## Project Structure

- `Dataset/` - Final dataset and dataset documentation
- `Dashboard/` - Website source files
- `Python_Code/` - Data analysis and cleaning programs
- `Statistics/` - Statistical calculations and tables
- `Graphs/` - Visualizations created from the dataset
- `Report/` - Final project report
- `PPT/` - Project presentation
- `Screenshots/` - Dashboard screenshots

## How to Run the Website

1. Download or clone this repository.
2. Open the `Dashboard/` folder.
3. Open `index.html` in a web browser.
4. Enter the requested values in the recommendation form.
5. View the displayed advisory.

## Limitations

- The recommendations depend on the data and rules used by
  the prototype.
- The dataset's source, units, and any derived values must be
  documented clearly.
- Statistical relationships do not by themselves establish
  causation.
- The advisory should not replace expert agricultural guidance
  or field-specific measurements.
- Recommendations require further validation using suitable
  agricultural data and field conditions.

## Team Contributions

Add the names of all six team members and their responsibilities
here.

## References

Add the original dataset source and any references used for
statistical methods, irrigation thresholds, or agricultural
recommendations.

## Disclaimer

This project is an academic prototype intended for educational
and analytical purposes. Its recommendations should not be
treated as validated agricultural instructions without further
testing.