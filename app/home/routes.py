from flask import render_template, request, Blueprint, session, redirect, url_for
from app.models import s1_fetch_columns, s1_create_graph, fetch_data_for_graph


main = Blueprint('home', __name__)


@main.route("/", methods=['GET'])
def home():
    s1_columns = s1_fetch_columns()
    return render_template('home.html',
                           title='Home',
                           columns=s1_columns)

@main.route("/draw_graph", methods=['GET', 'POST'])
def draw_graph():
    s1_columns = s1_fetch_columns()
    data_selection = request.form.get('data_selection', '')
    row_selection = request.form.get('row_selection', '')
    column_selection = request.form.get('column_selection', '')
    x_axis = request.form.get('x_axis', '')
    y_axis = request.form.get('y_axis', '')

    if x_axis and y_axis and x_axis != "Seçim Yapınız" and y_axis != "Seçim Yapınız":
        x_data, y_data = fetch_data_for_graph(x_axis, y_axis)
        graph = s1_create_graph(x_data, y_data)
        graphs = session.get('graphs', [])
        graphs.append(graph)
        max_graphs = int(row_selection) * int(column_selection) if row_selection.isdigit() and column_selection.isdigit() else 0
        graphs = graphs[-max_graphs:]
        session['graphs'] = graphs  # Grafik listesini güncelleyin

        return render_template('home.html',
                               title='Home',
                               columns=s1_columns,
                               graphs=graphs,
                               data_selection=data_selection,
                               row_selection=row_selection,
                               column_selection=column_selection,
                               x_axis=x_axis,
                               y_axis=y_axis)
    else:
        error_message = "Lütfen her iki ekseni de seçiniz."
        return render_template('home.html',
                               title='Home',
                               columns=s1_columns,
                               error_message=error_message,
                               data_selection=data_selection,
                               row_selection=row_selection,
                               column_selection=column_selection,
                               x_axis=x_axis,
                               y_axis=y_axis)


@main.route("/reset_graphs", methods=['POST'])
def reset_graphs():
    session['graphs'] = []  # Grafik listesini temizle
    return redirect(url_for('home.home'))


