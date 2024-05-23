import plotly.graph_objs as go
from plotly.offline import plot
from app import db
from sqlalchemy import text

# section 1, returns the columns for the selected table
def s1_fetch_columns_data(table_name):
    query = text("SELECT column_name FROM information_schema.columns WHERE table_name = :table_name")
    with db.engine.connect() as connection:
        result = connection.execute(query, {'table_name': table_name})
        columns = [row[0] for row in result]
        return columns


# section 1, returns data for the selected X and Y columns
def s1_fetch_axis_data(x_column, y_column, table_name):
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
def s1_create_graph_scatter(x_data, y_data, x_axis, y_axis):
    fig = go.Figure(
        data=[
            go.Scatter(
                x=x_data,
                y=y_data,
                mode='lines+markers',
                name=f"{x_axis} vs {y_axis}",
                # marker=dict(
                #     size=5,
                #     color='blue',
                #     line=dict(width=0.1, color='#3079c0')
                # ),
                line=dict(color='#3079c0')
            ),
        ],
        layout=go.Layout(
            title=f"Scatter: {x_axis} vs {y_axis}",
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


def s1_create_graph_bar(x_data, y_data, x_axis, y_axis):
    fig = go.Figure(
        data=[
            go.Bar(
                x=x_data,
                y=y_data,
                name=f"{x_axis} vs {y_axis}",
                marker=dict(
                    color='blue',
                    line=dict(width=1, color='#3079c0')
                )
            ),
        ],
        layout=go.Layout(
            title=f"Bar: {x_axis} vs {y_axis}",
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


def s1_create_graph_line(x_data, y_data, x_axis, y_axis):
    fig = go.Figure(
        data=[
            go.Line(
                x=x_data,
                y=y_data,
                name=f"{x_axis} vs {y_axis}",
                line=dict(color='#3079c0', width=3)
            ),
        ],
        layout=go.Layout(
            title=f"Line: {x_axis} vs {y_axis}",
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


def s1_create_graph_histogram(x_data, y_data, x_axis, y_axis):
    fig = go.Figure(
        data=[
            go.Histogram(
                x=y_data,
                name=f"Histogram: {y_axis} Histogram",
                marker=dict(
                    color='blue',
                    line=dict(width=0.1, color='DarkSlateGrey')
                )
            ),
        ],
        layout=go.Layout(
            title=f"Histogram: index vs {y_axis} ",
            xaxis=dict(
                titlefont=dict(size=16, color='darkblue'),
            ),
            yaxis=dict(
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


# section 2, returns data in the db for 'anomaly' column is true
def s2_fetch_anomaly_data(table_name):
    query = text(f"SELECT * FROM {table_name} WHERE anomaly = True")
    with db.engine.connect() as connection:
        result = connection.execute(query)
        columns = [column for column in result.keys()]
        data = [list(row) for row in result.fetchall()]
        return columns, data


# section 3, xxx
def s3_fetch_feature_data(x_column, y_column, table_name, month=None):
    query = text(f"SELECT {x_column}, {y_column} FROM {table_name}")

    if month and month != 'all':
        query = text(f"SELECT {x_column}, {y_column} FROM {table_name} WHERE TO_CHAR({x_column}, 'MM') = :month")

    with db.engine.connect() as connection:
        if month and month != 'all':
            result = connection.execute(query, {'month': month})
        else:
            result = connection.execute(query)

        x_data = []
        y_data = []
        for row in result:
            x_data.append(row[0])
            y_data.append(row[1])
        return x_data, y_data





