// section 2
document.addEventListener('DOMContentLoaded', function() {
    let currentSortColumn = null;
    let currentSortOrder = 'asc';

    document.querySelectorAll('.sortable').forEach(button => {
        button.addEventListener('click', function() {
            const column = this.getAttribute('data-column');
            const tableBody = document.getElementById('table-body');
            const rows = Array.from(tableBody.querySelectorAll('tr'));

            const firstRowCell = rows[0].children[column].innerText;
            const isDate = !isNaN(Date.parse(firstRowCell));

            rows.sort((a, b) => {
                let cellA = a.children[column].innerText;
                let cellB = b.children[column].innerText;

                if (isDate) {
                    cellA = new Date(cellA);
                    cellB = new Date(cellB);
                } else {
                    cellA = parseFloat(cellA);
                    cellB = parseFloat(cellB);
                }

                if (cellA < cellB) {
                    return currentSortOrder === 'asc' ? -1 : 1;
                }
                if (cellA > cellB) {
                    return currentSortOrder === 'asc' ? 1 : -1;
                }
                return 0;
            });

            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortOrder = 'asc';
            }
            currentSortColumn = column;
            rows.forEach(row => tableBody.appendChild(row));
        });
    });
});


// section 3
document.addEventListener('DOMContentLoaded', function () {
    const trainGraph = document.getElementById('train-graph');
    const testGraph = document.getElementById('test-graph');
    const monthDropdown = document.querySelector('.month-dropdown-menu');
    const selectedMonthButton = document.getElementById('selected-month-button');
    const plotTypeDropdown = document.querySelector('.plot-type-dropdown-menu');
    const selectedPlotTypeButton = document.getElementById('selected-plot-type-button');
    const trainCheckboxes = document.getElementById('train-checkboxes');
    const testCheckboxes = document.getElementById('test-checkboxes');

    function initializeGraph(element) {
        Plotly.newPlot(element, [], {
            title: 'Feature Data',
            xaxis: {},
            yaxis: {},
        });
    }

    initializeGraph(trainGraph);
    initializeGraph(testGraph);
    
    const trainTab = document.getElementById('train-tab-section3');
    const testTab = document.getElementById('test-tab-section3');

    let trainSelections = {};
    let testSelections = {};
    let selectedMonth = 'all';
    let activeTab = 'train';
    let selectedPlotType = 'scatter';


    function saveSelections() {
        const checkboxes = activeTab === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature-checkbox') : testCheckboxes.querySelectorAll('.s3_feature-checkbox');
        checkboxes.forEach(checkbox => {
            if (activeTab === 'train') {
                trainSelections[checkbox.value] = checkbox.checked;
            } else if (activeTab === 'test') {
                testSelections[checkbox.value] = checkbox.checked;
            }
        });
    }

    function loadSelections(selections) {
        const checkboxes = activeTab === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature-checkbox') : testCheckboxes.querySelectorAll('.s3_feature-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selections[checkbox.value] || false;
        });
        updateGraph();
    }

    function updateGraph() {
    const checkboxes = activeTab === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature-checkbox') : testCheckboxes.querySelectorAll('.s3_feature-checkbox');
    const selectedFeatures = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const traces = [];
    const promises = selectedFeatures.map((feature, index) => {
        return fetch(`/get_feature_data?feature=${feature}&tab=${activeTab}&month=${selectedMonth}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Data for feature: ${feature}`, data);  // Debugging output

                if (selectedPlotType === 'histogram') {
                    traces.push({
                        x: data.y,
                        type: selectedPlotType,
                        name: `${feature} - Actual`,
                    });
                } else {
                    traces.push({
                        x: data.x,
                        y: data.y,
                        type: selectedPlotType,
                        mode: selectedPlotType === 'scatter' ? 'lines+markers' : '',
                        name: `${feature} - Actual`,
                        marker: { size: 10},
                        line: { width: 3}
                    });
                }
                return data.x;
            })
            .catch(error => {
                console.error('Error fetching feature data:', error);
            });
    });

    Promise.all(promises).then((xValues) => {
        if (xValues.length > 0) {
            const xTicks = xValues[0].filter((_, i) => i % Math.ceil(xValues[0].length / 20) === 0);
            const xTickText = xTicks.map(x => {
                const date = new Date(x);
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const seconds = date.getSeconds()
                return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()} ${date.getFullYear()}, ${hours}:${minutes}:${seconds}`;
            });

            if (activeTab === 'train') {
                Plotly.newPlot(trainGraph, traces, {
                    title: 'Train Dataset',
                    xaxis: {
                        tickvals: xTicks,
                        ticktext: xTickText,
                    },
                    yaxis: {}
                });
            } else if (activeTab === 'test') {
                Plotly.newPlot(testGraph, traces, {
                    title: 'Test Dataset',
                    xaxis: {
                        tickvals: xTicks,
                        ticktext: xTickText,
                    },
                    yaxis: {},
                });
            }
        } else {
            if (activeTab === 'train') {
                Plotly.newPlot(trainGraph, [], { title: 'Train Dataset', xaxis: {}, yaxis: {} });
            } else if (activeTab === 'test') {
                Plotly.newPlot(testGraph, [], { title: 'Test Dataset', xaxis: {}, yaxis: {} });
            }
        }
    });
}



    const allCheckboxes = document.querySelectorAll('.s3_feature-checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            saveSelections();
            updateGraph();
        });
    });

    trainTab.addEventListener('click', function () {
        saveSelections();
        activeTab = 'train';
        trainCheckboxes.style.display = 'block';
        testCheckboxes.style.display = 'none';
        loadSelections(trainSelections);
    });

    testTab.addEventListener('click', function () {
        saveSelections();
        activeTab = 'test';
        trainCheckboxes.style.display = 'none';
        testCheckboxes.style.display = 'block';
        loadSelections(testSelections);
    });

    monthDropdown.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedMonthButton.innerText = event.target.innerText;
            selectedMonth = event.target.getAttribute('data-month');
            updateGraph();
        }
    });

    plotTypeDropdown.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedPlotTypeButton.innerText = event.target.innerText;
            selectedPlotType = event.target.getAttribute('data-plot-type');
            updateGraph();
        }
    });


    loadSelections(trainSelections);
});


// section 4
document.addEventListener('DOMContentLoaded', function () {
    const trainGraphSection4 = document.getElementById('train-graph-section4');
    const testGraphSection4 = document.getElementById('test-graph-section4');
    const monthDropdownSection4 = document.querySelector('.month-dropdown-menu-section4');
    const selectedMonthButtonSection4 = document.getElementById('selected-month-button-section4');
    const plotTypeDropdownSection4 = document.querySelector('.plot-type-dropdown-menu-section4');
    const selectedPlotTypeButtonSection4 = document.getElementById('selected-plot-type-button-section4');
    const trainCheckboxesSection4 = document.getElementById('train-checkboxes-section4');
    const testCheckboxesSection4 = document.getElementById('test-checkboxes-section4');

    function initializeGraphSection4(element) {
        Plotly.newPlot(element, [], {
            title: 'Feature Data',
            xaxis: {},
            yaxis: {},
        });
    }

    initializeGraphSection4(trainGraphSection4);
    initializeGraphSection4(testGraphSection4);

    const trainTabSection4 = document.getElementById('train-tab-section4');
    const testTabSection4 = document.getElementById('test-tab-section4');

    let trainSelectionsSection4 = {};
    let testSelectionsSection4 = {};
    let selectedMonthSection4 = 'all';
    let activeTabSection4 = 'train';
    let selectedPlotTypeSection4 = 'scatter';



    function saveSelectionsSection4() {
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature-checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature-checkbox');
        checkboxes.forEach(checkbox => {
            if (activeTabSection4 === 'train') {
                trainSelectionsSection4[checkbox.value] = checkbox.checked;
            } else if (activeTabSection4 === 'test') {
                testSelectionsSection4[checkbox.value] = checkbox.checked;
            }
        });
    }

    function loadSelectionsSection4(selections) {
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature-checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selections[checkbox.value] || false;
        });
        updateGraphSection4();
    }

    function updateGraphSection4() {
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature-checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature-checkbox');
        const selectedFeatures = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const traces = [];
        const promises = selectedFeatures.map((feature, index) => {
            return fetch(`/get_feature_data_section4?feature=${feature}&tab=${activeTabSection4}&month=${selectedMonthSection4}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(`Data for feature: ${feature}`, data);

                    if (selectedPlotTypeSection4 === 'histogram') {
                        traces.push({
                            x: data.y_actual,
                            type: selectedPlotTypeSection4,
                            name: `${feature} - Actual`,

                        });
                        traces.push({
                            x: data.y_prediction,
                            type: selectedPlotTypeSection4,
                            name: `${feature} - Prediction`,

                        });
                    } else {
                        traces.push({
                            x: data.x,
                            y: data.y_actual,
                            type: selectedPlotTypeSection4,
                            mode: selectedPlotTypeSection4 === 'scatter' ? 'lines+markers' : '',
                            name: `${feature} - Actual`,
                            marker: { size: 10},
                            line: { width: 3}
                        });
                        traces.push({
                            x: data.x,
                            y: data.y_prediction,
                            type: selectedPlotTypeSection4,
                            mode: selectedPlotTypeSection4 === 'scatter' ? 'lines+markers' : '',
                            name: `${feature} - Prediction`,
                            marker: { size: 10},
                            line: { width: 3}
                        });
                    }
                    return data.x;
                })
                .catch(error => {
                    console.error('Error fetching feature data:', error);
                });
        });

        Promise.all(promises).then((xValues) => {
            if (xValues.length > 0) {
                const xTicks = xValues[0].filter((_, i) => i % Math.ceil(xValues[0].length / 20) === 0);
                const xTickText = xTicks.map(x => {
                    const date = new Date(x);
                    const hours = date.getHours()
                    const minutes = date.getMinutes()
                    const seconds = date.getSeconds()
                    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()} ${date.getFullYear()}, ${hours}:${minutes}:${seconds}`;
                });

                if (activeTabSection4 === 'train') {
                    Plotly.newPlot(trainGraphSection4, traces, {
                        title: 'Train Dataset',
                        xaxis: {
                            tickvals: xTicks,
                            ticktext: xTickText,
                        },
                        yaxis: {}
                    });
                } else if (activeTabSection4 === 'test') {
                    Plotly.newPlot(testGraphSection4, traces, {
                        title: 'Test Dataset',
                        xaxis: {
                            tickvals: xTicks,
                            ticktext: xTickText,
                        },
                        yaxis: {},
                    });
                }
            } else {
                if (activeTabSection4 === 'train') {
                    Plotly.newPlot(trainGraphSection4, [], { title: 'Train Dataset', xaxis: {}, yaxis: {} });
                } else if (activeTabSection4 === 'test') {
                    Plotly.newPlot(testGraphSection4, [], { title: 'Test Dataset', xaxis: {}, yaxis: {} });
                }
            }
        });
    }


    const allCheckboxesSection4 = document.querySelectorAll('.s4_feature-checkbox');
    allCheckboxesSection4.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            saveSelectionsSection4();
            updateGraphSection4();
        });
    });

    trainTabSection4.addEventListener('click', function () {
        saveSelectionsSection4();
        activeTabSection4 = 'train';
        trainCheckboxesSection4.style.display = 'block';
        testCheckboxesSection4.style.display = 'none';
        loadSelectionsSection4(trainSelectionsSection4);
    });

    testTabSection4.addEventListener('click', function () {
        saveSelectionsSection4();
        activeTabSection4 = 'test';
        trainCheckboxesSection4.style.display = 'none';
        testCheckboxesSection4.style.display = 'block';
        loadSelectionsSection4(testSelectionsSection4);
    });

    monthDropdownSection4.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedMonthButtonSection4.innerText = event.target.innerText;
            selectedMonthSection4 = event.target.getAttribute('data-month');
            updateGraphSection4();
        }
    });

    plotTypeDropdownSection4.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedPlotTypeButtonSection4.innerText = event.target.innerText;
            selectedPlotTypeSection4 = event.target.getAttribute('data-plot-type');
            updateGraphSection4();
        }
    });


    loadSelectionsSection4(trainSelectionsSection4);
});






