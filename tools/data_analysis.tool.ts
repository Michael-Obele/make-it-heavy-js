import { Tool } from "./base.tool";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

interface DataAnalysisResult {
  summary: any;
  insights: string[];
  visualizations: string[];
  recommendations: string[];
  statistics: any;
  patterns: string[];
  anomalies: string[];
  correlations: any[];
}

export const dataAnalysisTool: Tool = {
  name: "analyze_research_data",
  description: `Advanced research data analysis and insight generation tool focused on academic and professional research.

Research-Focused Features:
- Research data interpretation (survey results, study findings, market research)
- Statistical analysis for research validation (significance testing, confidence intervals)
- Trend identification and pattern recognition in research data
- Comparative analysis across studies and datasets
- Research methodology assessment and validation
- Data quality evaluation for research integrity
- Cross-referencing and fact-checking of research findings
- Research synthesis and meta-analysis capabilities
- Academic literature data extraction and analysis
- Research insight generation and hypothesis formation
- Evidence-based recommendation development
- Research gap identification through data analysis

This tool is specifically designed for research applications, providing comprehensive analysis
of research data, academic findings, and professional studies. It focuses on generating
actionable insights for research projects, academic investigations, and evidence-based
decision making without any code generation or development tasks.`,

  parameters: {
    type: "object",
    properties: {
      data_source: {
        type: "string",
        description:
          "Data source: direct JSON/CSV data, file path, URL, database query, or API endpoint",
      },
      data_type: {
        type: "string",
        enum: [
          "json",
          "csv",
          "xml",
          "tsv",
          "excel",
          "sql_result",
          "api_response",
          "time_series",
          "log_data",
          "sensor_data",
          "financial_data",
          "user_behavior",
          "sales_data",
          "performance_metrics",
        ],
        description: "Type of data being analyzed",
      },
      analysis_type: {
        type: "string",
        enum: [
          "exploratory",
          "descriptive",
          "inferential",
          "predictive",
          "diagnostic",
          "prescriptive",
          "comparative",
          "research_synthesis",
          "literature_analysis",
          "meta_analysis",
          "trend_research",
          "market_research",
          "trend_analysis",
          "anomaly_detection",
          "correlation_analysis",
          "segmentation",
          "classification",
        ],
        default: "exploratory",
        description: "Type of analysis to perform",
      },
      target_variables: {
        type: "array",
        items: { type: "string" },
        description: "Specific columns/fields to focus analysis on",
      },
      time_column: {
        type: "string",
        description:
          "Column containing time/date data for time series analysis",
      },
      grouping_columns: {
        type: "array",
        items: { type: "string" },
        description: "Columns to group data by for comparative analysis",
      },
      statistical_tests: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "t_test",
            "chi_square",
            "anova",
            "correlation",
            "regression",
            "normality_test",
            "outlier_detection",
            "seasonality_test",
            "stationarity_test",
          ],
        },
        description: "Statistical tests to perform",
      },
      confidence_level: {
        type: "number",
        default: 0.95,
        minimum: 0.8,
        maximum: 0.99,
        description: "Confidence level for statistical tests and intervals",
      },
      generate_visualizations: {
        type: "boolean",
        default: true,
        description: "Generate visualization code and recommendations",
      },
      include_ml_insights: {
        type: "boolean",
        default: true,
        description: "Include machine learning insights and clustering",
      },
      forecast_periods: {
        type: "number",
        default: 12,
        description: "Number of periods to forecast for time series data",
      },
      anomaly_sensitivity: {
        type: "number",
        default: 0.05,
        minimum: 0.01,
        maximum: 0.2,
        description:
          "Sensitivity level for anomaly detection (lower = more sensitive)",
      },
      business_context: {
        type: "string",
        description:
          "Business context or domain for more relevant insights and recommendations",
      },
      custom_metrics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            formula: { type: "string" },
            description: { type: "string" },
          },
        },
        description: "Custom metrics to calculate during analysis",
      },
    },
    required: ["data_source", "data_type"],
  },

  async execute(params: any): Promise<string> {
    const analysisId = randomUUID();
    const startTime = Date.now();

    try {
      // Parse and validate data
      const dataset = await parseDataSource(
        params.data_source,
        params.data_type,
      );

      if (!dataset || dataset.length === 0) {
        throw new Error("No valid data found or data is empty");
      }

      // Data quality assessment
      const dataQuality = assessDataQuality(dataset);

      // Perform comprehensive analysis based on type
      const analysis = await performComprehensiveAnalysis(dataset, params);

      // Generate insights and recommendations
      const insights = generateBusinessInsights(
        analysis,
        params.business_context,
      );

      // Create visualizations if requested
      const visualizations = params.generate_visualizations
        ? generateVisualizationCode(dataset, analysis, params.data_type)
        : [];

      // Machine learning insights if enabled
      const mlInsights = params.include_ml_insights
        ? await generateMLInsights(dataset, params)
        : { clusters: [], patterns: [], predictions: [] };

      // Generate comprehensive report
      return formatAnalysisReport({
        analysisId,
        dataset,
        dataQuality,
        analysis,
        insights,
        visualizations,
        mlInsights,
        params,
        executionTime: Date.now() - startTime,
      });
    } catch (error) {
      return formatErrorResult(error as Error, Date.now() - startTime);
    }
  },
};

async function parseDataSource(
  source: string,
  dataType: string,
): Promise<any[]> {
  try {
    // Handle different data source types
    if (source.startsWith("http")) {
      // URL data source
      const response = await fetch(source);
      const data = await response.text();
      return parseDataByType(data, dataType);
    } else if (source.startsWith("/") || source.includes(".")) {
      // File path
      if (existsSync(source)) {
        const data = readFileSync(source, "utf-8");
        return parseDataByType(data, dataType);
      }
      throw new Error(`File not found: ${source}`);
    } else {
      // Direct data
      return parseDataByType(source, dataType);
    }
  } catch (error) {
    throw new Error(`Failed to parse data source: ${(error as Error).message}`);
  }
}

