from flask import render_template, request, Blueprint, session, redirect, url_for, jsonify
from app.models import s1_fetch_columns_data, s1_create_graph, s1_fetch_axis_data, s2_fetch_anomaly_data
import os
import time


main = Blueprint('home', __name__)

# startup route
@main.route("/", methods=['GET'])
def home():
    s1_columns = s1_fetch_columns_data()
    s2_anomaly_columns, s2_table_data = s2_fetch_anomaly_data()
    return render_template('home.html',
                           title='Home',
                           s1_columns=s1_columns,
                           s2_anomaly_columns=s2_anomaly_columns,
                           s2_table_data=s2_table_data)


# section 1, submit button request
@main.route("/draw_graph", methods=['GET', 'POST'])
def draw_graph():
    s1_columns = s1_fetch_columns_data()
    s2_anomaly_columns, s2_table_data = s2_fetch_anomaly_data()
    s1_data_selection = request.form.get('s1_data_selection', '')
    s1_row_selection = request.form.get('s1_row_selection', '')
    s1_column_selection = request.form.get('s1_column_selection', '')
    s1_x_axis = request.form.get('s1_x_axis', '')
    s1_y_axis = request.form.get('s1_y_axis', '')
    max_graphs = int(s1_row_selection) * int(s1_column_selection)
    graphs = session.get('s1_graphs', [])

    if len(graphs) > max_graphs:
        graphs = graphs[:max_graphs]
        session['s1_graphs'] = graphs

    if s1_x_axis and s1_y_axis and s1_x_axis != "Seçim Yapınız" and s1_y_axis != "Seçim Yapınız":
        if len(graphs) < max_graphs:
            x_data, y_data = s1_fetch_axis_data(s1_x_axis, s1_y_axis)
            graph_html = s1_create_graph(x_data, y_data, s1_x_axis, s1_y_axis)
            graph_path = save_graph(graph_html)
            graphs.append(graph_path)
            graphs = graphs[:max_graphs]
            session['s1_graphs'] = graphs
            return render_template('home.html',
                                   title='Home',
                                   s1_columns=s1_columns,
                                   s1_graphs=graphs,
                                   s1_data_selection=s1_data_selection,
                                   s1_row_selection=s1_row_selection,
                                   s1_column_selection=s1_column_selection,
                                   s1_x_axis=s1_x_axis,
                                   s1_y_axis=s1_y_axis,
                                   s2_anomaly_columns=s2_anomaly_columns,
                                   s2_table_data=s2_table_data)
        else:
            s1_error_message = "Maksimum grafik kapasitesine ulaşıldı. Lütfen 'Sıfırla' butonunu kullanın."
            return render_template('home.html',
                                   title='Home',
                                   s1_columns=s1_columns,
                                   s1_graphs=graphs,
                                   s1_error_message=s1_error_message,
                                   s1_data_selection=s1_data_selection,
                                   s1_row_selection=s1_row_selection,
                                   s1_column_selection=s1_column_selection,
                                   s1_x_axis=s1_x_axis,
                                   s1_y_axis=s1_y_axis,
                                   s2_anomaly_columns=s2_anomaly_columns,
                                   s2_table_data=s2_table_data)


    else:
        s1_error_message = "Lütfen her iki ekseni de seçiniz."
        return render_template('home.html',
                               title='Home',
                               s1_columns=s1_columns,
                               s1_error_message=s1_error_message,
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=s1_row_selection,
                               s1_column_selection=s1_column_selection,
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data)


# section 1, action taken as a result of /draw_graph request
def save_graph(graph_html):
    directory = 'app/static/graphs'
    if not os.path.exists(directory):
        os.makedirs(directory)
    filename = f"graph_{int(time.time())}.html"
    full_path = os.path.join(directory, filename)
    with open(full_path, 'w', encoding='utf-8') as file:
        file.write(graph_html)
    return f"graphs/{filename}"


# section 1, clears the 'graphs' list in session
@main.route("/reset_graphs", methods=['POST'])
def reset_graphs():
    session['s1_graphs'] = []
    return redirect(url_for('home.home'))


# section 4, draws graphs with checkbox selected
@main.route("/update_graph", methods=['GET'])
def update_graph():
    actual = request.args.get('actual') == 'true'
    predicted = request.args.get('predicted') == 'true'
    x = list(range(10))
    y_actual = [i ** 2 for i in x] if actual else []
    y_predicted = [i * 2 for i in x] if predicted else []

    data = {
        'x': x,
        'y_actual': y_actual,
        'y_predicted': y_predicted
    }
    return jsonify(data)





