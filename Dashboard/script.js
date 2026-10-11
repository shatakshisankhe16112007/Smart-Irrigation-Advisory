// ==========================================
// SMART IRRIGATION ADVISORY
// ==========================================

let dataset = [];
let headers = [];

let chartObjects = {};


// ==========================================
// PAGE START
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("csvFile")
        .addEventListener("change", handleFileUpload);

    document.getElementById("loadDefaultBtn")
        .addEventListener("click", loadDefaultDataset);

    document.getElementById("advisoryForm")
        .addEventListener("submit", analyzeData);

    document.getElementById("downloadStatsBtn")
        .addEventListener("click", downloadStatistics);

    loadDefaultDataset();

});


// ==========================================
// MESSAGE
// ==========================================

function showMessage(message, isError = false) {

    const element = document.getElementById("dataMessage");

    element.textContent = message;

    element.className = isError
        ? "message error"
        : "message";

}


// ==========================================
// LOAD DEFAULT DATASET
// ==========================================

async function loadDefaultDataset() {

    showMessage("Loading the project dataset...");

    try {

        const response = await fetch(
            "./Dataset/Crop_recommendationV2_final_modified.csv"
        );

        if (!response.ok) {
            throw new Error(
                "Dataset not found at the expected location."
            );
        }

        const text = await response.text();

        processCSV(text);

        showMessage(
            "Project dataset loaded successfully."
        );

    } catch (error) {

        showMessage(
            "Automatic loading failed. Upload the CSV using the file selector. " +
            "For local testing, open the website through a local web server.",
            true
        );

    }

}


// ==========================================
// UPLOAD CSV
// ==========================================

function handleFileUpload(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {

        showMessage(
            "Please upload a CSV file.",
            true
        );

        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            processCSV(e.target.result);

            showMessage(
                "Uploaded dataset analyzed successfully: " +
                file.name
            );

        } catch (error) {

            showMessage(
                "Could not process the CSV. Check its headers and contents.",
                true
            );

        }

    };

    reader.onerror = function () {

        showMessage(
            "The selected file could not be read.",
            true
        );

    };

    reader.readAsText(file);

}


// ==========================================
// CSV PARSER
// Supports quoted fields and commas in text
// ==========================================

function parseCSV(text) {

    const rows = [];

    let row = [];
    let field = "";
    let insideQuotes = false;

    text = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {

        const character = text[i];
        const nextCharacter = text[i + 1];

        if (character === '"') {

            if (insideQuotes && nextCharacter === '"') {

                field += '"';
                i++;

            } else {

                insideQuotes = !insideQuotes;

            }

        } else if (character === "," && !insideQuotes) {

            row.push(field);
            field = "";

        } else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {

            if (character === "\r" && nextCharacter === "\n") {
                i++;
            }

            row.push(field);

            if (row.some(value => value.trim() !== "")) {
                rows.push(row);
            }

            row = [];
            field = "";

        } else {

            field += character;

        }

    }

    if (field !== "" || row.length > 0) {

        row.push(field);

        if (row.some(value => value.trim() !== "")) {
            rows.push(row);
        }

    }

    return rows;

}


// ==========================================
// PROCESS DATASET
// ==========================================

function processCSV(text) {

    const rows = parseCSV(text);

    if (rows.length < 2) {

        throw new Error("The CSV is empty.");

    }

    headers = rows[0].map(
        header => header.trim().replace(/^\uFEFF/, "")
    );

    if (headers.some(header => header === "")) {

        throw new Error("A column name is empty.");

    }

    if (new Set(headers).size !== headers.length) {

        throw new Error("Duplicate column names were found.");

    }

    const rawRows = rows.slice(1);

    dataset = rawRows.map(function (values) {

        const record = {};

        headers.forEach(function (header, index) {

            record[header] = values[index] === undefined
                ? ""
                : values[index].trim();

        });

        return record;

    });

    renderAll();

}


// ==========================================
// NUMERIC COLUMNS
// ==========================================

