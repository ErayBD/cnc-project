// document.addEventListener("DOMContentLoaded", function() {
//     const dataSelection = document.getElementById('data-selection');
//     s1_checkSelection(dataSelection.value);
// });
//
//
// function s1_checkSelection(value) {
//     const filePath = document.getElementById('s1_file-path');
//     filePath.style.display = value === 'Excel' ? 'block' : 'none';
// }

document.querySelectorAll('.form-check-input').forEach(item => {
    item.addEventListener('change', function() {
        const actual = document.getElementById('actualDataCheckbox').checked;
        const predicted = document.getElementById('predictedDataCheckbox').checked;
        fetch(`/update_graph?actual=${actual}&predicted=${predicted}`)
            .then(response => response.json())
            .then(data => {
                const traces = [];
                if (data.y_actual.length > 0) {
                    traces.push({
                        x: data.x,
                        y: data.y_actual,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Actual Data',
                        line: {color: 'blue'}
                    });
                }
                if (data.y_predicted.length > 0) {
                    traces.push({
                        x: data.x,
                        y: data.y_predicted,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Predicted Data',
                        line: {color: 'red'}
                    });
                }

                Plotly.newPlot('graphContainer', traces, {
                    title: 'Actual vs Predicted',
                    xaxis: {title: 'X Axis'},
                    yaxis: {title: 'Y Axis'},
                    legend: {
                    x: 0,
                    y: 1,
                    bgcolor: 'rgba(255,255,255,0.5)',
                    bordercolor: 'black',
                    orientation: 'h'
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });
});

document.addEventListener('DOMContentLoaded', function () {
    function drawTrainGraph() {
        var trace1 = {
            x: [3, 9, 15, 21],
            y: [56, 73, 81, 125],
            type: 'scatter'
        };
        var data = [trace1];
        Plotly.newPlot('train', data);
    }

    function drawTestGraph() {
        var trace1 = {
            x: [2, 7, 11, 15],
            y: [35, 36, 65, 108],
            type: 'scatter'
        };
        var data = [trace1];
        Plotly.newPlot('test', data);
    }

    drawTrainGraph();
    drawTestGraph();

    var trainTab = document.getElementById('train-tab');
    var testTab = document.getElementById('test-tab');

    trainTab.addEventListener('click', function () {
        drawTrainGraph();
    });

    testTab.addEventListener('click', function () {
        drawTestGraph();
    });
});
