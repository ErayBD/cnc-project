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
                    let trace = {};
                    if (selectedPlotTypeSection3 === 'scatter') {
                        trace = {
                            x: data.x,
                            y: data.y,
                            type: 'scattergl',
                            mode: 'markers',
                            name: `${feature}`,
                            marker: {
                                size: 5,
                                // color: 'rgb(31, 119, 180)'
                            },
                        };
                    } else if (selectedPlotTypeSection3 === 'histogram') {
                        trace = {
                            x: data.y,
                            type: 'histogram',
                            name: `${feature}`,
                        };
                    } else if (selectedPlotTypeSection3 === 'bar') {
                        trace = {
                            x: data.x,
                            y: data.y,
                            type: 'bar',
                            name: `${feature}`,
                            line: {
                                width: 3,
                                // color: 'rgb(255, 127, 14)'
                            },
                        };
                    } else if (selectedPlotTypeSection3 === 'line') {
                        trace = {
                            x: data.x,
                            y: data.y,
                            type: 'scattergl',
                            mode: 'lines',
                            name: `${feature}`,
                            marker: {
                                size: 5,
                                // color: 'rgb(31, 119, 180)'
                            },
                            line: {
                                width: 3,
                                // color: 'rgb(255, 127, 14)'
                            }
                        };
                    }
                    traces.push(trace);
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

                const layout = {
                    title: activeTabSection3 === 'train' ? 'Train Dataset' : 'Test Dataset',
                    xaxis: selectedPlotTypeSection3 === 'histogram' ? {} : {
                        tickvals: xTicks,
                        ticktext: xTickText,
                    },
                    yaxis: {},
                };

                if (activeTabSection3 === 'train') {
                    Plotly.newPlot(trainGraph, traces, layout);
                } else if (activeTabSection3 === 'test') {
                    Plotly.newPlot(testGraph, traces, layout);
                }
            } else {
                const layout = {
                    title: activeTabSection3 === 'train' ? 'Train Dataset' : 'Test Dataset',
                    xaxis: {},
                    yaxis: {},
                };

                if (activeTabSection3 === 'train') {
                    Plotly.newPlot(trainGraph, [], layout);
                } else if (activeTabSection3 === 'test') {
                    Plotly.newPlot(testGraph, [], layout);
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
                    let traceActual = {};
                    let tracePrediction = {};
                    if (selectedPlotTypeSection4 === 'histogram') {
                        traces.push({
                            x: data.y_actual,
                            type: 'histogram',
                            name: `${feature} - Actual`,
                        });
                        traces.push({
                            x: data.y_prediction,
                            type: 'histogram',
                            name: `${feature} - Prediction`,
                        });
                    } else {
                        if (selectedPlotTypeSection4 === 'scatter') {
                            traceActual = {
                                x: data.x,
                                y: data.y_actual,
                                type: 'scattergl',
                                mode: 'markers',
                                name: `${feature} - Actual`,
                                marker: {
                                    size: 5,
                                    // color: 'rgb(31, 119, 180)'
                                },
                            };
                            tracePrediction = {
                                x: data.x,
                                y: data.y_prediction,
                                type: 'scattergl',
                                mode: 'markers',
                                name: `${feature} - Prediction`,
                                marker: {
                                    size: 5,
                                    // color: 'rgb(131,64,166)'
                                },
                            };
                        } else if (selectedPlotTypeSection4 === 'bar') {
                            traceActual = {
                                x: data.x,
                                y: data.y_actual,
                                type: 'bar',
                                name: `${feature} - Actual`,
                                line: {
                                    width: 3,
                                    // color: 'rgb(255, 127, 14)'
                                },
                            };
                            tracePrediction = {
                                x: data.x,
                                y: data.y_prediction,
                                type: 'bar',
                                name: `${feature} - Prediction`,
                                line: {
                                    width: 3,
                                    // color: 'rgb(255, 127, 14)'
                                },
                            };
                        } else if (selectedPlotTypeSection4 === 'line') {
                            traceActual = {
                                x: data.x,
                                y: data.y_actual,
                                type: 'scattergl',
                                mode: 'lines',
                                name: `${feature} - Actual`,
                                marker: {
                                    size: 5,
                                    // color: 'rgb(31, 119, 180)'
                                },
                                line: {
                                    width: 3,
                                    // color: 'rgb(255, 127, 14)'
                                }
                            };
                            tracePrediction = {
                                x: data.x,
                                y: data.y_prediction,
                                type: 'scattergl',
                                mode: 'lines',
                                name: `${feature} - Prediction`,
                                marker: {
                                    size: 5,
                                    // color: 'rgb(131,64,166)'
                                },
                                line: {
                                    width: 3,
                                    // color: 'rgb(255, 127, 14)'
                                }
                            };
                        }
                        traces.push(traceActual);
                        traces.push(tracePrediction);
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

                const layout = {
                    title: activeTabSection4 === 'train' ? 'Train Dataset' : 'Test Dataset',
                    xaxis: selectedPlotTypeSection4 === 'histogram' ? {} : {
                        tickvals: xTicks,
                        ticktext: xTickText,
                    },
                    yaxis: {},
                };

                if (activeTabSection4 === 'train') {
                    Plotly.newPlot(trainGraphSection4, traces, layout);
                } else if (activeTabSection4 === 'test') {
                    Plotly.newPlot(testGraphSection4, traces, layout);
                }
            } else {
                const layout = {
                    title: activeTabSection4 === 'train' ? 'Train Dataset' : 'Test Dataset',
                    xaxis: {},
                    yaxis: {},
                };

                if (activeTabSection4 === 'train') {
                    Plotly.newPlot(trainGraphSection4, [], layout);
                } else if (activeTabSection4 === 'test') {
                    Plotly.newPlot(testGraphSection4, [], layout);
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
