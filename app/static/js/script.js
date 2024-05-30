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
    const trainGraph = document.getElementById('train-graph-section3');
    const testGraph = document.getElementById('test-graph-section3');
    const monthDropdown = document.querySelector('.month-dropdown-menu-section3');
    const selectedMonthButton = document.getElementById('selected-month-button-section3');
    const plotTypeDropdown = document.querySelector('.plot-type-dropdown-menu-section3');
    const selectedPlotTypeButton = document.getElementById('selected-plot-type-button-section3');
    const trainCheckboxes = document.getElementById('train-checkboxes-section3');
    const testCheckboxes = document.getElementById('test-checkboxes-section3');

    function initializeGraphSection3(element) {
        Plotly.newPlot(element, [], {
            title: 'Feature Data',
            xaxis: {},
            yaxis: {},
        });
    }

    initializeGraphSection3(trainGraph);
    initializeGraphSection3(testGraph);

    const trainTabSection3 = document.getElementById('train-tab-section3');
    const testTabSection3 = document.getElementById('test-tab-section3');

    let trainSelectionsSection3 = {};
    let testSelectionsSection3 = {};
    let selectedMonthSection3 = 'all';
    let activeTabSection3 = 'train';
    let selectedPlotTypeSection3 = 'scatter';


    function saveSelectionsSection3() {
        const checkboxes = activeTabSection3 === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature_checkbox') : testCheckboxes.querySelectorAll('.s3_feature_checkbox');
        checkboxes.forEach(checkbox => {
            if (activeTabSection3 === 'train') {
                trainSelectionsSection3[checkbox.value] = checkbox.checked;
            } else if (activeTabSection3 === 'test') {
                testSelectionsSection3[checkbox.value] = checkbox.checked;
            }
        });
    }

    function loadSelectionsSection3(selections) {
        const checkboxes = activeTabSection3 === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature_checkbox') : testCheckboxes.querySelectorAll('.s3_feature_checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selections[checkbox.value] || false;
        });
        updateGraphSection3();
    }

    function updateGraphSection3() {
        const checkboxes = activeTabSection3 === 'train' ? trainCheckboxes.querySelectorAll('.s3_feature_checkbox') : testCheckboxes.querySelectorAll('.s3_feature_checkbox');
        const selectedFeatures = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        const traces = [];
        const promises = selectedFeatures.map((feature, index) => {
            return fetch(`/get_feature_data?feature=${feature}&tab=${activeTabSection3}&month=${selectedMonthSection3}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (selectedPlotTypeSection3 === 'histogram') {
                        traces.push({
                            x: data.y,
                            type: selectedPlotTypeSection3,
                            name: `index - ${feature}`,
                        });
                    } else {
                        traces.push({
                            x: data.x,
                            y: data.y,
                            type: selectedPlotTypeSection3,
                            mode: selectedPlotTypeSection3 === 'scatter' ? 'lines+markers' : '',
                            name: `index - ${feature}`,
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

                if (activeTabSection3 === 'train') {
                    Plotly.newPlot(trainGraph, traces, {
                        title: 'Train Dataset',
                        xaxis: {
                            tickvals: xTicks,
                            ticktext: xTickText,
                        },
                        yaxis: {}
                    });
                } else if (activeTabSection3 === 'test') {
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
                if (activeTabSection3 === 'train') {
                    Plotly.newPlot(trainGraph, [], { title: 'Train Dataset', xaxis: {}, yaxis: {} });
                } else if (activeTabSection3 === 'test') {
                    Plotly.newPlot(testGraph, [], { title: 'Test Dataset', xaxis: {}, yaxis: {} });
                }
            }
        });
    }

    const allCheckboxes = document.querySelectorAll('.s3_feature_checkbox');
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            saveSelectionsSection3();
            updateGraphSection3();
        });
    });

    trainTabSection3.addEventListener('click', function () {
        saveSelectionsSection3();
        activeTabSection3 = 'train';
        trainCheckboxes.style.display = 'block';
        testCheckboxes.style.display = 'none';
        loadSelectionsSection3(trainSelectionsSection3);
    });

    testTabSection3.addEventListener('click', function () {
        saveSelectionsSection3();
        activeTabSection3 = 'test';
        trainCheckboxes.style.display = 'none';
        testCheckboxes.style.display = 'block';
        loadSelectionsSection3(testSelectionsSection3);
    });

    monthDropdown.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedMonthButton.innerText = event.target.innerText;
            selectedMonthSection3 = event.target.getAttribute('data-month-section3');
            updateGraphSection3();
        }
    });

    plotTypeDropdown.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedPlotTypeButton.innerText = event.target.innerText;
            selectedPlotTypeSection3 = event.target.getAttribute('data-plot-type-section3');
            updateGraphSection3();
        }
    });

    loadSelectionsSection3(trainSelectionsSection3);
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
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature_checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature_checkbox');
        checkboxes.forEach(checkbox => {
            if (activeTabSection4 === 'train') {
                trainSelectionsSection4[checkbox.value] = checkbox.checked;
            } else if (activeTabSection4 === 'test') {
                testSelectionsSection4[checkbox.value] = checkbox.checked;
            }
        });
    }

    function loadSelectionsSection4(selections) {
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature_checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature_checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selections[checkbox.value] || false;
        });
        updateGraphSection4();
    }

    function updateGraphSection4() {
        const checkboxes = activeTabSection4 === 'train' ? trainCheckboxesSection4.querySelectorAll('.s4_feature_checkbox') : testCheckboxesSection4.querySelectorAll('.s4_feature_checkbox');
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
                    if (selectedPlotTypeSection4 === 'histogram') {
                        traces.push({
                            x: data.y_actual,
                            type: selectedPlotTypeSection4,
                            name: `index - ${feature} (Actual)`,

                        });
                        traces.push({
                            x: data.y_prediction,
                            type: selectedPlotTypeSection4,
                            name: `index - ${feature} (Prediction)`,

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

    const allCheckboxesSection4 = document.querySelectorAll('.s4_feature_checkbox');
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
            selectedMonthSection4 = event.target.getAttribute('data-month-section4');
            updateGraphSection4();
        }
    });

    plotTypeDropdownSection4.addEventListener('click', function (event) {
        if (event.target.tagName === 'BUTTON') {
            selectedPlotTypeButtonSection4.innerText = event.target.innerText;
            selectedPlotTypeSection4 = event.target.getAttribute('data-plot-type-section4');
            updateGraphSection4();
        }
    });

    loadSelectionsSection4(trainSelectionsSection4);
});