function getNumericColumns() {

    const expectedColumns = [
        "temperature",
        "rainfall",
        "soil_moisture"
    ];

    return expectedColumns.filter(function (column) {

        return headers.includes(column);

    });

}


function getNumericValues(column) {

    return dataset
        .map(row => row[column])
        .filter(value => value !== "")
        .map(Number)
        .filter(value => Number.isFinite(value));

}


// ==========================================
// RENDER ALL SECTIONS
// ==========================================

function renderAll() {

    updateOverview();

    renderPreview();

    renderStatistics();

    renderFrequency();

    renderCorrelation();

    renderCharts();

}


// ==========================================
// DATASET OVERVIEW
// ==========================================

function updateOverview() {

    document.getElementById("totalRows").textContent =
        dataset.length.toLocaleString();

    document.getElementById("totalColumns").textContent =
        headers.length;

    let missing = 0;

    dataset.forEach(function (row) {

        headers.forEach(function (header) {

            if (
                row[header] === "" ||
                row[header] === null ||
                row[header] === undefined
            ) {

                missing++;

            }

        });

    });

    document.getElementById("missingValues").textContent =
        missing.toLocaleString();


    const seenRows = new Set();

    let duplicateCount = 0;

    dataset.forEach(function (row) {

        const key = JSON.stringify(
            headers.map(header => row[header])
        );

        if (seenRows.has(key)) {

            duplicateCount++;

        } else {

            seenRows.add(key);

        }

    });

    document.getElementById("duplicateRows").textContent =
        duplicateCount.toLocaleString();

}


// ==========================================
// DATASET PREVIEW
// ==========================================

