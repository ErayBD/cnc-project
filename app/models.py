import plotly.graph_objs as go
from plotly.offline import plot
from app import db
from sqlalchemy import text

def s1_fetch_columns():
    table_name = "anomaly_table"
    query = text("SELECT column_name FROM information_schema.columns WHERE table_name = :table_name")
    with db.engine.connect() as connection:
        result = connection.execute(query, {'table_name': table_name})
        columns = [row[0] for row in result]
        return columns


def fetch_data_for_graph(x_column, y_column):
    query = text(f"SELECT {x_column}, {y_column} FROM anomaly_table")
    with db.engine.connect() as connection:
        result = connection.execute(query)
        x_data = []
        y_data = []
        for row in result:
            x_data.append(row[0])
            y_data.append(row[1])
    return x_data, y_data


def s1_create_graph(x_data, y_data):
    fig = go.Figure(
        data=[
            go.Scatter(
                x=x_data,
                y=y_data,
                mode='lines+markers',
                marker=dict(
                    size=10,
                    color='blue',
                    line=dict(width=2, color='DarkSlateGrey')
                ),
                line=dict(color='red', width=4)
            )
        ],
        layout=go.Layout(
            xaxis=dict(titlefont=dict(size=16, color='darkblue')),
            yaxis=dict(titlefont=dict(size=16, color='darkblue')),
            autosize=True,
            margin=dict(l=0, r=0, t=0, b=0),
            legend=dict(x=0, y=1, bordercolor='black', borderwidth=1),
            paper_bgcolor='rgba(0,0,0,0)',
        )
    )
    return plot(fig, output_type='div', include_plotlyjs=False)



