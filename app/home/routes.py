from flask import render_template, request, Blueprint
from app.models import s1_fetch_columns, s1_create_graph, fetch_data_for_graph


main = Blueprint('home', __name__)


@main.route("/", methods=["GET"])
def home():
    s1_columns = s1_fetch_columns()
    return render_template('home.html',
                           title='Home',
                           columns=s1_columns)

@main.route("/", methods=['POST'])
def show_graph():
    s1_columns = s1_fetch_columns()
    data_selection = request.form.get('data_selection')
    row_selection = request.form.get('row_selection')
    column_selection = request.form.get('column_selection')
    x_axis = request.form.get('x_axis')
    y_axis = request.form.get('y_axis')

    if x_axis and y_axis and x_axis != "Seçim Yapınız" and y_axis != "Seçim Yapınız":
        x_data, y_data = fetch_data_for_graph(x_axis, y_axis)
        s1_graph = s1_create_graph(x_data, y_data)
        return render_template('home.html',
                               title='Home',
                               columns=s1_columns,
                               graph=s1_graph,
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