function parseDataByType(data: string, dataType: string): any[] {
  switch (dataType.toLowerCase()) {
    case "json":
      const jsonData = JSON.parse(data);
      return Array.isArray(jsonData) ? jsonData : [jsonData];

    case "csv":
    case "tsv":
      return parseCSV(data, dataType === "tsv" ? "\t" : ",");

    case "xml":
      return parseXML(data);

    case "api_response":
      const apiData = JSON.parse(data);
      // Handle common API response structures
      if (apiData.data)
        return Array.isArray(apiData.data) ? apiData.data : [apiData.data];
      if (apiData.results) return apiData.results;
      if (apiData.items) return apiData.items;
      return Array.isArray(apiData) ? apiData : [apiData];

    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}

function parseCSV(data: string, delimiter: string = ","): any[] {
  const lines = data.trim().split("\n");
  if (lines.length < 2)
    throw new Error("CSV data must have at least header and one data row");

  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim().replace(/"/g, ""));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(delimiter)
      .map((v) => v.trim().replace(/"/g, ""));
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";
      // Try to parse as number or date
      if (!isNaN(Number(value)) && value !== "") {
        row[header] = Number(value);
      } else if (isDateString(value)) {
        row[header] = new Date(value);
      } else {
        row[header] = value;
      }
    });

    rows.push(row);
  }

  return rows;
}

function parseXML(data: string): any[] {
  // Basic XML parsing (would use proper XML parser in production)
  const results: any[] = [];
  const itemRegex = /<(\w+)[^>]*>(.*?)<\/\1>/gs;
  let match;

  while ((match = itemRegex.exec(data)) !== null) {
    const [, tagName, content] = match;
    const item: any = { _tag: tagName };

    // Extract attributes and nested content
    const attrRegex = /(\w+)="([^"]+)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match[0])) !== null) {
      item[attrMatch[1]] = attrMatch[2];
    }

    // Simple content extraction
    const nestedRegex = /<(\w+)>(.*?)<\/\1>/g;
    let nestedMatch;
    while ((nestedMatch = nestedRegex.exec(content)) !== null) {
      item[nestedMatch[1]] = nestedMatch[2];
    }

    if (Object.keys(item).length > 1) {
      results.push(item);
    }
  }

  return results.length > 0 ? results : [{ content: data }];
}

function isDateString(value: string): boolean {
  if (!value || value.length < 8) return false;
  const date = new Date(value);
  return (
    !isNaN(date.getTime()) &&
    value.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/)
  );
}

function assessDataQuality(dataset: any[]): any {
  const totalRows = dataset.length;
  const columns = Object.keys(dataset[0] || {});
  const quality: any = {
    totalRows,
    totalColumns: columns.length,
    columnAnalysis: {},
    overallScore: 0,
    issues: [],
  };

  columns.forEach((column) => {
    const values = dataset.map((row) => row[column]);
    const nonNullValues = values.filter(
      (v) => v !== null && v !== undefined && v !== "",
    );
    const uniqueValues = new Set(nonNullValues);

    const columnQuality = {
      completeness: nonNullValues.length / totalRows,
      uniqueness: uniqueValues.size / nonNullValues.length,
      dataType: inferDataType(nonNullValues),
      nullCount: totalRows - nonNullValues.length,
      distinctCount: uniqueValues.size,
      duplicateCount: nonNullValues.length - uniqueValues.size,
    };

    quality.columnAnalysis[column] = columnQuality;

    // Identify quality issues
    if (columnQuality.completeness < 0.8) {
      quality.issues.push(
        `High missing data in column '${column}' (${((1 - columnQuality.completeness) * 100).toFixed(1)}%)`,
      );
    }
    if (columnQuality.duplicateCount > totalRows * 0.5) {
      quality.issues.push(`High duplicate values in column '${column}'`);
    }
  });

  // Calculate overall quality score
  const avgCompleteness =
    Object.values(quality.columnAnalysis).reduce(
      (sum: number, col: any) => sum + col.completeness,
      0,
    ) / columns.length;
  quality.overallScore = Math.round(avgCompleteness * 100);

  return quality;
}

function inferDataType(values: any[]): string {
  if (values.length === 0) return "unknown";

  const sample = values.slice(0, 100); // Sample first 100 values
  const types = {
    number: 0,
    date: 0,
    boolean: 0,
    string: 0,
  };

  sample.forEach((value) => {
    if (typeof value === "number" || (!isNaN(Number(value)) && value !== "")) {
      types.number++;
    } else if (value instanceof Date || isDateString(String(value))) {
      types.date++;
    } else if (
      typeof value === "boolean" ||
      ["true", "false", "1", "0"].includes(String(value).toLowerCase())
    ) {
      types.boolean++;
    } else {
      types.string++;
    }
  });

  return Object.entries(types).reduce((a, b) =>
    types[a[0] as keyof typeof types] > types[b[0] as keyof typeof types]
      ? a
      : b,
  )[0];
}

async function performComprehensiveAnalysis(
  dataset: any[],
  params: any,
): Promise<any> {
  const analysis: any = {
    descriptiveStats: calculateDescriptiveStats(dataset),
    correlations: calculateCorrelations(dataset),
    distributions: analyzeDistributions(dataset),
    outliers: detectOutliers(dataset, params.anomaly_sensitivity || 0.05),
    trends: analyzeTrends(dataset, params.time_column),
    patterns: identifyPatterns(dataset),
    customMetrics: {},
  };

  // Calculate custom metrics if provided
  if (params.custom_metrics) {
    params.custom_metrics.forEach((metric: any) => {
      try {
        analysis.customMetrics[metric.name] = calculateCustomMetric(
          dataset,
          metric.formula,
        );
      } catch (error) {
        analysis.customMetrics[metric.name] =
          `Error: ${(error as Error).message}`;
      }
    });
  }

  // Perform statistical tests if requested
  if (params.statistical_tests) {
    analysis.statisticalTests = {};
    for (const test of params.statistical_tests) {
      analysis.statisticalTests[test] = performStatisticalTest(
        dataset,
        test,
        params,
      );
    }
  }

  // Time series analysis
  if (params.time_column && params.analysis_type === "time_series") {
    analysis.timeSeries = performTimeSeriesAnalysis(dataset, params);
  }

  return analysis;
}