function renderPreview() {

    const table = document.getElementById("previewTable");

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.replaceChildren();
    tbody.replaceChildren();

    const headerRow = document.createElement("tr");

    headers.forEach(function (header) {

        const th = document.createElement("th");

        th.textContent = header;

        headerRow.appendChild(th);

    });

    thead.appendChild(headerRow);


    dataset.slice(0, 5).forEach(function (row) {

        const tr = document.createElement("tr");

        headers.forEach(function (header) {

            const td = document.createElement("td");

            td.textContent = row[header];

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });


    document.getElementById("previewMessage").textContent =
        "Showing the first " +
        Math.min(dataset.length, 5) +
        " rows of the loaded dataset.";

}


// ==========================================
// STATISTICAL FUNCTIONS
// ==========================================

function calculateMean(values) {

    if (values.length === 0) {
        return NaN;
    }

    return values.reduce(
        (total, value) => total + value,
        0
    ) / values.length;

}


function calculateMedian(values) {

    if (values.length === 0) {
        return NaN;
    }

    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (
            sorted[middle - 1] +
            sorted[middle]
        ) / 2;

    }

    return sorted[middle];

}


function calculateMode(values) {

    if (values.length === 0) {
        return NaN;
    }

    const counts = {};

    values.forEach(function (value) {

        const rounded = value.toFixed(1);

        counts[rounded] = (counts[rounded] || 0) + 1;

    });

    const maximum = Math.max(...Object.values(counts));

    const modes = Object.keys(counts)
        .filter(key => counts[key] === maximum);

    return modes.join(", ");

}


function calculateVariance(values) {

    if (values.length < 2) {
        return NaN;
    }

    const mean = calculateMean(values);

    const squaredDifferences = values.map(
        value => Math.pow(value - mean, 2)
    );

    return squaredDifferences.reduce(
        (total, value) => total + value,
        0
    ) / (values.length - 1);

}


function calculateStandardDeviation(values) {

    return Math.sqrt(calculateVariance(values));

}


function calculateQuartile(values, proportion) {

    if (values.length === 0) {
        return NaN;
    }

    const sorted = [...values].sort((a, b) => a - b);

    const position = (sorted.length - 1) * proportion;

    const lower = Math.floor(position);
    const upper = Math.ceil(position);

    if (lower === upper) {
        return sorted[lower];
    }

    return sorted[lower] +
        (sorted[upper] - sorted[lower]) *
        (position - lower);

}


function calculateRange(values) {

    if (values.length === 0) {
        return NaN;
    }

    return Math.max(...values) - Math.min(...values);

}


function formatNumber(value) {

    if (typeof value === "string") {
        return value;
    }

    if (!Number.isFinite(value)) {
        return "N/A";
    }

    return value.toFixed(2);

}


// ==========================================
// STATISTICAL SUMMARY TABLE
// ==========================================

function renderStatistics() {

    const tbody = document.querySelector(
        "#statisticsTable tbody"
    );

    tbody.replaceChildren();

    const columns = getNumericColumns();

    const measures = [
        ["Count", values => values.length],
        ["Mean", calculateMean],
        ["Median", calculateMedian],
        ["Mode (rounded to 1 decimal)", calculateMode],
        ["Minimum", values => Math.min(...values)],
        ["Maximum", values => Math.max(...values)],
        ["Range", calculateRange],
        ["First Quartile (Q1)", values => calculateQuartile(values, 0.25)],
        ["Third Quartile (Q3)", values => calculateQuartile(values, 0.75)],
        ["Sample Variance", calculateVariance],
        ["Sample Standard Deviation", calculateStandardDeviation]
    ];


    measures.forEach(function (measure) {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");

        nameCell.textContent = measure[0];

        tr.appendChild(nameCell);


        ["temperature", "rainfall", "soil_moisture"].forEach(
            function (column) {

                const td = document.createElement("td");

                if (!columns.includes(column)) {

                    td.textContent = "N/A";

                } else {

                    const values = getNumericValues(column);

                    td.textContent = formatNumber(
                        measure[1](values)
                    );

                }

                tr.appendChild(td);

            }
        );

        tbody.appendChild(tr);

    });

}


// ==========================================
// FREQUENCY DISTRIBUTION
// ==========================================

function renderFrequency() {

    const tbody = document.querySelector(
        "#frequencyTable tbody"
    );

    tbody.replaceChildren();

    const column = "Irrigation Status";

    if (!headers.includes(column)) {

        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 3;

        td.textContent =
            "The uploaded dataset does not contain Irrigation Status.";

        tr.appendChild(td);
        tbody.appendChild(tr);

        return;

    }

    const counts = {};

    dataset.forEach(function (row) {

        const value = row[column] || "(Missing)";

        counts[value] = (counts[value] || 0) + 1;

    });


    Object.keys(counts)
        .sort()
        .forEach(function (category) {

            const tr = document.createElement("tr");

            const categoryCell = document.createElement("td");
            const countCell = document.createElement("td");
            const percentageCell = document.createElement("td");

            categoryCell.textContent = category;

            countCell.textContent = counts[category];

            percentageCell.textContent =
                (counts[category] / dataset.length * 100)
                    .toFixed(2) + "%";

            tr.appendChild(categoryCell);
            tr.appendChild(countCell);
            tr.appendChild(percentageCell);

            tbody.appendChild(tr);

        });

}


// ==========================================
// PEARSON CORRELATION
// ==========================================

function calculateCorrelation(x, y) {

    if (x.length !== y.length || x.length < 2) {
        return NaN;
    }

    const meanX = calculateMean(x);
    const meanY = calculateMean(y);

    let numerator = 0;
    let sumXSquared = 0;
    let sumYSquared = 0;

    for (let i = 0; i < x.length; i++) {

        const dx = x[i] - meanX;
        const dy = y[i] - meanY;

        numerator += dx * dy;

        sumXSquared += dx * dx;
        sumYSquared += dy * dy;

    }

    const denominator = Math.sqrt(
        sumXSquared * sumYSquared
    );

    if (denominator === 0) {
        return NaN;
    }

    return numerator / denominator;

}


function renderCorrelation() {

    const table = document.getElementById("correlationTable");

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.replaceChildren();
    tbody.replaceChildren();

    const columns = getNumericColumns();

    const headerRow = document.createElement("tr");

    const firstHeader = document.createElement("th");

    firstHeader.textContent = "Variable";

    headerRow.appendChild(firstHeader);

    columns.forEach(function (column) {

        const th = document.createElement("th");

        th.textContent = column;

        headerRow.appendChild(th);

    });

    thead.appendChild(headerRow);


    columns.forEach(function (columnA) {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");

        nameCell.textContent = columnA;

        tr.appendChild(nameCell);


        columns.forEach(function (columnB) {

            const td = document.createElement("td");

            const x = [];
            const y = [];

            dataset.forEach(function (row) {

                const valueX = Number(row[columnA]);
                const valueY = Number(row[columnB]);

                if (
                    row[columnA] !== "" &&
                    row[columnB] !== "" &&
                    Number.isFinite(valueX) &&
                    Number.isFinite(valueY)
                ) {

                    x.push(valueX);
                    y.push(valueY);

                }

            });

            const correlation = calculateCorrelation(x, y);

            td.textContent = formatNumber(correlation);

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

}


// ==========================================
// CHART UTILITIES
// ==========================================

function destroyChart(id) {

    if (chartObjects[id]) {

        chartObjects[id].destroy();

    }

}


function makeHistogram(values, numberOfBins = 10) {

    if (values.length === 0) {

        return {
            labels: [],
            counts: []
        };

    }

    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    if (minimum === maximum) {

        return {
            labels: [minimum.toFixed(2)],
            counts: [values.length]
        };

    }

    const width = (maximum - minimum) / numberOfBins;

    const counts = Array(numberOfBins).fill(0);

    values.forEach(function (value) {

        let index = Math.floor(
            (value - minimum) / width
        );

        if (index >= numberOfBins) {
            index = numberOfBins - 1;
        }

        counts[index]++;

    });


    const labels = counts.map(function (_, index) {

        const start = minimum + index * width;
        const end = start + width;

        return start.toFixed(1) + "–" + end.toFixed(1);

    });

    return {
        labels: labels,
        counts: counts
    };

}


// ==========================================
// CREATE HISTOGRAM
// ==========================================

function createHistogram(id, column, title) {

    destroyChart(id);

    const canvas = document.getElementById(id);

    if (!canvas || !headers.includes(column)) {
        return;
    }

    const values = getNumericValues(column);

    const histogram = makeHistogram(values);

    chartObjects[id] = new Chart(canvas, {

        type: "bar",

        data: {

            labels: histogram.labels,

            datasets: [{

                label: "Number of Observations",

                data: histogram.counts,

                backgroundColor: "rgba(40, 135, 77, 0.75)",

                borderColor: "rgb(32, 119, 72)",

                borderWidth: 1,

                borderRadius: 4

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    enabled: true
                }

            },

            scales: {

                x: {
                    title: {
                        display: true,
                        text: title
                    }
                },

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "Frequency"
                    },

                    ticks: {
                        precision: 0
                    }

                }

            }

        }

    });

}


// ==========================================
// IRRIGATION STATUS CHART
// ==========================================

function createStatusChart() {

    const id = "statusChart";

    destroyChart(id);

    if (!headers.includes("Irrigation Status")) {
        return;
    }

    const counts = {};

    dataset.forEach(function (row) {

        const value = row["Irrigation Status"] || "(Missing)";

        counts[value] = (counts[value] || 0) + 1;

    });


    chartObjects[id] = new Chart(
        document.getElementById(id),
        {

            type: "doughnut",

            data: {

                labels: Object.keys(counts),

                datasets: [{

                    data: Object.values(counts),

                    backgroundColor: [
                        "#237a47",
                        "#e8b547",
                        "#dd6b58",
                        "#6599c9",
                        "#8a78bb",
                        "#71b8a3"
                    ],

                    borderWidth: 2,

                    borderColor: "#ffffff"

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        }
    );

}


// ==========================================
// RENDER CHARTS
// ==========================================

function renderCharts() {

    createHistogram(
        "temperatureChart",
        "temperature",
        "Temperature"
    );

    createHistogram(
        "rainfallChart",
        "rainfall",
        "Rainfall"
    );

    createHistogram(
        "moistureChart",
        "soil_moisture",
        "Soil Moisture"
    );

    createStatusChart();

}


// ==========================================
// IRRIGATION RECOMMENDATION
// ==========================================

function analyzeData(event) {

    event.preventDefault();

    const moisture = Number(
        document.getElementById("moisture").value
    );

    const temperature = Number(
        document.getElementById("temperature").value
    );

    const rainfall = Number(
        document.getElementById("rainfall").value
    );


    const result = document.getElementById(
        "recommendationResult"
    );


    if (
        !Number.isFinite(moisture) ||
        !Number.isFinite(temperature) ||
        !Number.isFinite(rainfall) ||
        moisture < 0 ||
        moisture > 100 ||
        rainfall < 0
    ) {

        result.className = "result-box urgent";

        result.innerHTML = `
            <div class="result-icon">⚠️</div>
            <h3>Invalid Input</h3>
            <p>
                Enter valid numerical values. Soil moisture
                must be between 0 and 100, and rainfall
                cannot be negative.
            </p>
        `;

        return;

    }


    let title;
    let message;
    let icon;
    let statusClass;


    /*
       Illustrative prototype rules only.

       These thresholds are NOT validated agricultural
       thresholds. Confirm units and obtain agricultural
       guidance before using the system for real decisions.
    */


    if (moisture <= 15 && rainfall < 75) {

        title = "Irrigation May Be Needed";

        message =
            "Soil moisture is low and recorded rainfall is limited. " +
            "Check field conditions before deciding to irrigate.";

        icon = "💧";

        statusClass = "urgent";

    } else if (moisture >= 25 && rainfall >= 125) {

        title = "Irrigation May Be Delayed";

        message =
            "Soil moisture is relatively high and rainfall is substantial. " +
            "Check actual field conditions before adding water.";

        icon = "🌿";

        statusClass = "safe";

    } else {

        title = "Monitor Field Conditions";

        message =
            "Review soil moisture, rainfall, crop stage, and field conditions " +
            "before deciding whether irrigation is necessary.";

        icon = "🔎";

        statusClass = "caution";

    }


    if (temperature >= 35) {

        message +=
            " Temperature is high; monitor possible increases " +
            "in crop water demand.";

    }


    result.className = "result-box " + statusClass;

    result.innerHTML = `
        <div class="result-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <p class="note">
            This is an illustrative rule-based suggestion,
            not a validated AI prediction.
        </p>
    `;

}


// ==========================================
// DOWNLOAD STATISTICAL SUMMARY
// ==========================================

function downloadStatistics() {

    if (dataset.length === 0) {

        showMessage(
            "Load a dataset before downloading statistics.",
            true
        );

        return;

    }

    const rows = [];

    rows.push([
        "Measure",
        "Temperature",
        "Rainfall",
        "Soil Moisture"
    ]);


    const measures = [
        ["Count", values => values.length],
        ["Mean", calculateMean],
        ["Median", calculateMedian],
        ["Mode (rounded to 1 decimal)", calculateMode],
        ["Minimum", values => Math.min(...values)],
        ["Maximum", values => Math.max(...values)],
        ["Range", calculateRange],
        ["Q1", values => calculateQuartile(values, 0.25)],
        ["Q3", values => calculateQuartile(values, 0.75)],
        ["Sample Variance", calculateVariance],
        ["Sample Standard Deviation", calculateStandardDeviation]
    ];


    measures.forEach(function (measure) {

        const row = [measure[0]];

        ["temperature", "rainfall", "soil_moisture"].forEach(
            function (column) {

                if (!headers.includes(column)) {

                    row.push("N/A");

                } else {

                    row.push(
                        formatNumber(
                            measure[1](getNumericValues(column))
                        )
                    );

                }

            }
        );

        rows.push(row);

    });


    const csv = rows.map(function (row) {

        return row.map(function (value) {

            const text = String(value);

            return '"' + text.replace(/"/g, '""') + '"';

        }).join(",");

    }).join("\r\n");


    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Irrigation_Statistical_Summary.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}