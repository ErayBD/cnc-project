import plotly.graph_objs as go
from plotly.offline import plot
from app import db
from sqlalchemy import text

# table name for SQL table
table_name = "anomaly_table"

# returns the columns for the selected table
def s1_fetch_columns_data():
    query = text("SELECT column_name FROM information_schema.columns WHERE table_name = :table_name")
    with db.engine.connect() as connection:
        result = connection.execute(query, {'table_name': table_name})
        columns = [row[0] for row in result]
        return columns


# returns data for the selected X and Y columns
def s1_fetch_axis_data(x_column, y_column):
    query = text(f"SELECT {x_column}, {y_column} FROM {table_name}")
    with db.engine.connect() as connection:
        result = connection.execute(query)
        x_data = []
        y_data = []
        for row in result:
            x_data.append(row[0])
            y_data.append(row[1])
        return x_data, y_data


# section 1, template of the graph
def s1_create_graph(x_data, y_data, x_axis, y_axis):
    fig = go.Figure(
        data=[
            go.Scatter(
                x=x_data,
                y=y_data,
                mode='lines+markers',
                name=f"{x_axis} vs {y_axis}",
                marker=dict(
                    size=10,
                    color='blue',
                    line=dict(width=2, color='DarkSlateGrey')
                ),
                line=dict(color='red', width=4)
            ),
        ],
        layout=go.Layout(
            title=f"{x_axis} vs {y_axis}",
            xaxis=dict(
                title=x_axis,
                titlefont=dict(size=16, color='darkblue'),
            ),
            yaxis=dict(
                title=y_axis,
                titlefont=dict(size=16, color='darkblue'),
            ),
            legend=dict(
                x=0,
                y=1,
                bgcolor='rgba(255, 255, 255, 0.5)',
                bordercolor='black',
                borderwidth=1
            ),
            autosize=True,
            margin=dict(l=0, r=0, t=30, b=0),
            paper_bgcolor='rgba(0,0,0,0)',
        )
    )
    # fig.update_layout(showlegend=True)
    graph_html = plot(fig, output_type='div', include_plotlyjs=True)
    return graph_html


# returns data in the db for 'anomaly' column is true
def s2_fetch_anomaly_data():
    query = text("SELECT * FROM anomaly_table WHERE anomaly = True")
    with db.engine.connect() as connection:
        result = connection.execute(query)
        columns = [column for column in result.keys()]
        data = [list(row) for row in result.fetchall()]
        return columns, data


# temp graph
def create_sample_graph(actual, predicted):
    x = list(range(10))
    y_actual = [i ** 2 for i in x]
    y_predicted = [i * 2 for i in x]

    fig = go.Figure()

    if actual:
        fig.add_trace(go.Scatter(x=x, y=y_actual, mode='lines+markers', name='Actual Data',
                                 line=dict(color='blue')))
    if predicted:
        fig.add_trace(
            go.Scatter(x=x, y=y_predicted, mode='lines+markers', name='Predicted Data',
                       line=dict(color='red')))

    fig.update_layout(title='Actual vs Predicted', xaxis_title='X Axis', yaxis_title='Y Axis')

    return plot(fig, output_type='div', include_plotlyjs=True)