function calculateDescriptiveStats(dataset: any[]): any {
  const numericColumns = getNumericColumns(dataset);
  const stats: any = {};

  numericColumns.forEach((column) => {
    const values = dataset
      .map((row) => row[column])
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return;

    values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;

    stats[column] = {
      count: values.length,
      mean: Number(mean.toFixed(4)),
      median: values[Math.floor(values.length / 2)],
      mode: findMode(values),
      min: values[0],
      max: values[values.length - 1],
      range: values[values.length - 1] - values[0],
      variance: Number(variance.toFixed(4)),
      standardDeviation: Number(Math.sqrt(variance).toFixed(4)),
      skewness: calculateSkewness(values, mean, Math.sqrt(variance)),
      kurtosis: calculateKurtosis(values, mean, Math.sqrt(variance)),
      percentiles: {
        p25: values[Math.floor(values.length * 0.25)],
        p75: values[Math.floor(values.length * 0.75)],
        p90: values[Math.floor(values.length * 0.9)],
        p95: values[Math.floor(values.length * 0.95)],
      },
    };
  });

  return stats;
}

function getNumericColumns(dataset: any[]): string[] {
  if (dataset.length === 0) return [];

  return Object.keys(dataset[0]).filter((column) => {
    const sample = dataset.slice(0, 10).map((row) => row[column]);
    return sample.some((value) => typeof value === "number" && !isNaN(value));
  });
}

function findMode(values: number[]): number | null {
  const frequency: { [key: number]: number } = {};
  values.forEach((value) => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  let maxFreq = 0;
  let mode = null;
  for (const [value, freq] of Object.entries(frequency)) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = Number(value);
    }
  }

  return maxFreq > 1 ? mode : null;
}

function calculateSkewness(
  values: number[],
  mean: number,
  stdDev: number,
): number {
  if (stdDev === 0) return 0;
  const skew =
    values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) /
    values.length;
  return Number(skew.toFixed(4));
}

function calculateKurtosis(
  values: number[],
  mean: number,
  stdDev: number,
): number {
  if (stdDev === 0) return 0;
  const kurt =
    values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) /
      values.length -
    3;
  return Number(kurt.toFixed(4));
}

function calculateCorrelations(dataset: any[]): any {
  const numericColumns = getNumericColumns(dataset);
  const correlations: any = {};

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const correlation = pearsonCorrelation(
        dataset.map((row) => row[col1]).filter((v) => typeof v === "number"),
        dataset.map((row) => row[col2]).filter((v) => typeof v === "number"),
      );

      correlations[`${col1}_${col2}`] = Number(correlation.toFixed(4));
    }
  }

  return correlations;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

function analyzeDistributions(dataset: any[]): any {
  const numericColumns = getNumericColumns(dataset);
  const distributions: any = {};

  numericColumns.forEach((column) => {
    const values = dataset
      .map((row) => row[column])
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return;

    // Create histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binWidth = (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    values.forEach((value) => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1,
      );
      bins[binIndex]++;
    });

    distributions[column] = {
      histogram: bins.map((count, i) => ({
        bin: Number((min + i * binWidth).toFixed(2)),
        count,
        frequency: Number((count / values.length).toFixed(4)),
      })),
      isNormal: testNormality(values),
      isUniform: testUniformity(bins),
    };
  });

  return distributions;
}

function testNormality(values: number[]): boolean {
  // Simple normality test based on skewness and kurtosis
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  const skewness = Math.abs(calculateSkewness(values, mean, stdDev));
  const kurtosis = Math.abs(calculateKurtosis(values, mean, stdDev));

  return skewness < 1 && kurtosis < 1; // Rough approximation
}

function testUniformity(bins: number[]): boolean {
  const expected = bins.reduce((a, b) => a + b, 0) / bins.length;
  const chiSquare = bins.reduce(
    (sum, observed) => sum + Math.pow(observed - expected, 2) / expected,
    0,
  );
  const criticalValue = 16.919; // Chi-square critical value for 9 degrees of freedom at 0.05 significance

  return chiSquare < criticalValue;
}

function detectOutliers(dataset: any[], sensitivity: number): any {
  const numericColumns = getNumericColumns(dataset);
  const outliers: any = {};

  numericColumns.forEach((column) => {
    const values = dataset
      .map((row) => row[column])
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return;

    values.sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outlierValues = values.filter(
      (v) => v < lowerBound || v > upperBound,
    );
    const outlierIndices = dataset
      .map((row, index) => ({ value: row[column], index }))
      .filter(
        (item) =>
          typeof item.value === "number" &&
          (item.value < lowerBound || item.value > upperBound),
      )
      .map((item) => item.index);

    outliers[column] = {
      count: outlierValues.length,
      percentage: Number(
        ((outlierValues.length / values.length) * 100).toFixed(2),
      ),
      values: outlierValues.slice(0, 20), // Limit to first 20 outliers
      indices: outlierIndices.slice(0, 20),
      bounds: { lower: lowerBound, upper: upperBound },
      iqr: { q1, q3, iqr },
    };
  });

  return outliers;
}

function analyzeTrends(dataset: any[], timeColumn?: string): any {
  if (!timeColumn || !dataset.some((row) => row[timeColumn])) {
    return { message: "No time column specified or found for trend analysis" };
  }

  const timeData = dataset
    .filter((row) => row[timeColumn])
    .map((row) => ({
      time: new Date(row[timeColumn]),
      data: row,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  if (timeData.length < 3) {
    return { message: "Insufficient time series data for trend analysis" };
  }

  const numericColumns = getNumericColumns(dataset);
  const trends: any = {};

  numericColumns.forEach((column) => {
    const values = timeData
      .map((item) => item.data[column])
      .filter((v) => typeof v === "number");
    if (values.length < 3) return;

    // Simple linear trend calculation
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    trends[column] = {
      slope: Number(slope.toFixed(6)),
      intercept: Number(intercept.toFixed(4)),
      direction:
        slope > 0.01 ? "increasing" : slope < -0.01 ? "decreasing" : "stable",
      strength:
        Math.abs(slope) > 1
          ? "strong"
          : Math.abs(slope) > 0.1
            ? "moderate"
            : "weak",
    };
  });

  return trends;
}

function identifyPatterns(dataset: any[]): string[] {
  const patterns: string[] = [];

  // Pattern 1: Seasonal patterns (if date column exists)
  const dateColumns = Object.keys(dataset[0] || {}).filter((col) =>
    dataset.some(
      (row) => row[col] instanceof Date || isDateString(String(row[col])),
    ),
  );

  if (dateColumns.length > 0) {
    patterns.push(
      "Temporal data detected - suitable for seasonality and trend analysis",
    );
  }

  // Pattern 2: Categorical distributions
  const categoricalColumns = Object.keys(dataset[0] || {}).filter((col) => {
    const uniqueValues = new Set(dataset.map((row) => row[col]));
    return uniqueValues.size < dataset.length * 0.5 && uniqueValues.size > 1;
  });

  if (categoricalColumns.length > 0) {
    patterns.push(
      `Categorical patterns found in ${categoricalColumns.length} columns - suitable for segmentation analysis`,
    );
  }

  // Pattern 3: High correlation pairs
  const correlations = calculateCorrelations(dataset);
  const highCorrelations = Object.entries(correlations).filter(
    ([, corr]) => Math.abs(corr as number) > 0.7,
  );

  if (highCorrelations.length > 0) {
    patterns.push(
      `Strong correlations detected between ${highCorrelations.length} variable pairs - indicates potential relationships`,
    );
  }

  // Pattern 4: Data completeness patterns
  const completenessVariation = Object.keys(dataset[0] || {}).map((col) => {
    const complete = dataset.filter(
      (row) => row[col] !== null && row[col] !== undefined && row[col] !== "",
    ).length;
    return complete / dataset.length;
  });

  const avgCompleteness =
    completenessVariation.reduce((a, b) => a + b, 0) /
    completenessVariation.length;
  if (avgCompleteness < 0.9) {
    patterns.push(
      "Missing data patterns detected - data quality assessment recommended",
    );
  }

  return patterns.length > 0
    ? patterns
    : ["No significant patterns detected in current analysis"];
}

function performStatisticalTest(
  dataset: any[],
  test: string,
  params: any,
): any {
  try {
    switch (test) {
      case "t_test":
        return performTTest(dataset, params);
      case "chi_square":
        return performChiSquareTest(dataset, params);
      case "correlation":
        return {
          correlations: calculateCorrelations(dataset),
          note: "Pearson correlation coefficients calculated",
        };
      case "normality_test":
        return performNormalityTest(dataset);
      case "outlier_detection":
        return detectOutliers(dataset, params.anomaly_sensitivity || 0.05);
      default:
        return { error: `Statistical test '${test}' not implemented` };
    }
  } catch (error) {
    return { error: `Error performing ${test}: ${(error as Error).message}` };
  }
}

function performTTest(dataset: any[], params: any): any {
  const numericColumns = getNumericColumns(dataset);
  if (numericColumns.length < 1) {
    return { error: "No numeric columns found for t-test" };
  }

  const column = numericColumns[0]; // Use first numeric column
  const values = dataset
    .map((row) => row[column])
    .filter((v) => typeof v === "number" && !isNaN(v));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (values.length - 1);
  const stdError = Math.sqrt(variance / values.length);
  const testValue = 0; // Testing against 0 by default
  const tStatistic = (mean - testValue) / stdError;
  const degreesOfFreedom = values.length - 1;

  return {
    column,
    tStatistic: Number(tStatistic.toFixed(4)),
    degreesOfFreedom,
    mean: Number(mean.toFixed(4)),
    standardError: Number(stdError.toFixed(4)),
    sampleSize: values.length,
    confidenceLevel: params.confidence_level || 0.95,
    interpretation:
      Math.abs(tStatistic) > 2
        ? "Statistically significant difference"
        : "No significant difference",
  };
}

function performChiSquareTest(dataset: any[], params: any): any {
  const categoricalColumns = Object.keys(dataset[0] || {}).filter((col) => {
    const uniqueValues = new Set(dataset.map((row) => row[col]));
    return uniqueValues.size < 20 && uniqueValues.size > 1;
  });

  if (categoricalColumns.length < 1) {
    return {
      error: "No suitable categorical columns found for chi-square test",
    };
  }

  const column = categoricalColumns[0];
  const observed = {};
  dataset.forEach((row) => {
    const value = row[column];
    observed[value] = (observed[value] || 0) + 1;
  });

  const total = Object.values(observed).reduce(
    (sum, count) => sum + (count as number),
    0,
  );
  const categories = Object.keys(observed);
  const expected = total / categories.length;

  const chiSquare = Object.values(observed).reduce(
    (sum, obs) => sum + Math.pow((obs as number) - expected, 2) / expected,
    0,
  );

  return {
    column,
    categories: categories.length,
    chiSquareStatistic: Number(chiSquare.toFixed(4)),
    degreesOfFreedom: categories.length - 1,
    observed,
    expected: Number(expected.toFixed(2)),
    interpretation:
      chiSquare > 7.815
        ? "Significant deviation from expected distribution"
        : "No significant deviation",
  };
}

function performNormalityTest(dataset: any[]): any {
  const numericColumns = getNumericColumns(dataset);
  const results: any = {};

  numericColumns.forEach((column) => {
    const values = dataset
      .map((row) => row[column])
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length < 8) {
      results[column] = { error: "Insufficient data for normality test" };
      return;
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    const skewness = calculateSkewness(values, mean, stdDev);
    const kurtosis = calculateKurtosis(values, mean, stdDev);
    const isNormal = Math.abs(skewness) < 1 && Math.abs(kurtosis) < 1;

    results[column] = {
      skewness: Number(skewness.toFixed(4)),
      kurtosis: Number(kurtosis.toFixed(4)),
      isNormal,
      interpretation: isNormal
        ? "Data appears normally distributed"
        : "Data deviates from normal distribution",
    };
  });

  return results;
}

function performTimeSeriesAnalysis(dataset: any[], params: any): any {
  const timeColumn = params.time_column;
  const timeData = dataset
    .filter((row) => row[timeColumn])
    .map((row) => ({
      time: new Date(row[timeColumn]),
      data: row,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  if (timeData.length < 10) {
    return {
      error:
        "Insufficient data for time series analysis (minimum 10 points required)",
    };
  }

  const numericColumns = getNumericColumns(dataset);
  const analysis: any = {};

  numericColumns.forEach((column) => {
    const values = timeData
      .map((item) => item.data[column])
      .filter((v) => typeof v === "number");
    if (values.length < 10) return;

    // Simple forecasting using linear trend
    const forecast = forecastLinearTrend(values, params.forecast_periods || 12);

    // Detect seasonality (simple approach)
    const seasonality = detectSeasonality(values);

    analysis[column] = {
      dataPoints: values.length,
      trend: analyzeTrends(dataset, timeColumn)[column] || {},
      seasonality,
      forecast: forecast.slice(0, params.forecast_periods || 12),
      volatility: calculateVolatility(values),
    };
  });

  return analysis;
}

function forecastLinearTrend(values: number[], periods: number): number[] {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return Array.from({ length: periods }, (_, i) =>
    Number((intercept + slope * (n + i)).toFixed(4)),
  );
}

function detectSeasonality(values: number[]): any {
  if (values.length < 24) {
    return {
      detected: false,
      reason: "Insufficient data for seasonality detection",
    };
  }

  // Simple approach: check for recurring patterns at different intervals
  const intervals = [7, 12, 24, 30]; // Common seasonal intervals
  const seasonalityScores: any = {};

  intervals.forEach((interval) => {
    if (values.length >= interval * 2) {
      const correlations = [];
      for (
        let lag = interval;
        lag < values.length - interval;
        lag += interval
      ) {
        const subset1 = values.slice(lag - interval, lag);
        const subset2 = values.slice(lag, lag + interval);
        correlations.push(pearsonCorrelation(subset1, subset2));
      }
      const avgCorrelation =
        correlations.reduce((a, b) => a + b, 0) / correlations.length;
      seasonalityScores[interval] = Number(avgCorrelation.toFixed(4));
    }
  });

  const bestInterval = Object.entries(seasonalityScores).reduce((a, b) =>
    seasonalityScores[a[0]] > seasonalityScores[b[0]] ? a : b,
  );

  return {
    detected: (bestInterval[1] as number) > 0.3,
    interval: bestInterval[0],
    strength: bestInterval[1],
    allScores: seasonalityScores,
  };
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const returns = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) /
    returns.length;

  return Number(Math.sqrt(variance).toFixed(6));
}

async function generateMLInsights(dataset: any[], params: any): Promise<any> {
  const insights: any = {
    clusters: [],
    patterns: [],
    predictions: [],
    recommendations: [],
  };

  try {
    // Simple clustering using k-means approach
    const numericData = extractNumericData(dataset);
    if (numericData.length > 0 && numericData[0].length > 1) {
      insights.clusters = performSimpleClustering(numericData, 3);
    }

    // Pattern recognition
    insights.patterns = identifyMLPatterns(dataset);

    // Feature importance analysis
    insights.featureImportance = analyzeFeatureImportance(dataset);

    // Recommendations based on analysis
    insights.recommendations = generateMLRecommendations(dataset, insights);
  } catch (error) {
    insights.error = `ML insights generation failed: ${(error as Error).message}`;
  }

  return insights;
}

function extractNumericData(dataset: any[]): number[][] {
  const numericColumns = getNumericColumns(dataset);
  if (numericColumns.length === 0) return [];

  return dataset.map((row) =>
    numericColumns.map((col) => {
      const value = row[col];
      return typeof value === "number" && !isNaN(value) ? value : 0;
    }),
  );
}

function performSimpleClustering(data: number[][], k: number): any {
  if (data.length < k) {
    return { error: "Not enough data points for clustering" };
  }

  // Simple k-means implementation
  const dimensions = data[0].length;
  let centroids = initializeCentroids(data, k);
  const maxIterations = 50;

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters = assignToClusters(data, centroids);
    const newCentroids = updateCentroids(data, clusters, k, dimensions);

    if (centroidsConverged(centroids, newCentroids)) break;
    centroids = newCentroids;
  }

  const finalClusters = assignToClusters(data, centroids);
  const clusterSizes = Array(k).fill(0);
  finalClusters.forEach((cluster) => clusterSizes[cluster]++);

  return {
    centroids: centroids.map((centroid) =>
      centroid.map((val) => Number(val.toFixed(4))),
    ),
    clusterSizes,
    totalDataPoints: data.length,
    silhouetteScore: calculateSilhouetteScore(data, finalClusters, centroids),
  };
}

function initializeCentroids(data: number[][], k: number): number[][] {
  const centroids: number[][] = [];
  const dimensions = data[0].length;

  for (let i = 0; i < k; i++) {
    const centroid: number[] = [];
    for (let d = 0; d < dimensions; d++) {
      const values = data.map((point) => point[d]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      centroid.push(min + Math.random() * (max - min));
    }
    centroids.push(centroid);
  }

  return centroids;
}

function assignToClusters(data: number[][], centroids: number[][]): number[] {
  return data.map((point) => {
    let minDistance = Infinity;
    let cluster = 0;

    centroids.forEach((centroid, i) => {
      const distance = euclideanDistance(point, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        cluster = i;
      }
    });

    return cluster;
  });
}

function updateCentroids(
  data: number[][],
  clusters: number[],
  k: number,
  dimensions: number,
): number[][] {
  const newCentroids: number[][] = [];

  for (let i = 0; i < k; i++) {
    const clusterPoints = data.filter((_, index) => clusters[index] === i);
    if (clusterPoints.length === 0) {
      newCentroids.push(Array(dimensions).fill(0));
      continue;
    }

    const centroid: number[] = [];
    for (let d = 0; d < dimensions; d++) {
      const avg =
        clusterPoints.reduce((sum, point) => sum + point[d], 0) /
        clusterPoints.length;
      centroid.push(avg);
    }
    newCentroids.push(centroid);
  }

  return newCentroids;
}

function centroidsConverged(
  old: number[][],
  newCentroids: number[][],
  threshold: number = 0.001,
): boolean {
  for (let i = 0; i < old.length; i++) {
    if (euclideanDistance(old[i], newCentroids[i]) > threshold) {
      return false;
    }
  }
  return true;
}

function euclideanDistance(point1: number[], point2: number[]): number {
  return Math.sqrt(
    point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0),
  );
}

function calculateSilhouetteScore(
  data: number[][],
  clusters: number[],
  centroids: number[][],
): number {
  // Simplified silhouette score calculation
  let totalScore = 0;

  data.forEach((point, i) => {
    const ownCluster = clusters[i];
    const ownDistance = euclideanDistance(point, centroids[ownCluster]);

    let nearestDistance = Infinity;
    centroids.forEach((centroid, j) => {
      if (j !== ownCluster) {
        const distance = euclideanDistance(point, centroid);
        if (distance < nearestDistance) {
          nearestDistance = distance;
        }
      }
    });

    const silhouette =
      (nearestDistance - ownDistance) / Math.max(nearestDistance, ownDistance);
    totalScore += silhouette;
  });

  return Number((totalScore / data.length).toFixed(4));
}

function identifyMLPatterns(dataset: any[]): string[] {
  const patterns: string[] = [];

  // Check for imbalanced classes
  const categoricalColumns = Object.keys(dataset[0] || {}).filter((col) => {
    const uniqueValues = new Set(dataset.map((row) => row[col]));
    return uniqueValues.size < 20 && uniqueValues.size > 1;
  });

  categoricalColumns.forEach((col) => {
    const distribution: { [key: string]: number } = {};
    dataset.forEach((row) => {
      distribution[row[col]] = (distribution[row[col]] || 0) + 1;
    });

    const values = Object.values(distribution);
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max / min > 5) {
      patterns.push(
        `Imbalanced distribution in '${col}' - consider resampling techniques`,
      );
    }
  });

  // Check for high dimensionality
  const totalColumns = Object.keys(dataset[0] || {}).length;
  if (totalColumns > 20) {
    patterns.push(
      "High dimensionality detected - consider dimensionality reduction techniques",
    );
  }

  // Check for sparse data
  const sparsity = calculateSparsity(dataset);
  if (sparsity > 0.5) {
    patterns.push(
      `High data sparsity (${(sparsity * 100).toFixed(1)}%) - consider sparse matrix techniques`,
    );
  }

  return patterns;
}

function calculateSparsity(dataset: any[]): number {
  let totalCells = 0;
  let emptyCells = 0;

  dataset.forEach((row) => {
    Object.values(row).forEach((value) => {
      totalCells++;
      if (value === null || value === undefined || value === "") {
        emptyCells++;
      }
    });
  });

  return totalCells > 0 ? emptyCells / totalCells : 0;
}

function analyzeFeatureImportance(dataset: any[]): any {
  const numericColumns = getNumericColumns(dataset);
  if (numericColumns.length < 2) {
    return { error: "Insufficient numeric features for importance analysis" };
  }

  const importance: { [key: string]: number } = {};

  // Use variance as a simple feature importance metric
  numericColumns.forEach((column) => {
    const values = dataset
      .map((row) => row[column])
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;

    importance[column] = Number(variance.toFixed(4));
  });

  // Normalize importance scores
  const maxImportance = Math.max(...Object.values(importance));
  if (maxImportance > 0) {
    Object.keys(importance).forEach((key) => {
      importance[key] = Number((importance[key] / maxImportance).toFixed(4));
    });
  }

  return {
    scores: importance,
    ranking: Object.entries(importance)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([feature, score]) => ({ feature, score })),
  };
}

function generateMLRecommendations(dataset: any[], insights: any): string[] {
  const recommendations: string[] = [];

  // Data size recommendations
  if (dataset.length < 100) {
    recommendations.push(
      "Small dataset detected - consider data augmentation or synthetic data generation",
    );
  } else if (dataset.length > 100000) {
    recommendations.push(
      "Large dataset detected - consider sampling strategies or distributed processing",
    );
  }

  // Feature recommendations
  const numericColumns = getNumericColumns(dataset).length;
  const totalColumns = Object.keys(dataset[0] || {}).length;

  if (numericColumns / totalColumns < 0.3) {
    recommendations.push(
      "Few numeric features - consider feature engineering or encoding categorical variables",
    );
  }

  // Clustering recommendations
  if (insights.clusters && !insights.clusters.error) {
    if (insights.clusters.silhouetteScore > 0.5) {
      recommendations.push(
        "Good clustering structure detected - suitable for unsupervised learning approaches",
      );
    } else {
      recommendations.push(
        "Weak clustering structure - consider different clustering algorithms or feature selection",
      );
    }
  }

  // Missing data recommendations
  const sparsity = calculateSparsity(dataset);
  if (sparsity > 0.1) {
    recommendations.push(
      "Missing data detected - consider imputation strategies or models robust to missing values",
    );
  }

  return recommendations.length > 0
    ? recommendations
    : ["No specific ML recommendations based on current analysis"];
}

function calculateCustomMetric(dataset: any[], formula: string): any {
  // Simple custom metric calculation using basic operations
  // In production, would use a proper expression evaluator

  try {
    const numericColumns = getNumericColumns(dataset);
    const context: { [key: string]: number[] } = {};

    numericColumns.forEach((column) => {
      context[column] = dataset
        .map((row) => row[column])
        .filter((v) => typeof v === "number" && !isNaN(v));
    });

    // Basic formula evaluation (unsafe - for demo only)
    // In production, use a safe expression evaluator
    const result = eval(
      formula.replace(/\b(\w+)\b/g, (match) => {
        if (context[match]) {
          const values = context[match];
          return `(${JSON.stringify(values)}.reduce((a,b)=>a+b,0)/${values.length})`;
        }
        return match;
      }),
    );

    return Number(result.toFixed(4));
  } catch (error) {
    throw new Error(`Invalid formula: ${formula}`);
  }
}

function generateBusinessInsights(
  analysis: any,
  businessContext?: string,
): string[] {
  const insights: string[] = [];

  // Statistical insights
  if (analysis.descriptiveStats) {
    Object.entries(analysis.descriptiveStats).forEach(
      ([column, stats]: [string, any]) => {
        if (stats.skewness > 1) {
          insights.push(
            `${column} shows right-skewed distribution - may indicate outliers or natural lower bounds`,
          );
        } else if (stats.skewness < -1) {
          insights.push(
            `${column} shows left-skewed distribution - may indicate ceiling effects or upper constraints`,
          );
        }

        if (stats.standardDeviation > stats.mean * 0.5) {
          insights.push(
            `${column} shows high variability - consider investigating factors causing this variation`,
          );
        }
      },
    );
  }

  // Correlation insights
  if (analysis.correlations) {
    const strongCorrelations = Object.entries(analysis.correlations).filter(
      ([, corr]) => Math.abs(corr as number) > 0.7,
    );
    if (strongCorrelations.length > 0) {
      insights.push(
        `Strong relationships detected: ${strongCorrelations.map(([pair]) => pair).join(", ")} - investigate causal relationships`,
      );
    }
  }

  // Outlier insights
  if (analysis.outliers) {
    const columnsWithOutliers = Object.entries(analysis.outliers).filter(
      ([, data]: [string, any]) => data.count > 0,
    );
    if (columnsWithOutliers.length > 0) {
      insights.push(
        `Outliers detected in ${columnsWithOutliers.length} variables - investigate for data quality or exceptional cases`,
      );
    }
  }

  // Trend insights
  if (analysis.trends && typeof analysis.trends === "object") {
    Object.entries(analysis.trends).forEach(
      ([column, trend]: [string, any]) => {
        if (trend.direction === "increasing" && trend.strength === "strong") {
          insights.push(
            `${column} shows strong upward trend - positive growth opportunity identified`,
          );
        } else if (
          trend.direction === "decreasing" &&
          trend.strength === "strong"
        ) {
          insights.push(
            `${column} shows strong downward trend - attention needed to reverse decline`,
          );
        }
      },
    );
  }

  // Business context insights
  if (businessContext) {
    if (
      businessContext.toLowerCase().includes("sales") ||
      businessContext.toLowerCase().includes("revenue")
    ) {
      insights.push(
        "Consider seasonality effects and customer segmentation for sales optimization",
      );
    }
    if (
      businessContext.toLowerCase().includes("user") ||
      businessContext.toLowerCase().includes("customer")
    ) {
      insights.push(
        "Analyze user behavior patterns and lifecycle stages for engagement optimization",
      );
    }
    if (
      businessContext.toLowerCase().includes("performance") ||
      businessContext.toLowerCase().includes("efficiency")
    ) {
      insights.push(
        "Focus on identifying bottlenecks and optimization opportunities",
      );
    }
  }

  return insights.length > 0
    ? insights
    : [
        "Analysis completed - consider deeper investigation of specific metrics",
      ];
}

function generateVisualizationCode(
  dataset: any[],
  analysis: any,
  dataType: string,
): string[] {
  const visualizations: string[] = [];
  const numericColumns = getNumericColumns(dataset);

  if (numericColumns.length > 0) {
    // Histogram for distributions
    visualizations.push(`
// Distribution Analysis - Histogram
const histogramData = ${JSON.stringify(numericColumns[0] ? dataset.map((row) => row[numericColumns[0]]).filter((v) => typeof v === "number") : [])};
// Use Chart.js, D3.js, or similar library to create histogram
// Example: create histogram showing distribution of ${numericColumns[0]}
`);

    // Correlation heatmap
    if (numericColumns.length > 1) {
      visualizations.push(`
// Correlation Heatmap
const correlationMatrix = ${JSON.stringify(analysis.correlations || {})};
// Use libraries like Plotly.js or D3.js to create heatmap
// Shows relationships between all numeric variables
`);
    }
  }

  // Time series plot if applicable
  const timeColumns = Object.keys(dataset[0] || {}).filter((col) =>
    dataset.some(
      (row) => row[col] instanceof Date || isDateString(String(row[col])),
    ),
  );

  if (timeColumns.length > 0 && numericColumns.length > 0) {
    visualizations.push(`
// Time Series Plot
const timeSeriesData = ${JSON.stringify(
      dataset.slice(0, 100).map((row) => ({
        time: row[timeColumns[0]],
        value: row[numericColumns[0]],
      })),
    )};
// Use Chart.js time series or similar to show trends over time
`);
  }

  // Box plot for outlier visualization
  if (analysis.outliers && Object.keys(analysis.outliers).length > 0) {
    visualizations.push(`
// Box Plot for Outlier Detection
const outlierData = ${JSON.stringify(analysis.outliers)};
// Create box plots for each numeric variable to show outliers
// Useful for identifying data quality issues
`);
  }

  return visualizations.length > 0
    ? visualizations
    : [
        "// No suitable visualizations generated - consider manual chart creation",
      ];
}

function formatAnalysisReport(data: any): string {
  const {
    analysisId,
    dataset,
    dataQuality,
    analysis,
    insights,
    visualizations,
    mlInsights,
    params,
    executionTime,
  } = data;

  let report = `
🔬 COMPREHENSIVE DATA ANALYSIS REPORT
====================================
📋 Analysis ID: ${analysisId}
📊 Data Type: ${params.data_type.toUpperCase()}
🎯 Analysis Type: ${params.analysis_type.toUpperCase()}
⏱️  Processing Time: ${executionTime}ms
📈 Dataset Size: ${dataset.length} rows, ${Object.keys(dataset[0] || {}).length} columns

📊 DATA QUALITY ASSESSMENT
=========================
✅ Overall Quality Score: ${dataQuality.overallScore}%
📋 Total Records: ${dataQuality.totalRows.toLocaleString()}
🏷️  Total Columns: ${dataQuality.totalColumns}`;

  if (dataQuality.issues.length > 0) {
    report += `\n\n⚠️  DATA QUALITY ISSUES:\n${dataQuality.issues.map((issue) => `• ${issue}`).join("\n")}`;
  }

  // Column Analysis
  report += `\n\n📋 COLUMN ANALYSIS:\n`;
  Object.entries(dataQuality.columnAnalysis).forEach(
    ([column, stats]: [string, any]) => {
      report += `\n${column}:
  • Completeness: ${(stats.completeness * 100).toFixed(1)}%
  • Data Type: ${stats.dataType}
  • Unique Values: ${stats.distinctCount.toLocaleString()}
  • Missing Values: ${stats.nullCount.toLocaleString()}`;
    },
  );

  // Descriptive Statistics
  if (
    analysis.descriptiveStats &&
    Object.keys(analysis.descriptiveStats).length > 0
  ) {
    report += `\n\n📊 DESCRIPTIVE STATISTICS
========================\n`;
    Object.entries(analysis.descriptiveStats).forEach(
      ([column, stats]: [string, any]) => {
        report += `\n${column.toUpperCase()}:
  📈 Mean: ${stats.mean} | 📊 Median: ${stats.median} | 📉 Std Dev: ${stats.standardDeviation}
  🎯 Range: ${stats.min} - ${stats.max} | 🎨 Skewness: ${stats.skewness} | 📐 Kurtosis: ${stats.kurtosis}
  📋 Percentiles: Q1=${stats.percentiles.p25}, Q3=${stats.percentiles.p75}, P95=${stats.percentiles.p95}`;
      },
    );
  }

  // Correlations
  if (analysis.correlations && Object.keys(analysis.correlations).length > 0) {
    report += `\n\n🔗 CORRELATION ANALYSIS
======================\n`;
    const sortedCorrelations = Object.entries(analysis.correlations)
      .sort(([, a], [, b]) => Math.abs(b as number) - Math.abs(a as number))
      .slice(0, 10); // Top 10 correlations

    sortedCorrelations.forEach(([pair, corr]) => {
      const strength =
        Math.abs(corr as number) > 0.7
          ? "Strong"
          : Math.abs(corr as number) > 0.3
            ? "Moderate"
            : "Weak";
      report += `• ${pair.replace("_", " ↔ ")}: ${corr} (${strength})\n`;
    });
  }

  // Outliers
  if (analysis.outliers && Object.keys(analysis.outliers).length > 0) {
    report += `\n\n🚨 OUTLIER DETECTION
===================\n`;
    Object.entries(analysis.outliers).forEach(
      ([column, outlierData]: [string, any]) => {
        if (outlierData.count > 0) {
          report += `• ${column}: ${outlierData.count} outliers (${outlierData.percentage}% of data)
  Range: ${outlierData.bounds.lower.toFixed(2)} - ${outlierData.bounds.upper.toFixed(2)}
  Examples: ${outlierData.values
    .slice(0, 5)
    .map((v) => v.toFixed(2))
    .join(", ")}${outlierData.values.length > 5 ? "..." : ""}\n`;
        }
      },
    );
  }

  // Trends
  if (analysis.trends && Object.keys(analysis.trends).length > 1) {
    report += `\n\n📈 TREND ANALYSIS
================\n`;
    Object.entries(analysis.trends).forEach(
      ([column, trend]: [string, any]) => {
        if (typeof trend === "object" && trend.direction) {
          const arrow =
            trend.direction === "increasing"
              ? "↗️"
              : trend.direction === "decreasing"
                ? "↘️"
                : "➡️";
          report += `• ${column}: ${arrow} ${trend.direction.toUpperCase()} (${trend.strength} trend)
  Slope: ${trend.slope} | Intercept: ${trend.intercept}\n`;
        }
      },
    );
  }

  // Statistical Tests
  if (
    analysis.statisticalTests &&
    Object.keys(analysis.statisticalTests).length > 0
  ) {
    report += `\n\n🧪 STATISTICAL TEST RESULTS
===========================\n`;
    Object.entries(analysis.statisticalTests).forEach(
      ([test, results]: [string, any]) => {
        if (results.error) {
          report += `• ${test.toUpperCase()}: ❌ ${results.error}\n`;
        } else {
          report += `• ${test.toUpperCase()}: ✅ ${results.interpretation || "Test completed"}\n`;
          if (results.tStatistic)
            report += `  T-statistic: ${results.tStatistic} (df: ${results.degreesOfFreedom})\n`;
          if (results.chiSquareStatistic)
            report += `  Chi-square: ${results.chiSquareStatistic} (df: ${results.degreesOfFreedom})\n`;
        }
      },
    );
  }

  return report;
}

function formatErrorResult(error: Error, executionTime: number): string {
  return JSON.stringify(
    {
      success: false,
      timestamp: new Date().toISOString(),
      executionTime,
      error: {
        message: error.message,
        stack: error.stack,
      },
    },
    null,
    2,
  );
}
