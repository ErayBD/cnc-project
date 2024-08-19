from flask import render_template, request, Blueprint, session, redirect, url_for, jsonify
from app.models import s1_fetch_columns_data, s1_create_graph_scatter, s1_create_graph_bar, s1_create_graph_histogram, s1_create_graph_line, s1_fetch_axis_data, s2_fetch_anomaly_data, s3_fetch_feature_data
import os
import time

main = Blueprint('home', __name__)

# startup route
@main.route("/", methods=['GET'])
def home():
    s1_columns = s1_fetch_columns_data('all_table')
    s2_anomaly_columns, s2_table_data = s2_fetch_anomaly_data('anomaly_table')
    s3_columns_train = s1_fetch_columns_data('all_table_train')
    s3_columns_test = s1_fetch_columns_data('all_table_test')
    s4_columns_train = s1_fetch_columns_data('actual_table_train')
    s4_columns_test = s1_fetch_columns_data('actual_table_test')
    return render_template('home.html',
                           title='CNC Project',
                           s1_columns=s1_columns,
                           s2_anomaly_columns=s2_anomaly_columns,
                           s2_table_data=s2_table_data,
                           s3_columns_train=s3_columns_train,
                           s3_columns_test=s3_columns_test,
                           s4_columns_train=s4_columns_train,
                           s4_columns_test=s4_columns_test)


# section 1, submit button request
@main.route("/draw_graph", methods=['GET', 'POST'])
def draw_graph():
    s1_columns = s1_fetch_columns_data('all_table')
    s1_data_selection = request.form.get('s1_data_selection', '')
    s1_row_selection = int(request.form.get('s1_row_selection', session.get('s1_row_selection', 1)))
    s1_column_selection = int(request.form.get('s1_column_selection', session.get('s1_column_selection', 1)))
    s1_x_axis = request.form.get('s1_x_axis', '')
    s1_y_axis = request.form.get('s1_y_axis', '')
    s1_plot_type = request.form.get('s1_plot_type', '')
    s1_replace_graph = request.form.get('s1_replace_graph') == 'on'
    s2_anomaly_columns, s2_table_data = s2_fetch_anomaly_data('anomaly_table')
    s3_columns_test = s1_fetch_columns_data('all_table_test')
    s3_columns_train = s1_fetch_columns_data('all_table_train')
    s4_columns_test = s1_fetch_columns_data('actual_table_test')
    s4_columns_train = s1_fetch_columns_data('actual_table_train')

    if s1_row_selection == "Seçim Yapınız" or s1_column_selection == "Seçim Yapınız":
        s1_error_message = "Lütfen satır ve sütun sayısını belirtiniz."
        return render_template('home.html',
                               title='CNC Project',
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s1_columns=s1_columns,
                               s1_error_message=s1_error_message,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s4_columns_train,
                               s4_columns_test=s4_columns_test)

    if s1_x_axis == "Seçim Yapınız" or s1_y_axis == "Seçim Yapınız":
        s1_error_message = "Lütfen her iki ekseni de seçiniz."
        return render_template('home.html',
                               title='CNC Project',
                               s1_columns=s1_columns,
                               s1_error_message=s1_error_message,
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s4_columns_train,
                               s4_columns_test=s4_columns_test)

    if s1_plot_type == "Seçim Yapınız":
        s1_error_message = "Lütfen bir çizim türü seçiniz."
        return render_template('home.html',
                               title='CNC Project',
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s1_columns=s1_columns,
                               s1_error_message=s1_error_message,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s4_columns_train,
                               s4_columns_test=s4_columns_test)

    if not s1_replace_graph:
        session['s1_row_selection'] = s1_row_selection
        session['s1_column_selection'] = s1_column_selection

    max_graphs = session['s1_row_selection'] * session['s1_column_selection']
    graphs = session.get('s1_graphs', [])

    if len(graphs) >= max_graphs and not s1_replace_graph:
        s1_error_message = "Maksimum grafik kapasitesine ulaşıldı. Lütfen 'Sıfırla' butonunu kullanın."
        return render_template('home.html',
                               title='CNC Project',
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s1_columns=s1_columns,
                               s1_graphs=graphs,
                               s1_error_message=s1_error_message,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s4_columns_train,
                               s4_columns_test=s4_columns_test)

    if s1_x_axis and s1_y_axis and s1_x_axis != "Seçim Yapınız" and s1_y_axis != "Seçim Yapınız" and s1_plot_type and s1_plot_type != "Seçim Yapınız":
        x_data, y_data = s1_fetch_axis_data(s1_x_axis, s1_y_axis, 'all_table')
        graph_html = None

        if s1_plot_type == 'scatter':
            graph_html = s1_create_graph_scatter(x_data, y_data, s1_x_axis, s1_y_axis)
        elif s1_plot_type == 'bar':
            graph_html = s1_create_graph_bar(x_data, y_data, s1_x_axis, s1_y_axis)
        elif s1_plot_type == 'line':
            graph_html = s1_create_graph_line(x_data, y_data, s1_x_axis, s1_y_axis)
        elif s1_plot_type == 'histogram':
            graph_html = s1_create_graph_histogram(y_data, s1_y_axis)

        graph_path = save_graph(graph_html)

        if s1_replace_graph:
            num_columns = session['s1_column_selection']
            graph_datatime = (int(s1_row_selection) - 1) * num_columns + (int(s1_column_selection) - 1)

            if 0 <= graph_datatime < len(graphs):
                graphs[graph_datatime] = graph_path
                session['s1_graphs'] = graphs
            else:
                s1_error_message = "Geçersiz grafik indeksi."
                return render_template('home.html',
                                       title='CNC Project',
                                       s1_data_selection=s1_data_selection,
                                       s1_row_selection=session['s1_row_selection'],
                                       s1_column_selection=session['s1_column_selection'],
                                       s1_x_axis=s1_x_axis,
                                       s1_y_axis=s1_y_axis,
                                       s1_plot_type=s1_plot_type,
                                       s1_replace_graph=s1_replace_graph,
                                       s1_columns=s1_columns,
                                       s1_graphs=graphs,
                                       s1_error_message=s1_error_message,
                                       s2_anomaly_columns=s2_anomaly_columns,
                                       s2_table_data=s2_table_data,
                                       s3_columns_train=s3_columns_train,
                                       s3_columns_test=s3_columns_test,
                                       s4_columns_train=s4_columns_train,
                                       s4_columns_test=s4_columns_test)
        else:
            graphs.append(graph_path)
            graphs = graphs[:max_graphs]
            session['s1_graphs'] = graphs

        return render_template('home.html',
                               title='CNC Project',
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s1_columns=s1_columns,
                               s1_graphs=graphs,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s3_columns_train,
                               s4_columns_test=s3_columns_test)
    else:
        s1_error_message = "Lütfen tüm gerekli alanları doldurunuz."
        return render_template('home.html',
                               title='CNC Project',
                               s1_columns=s1_columns,
                               s1_error_message=s1_error_message,
                               s1_data_selection=s1_data_selection,
                               s1_row_selection=session['s1_row_selection'],
                               s1_column_selection=session['s1_column_selection'],
                               s1_x_axis=s1_x_axis,
                               s1_y_axis=s1_y_axis,
                               s1_plot_type=s1_plot_type,
                               s1_replace_graph=s1_replace_graph,
                               s2_anomaly_columns=s2_anomaly_columns,
                               s2_table_data=s2_table_data,
                               s3_columns_train=s3_columns_train,
                               s3_columns_test=s3_columns_test,
                               s4_columns_train=s4_columns_train,
                               s4_columns_test=s4_columns_test)


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
    session.pop('s1_graphs', None)
    session.pop('s1_row_selection', None)
    session.pop('s1_column_selection', None)
    return redirect(url_for('home.home'))


# section 3, returns the data
@main.route("/get_feature_data", methods=['GET'])
def get_feature_data():
    feature = request.args.get('feature')
    tab = request.args.get('tab')
    month = request.args.get('month')

    table_name = 'all_table_train' if tab == "train" else 'all_table_test'
    x_data, y_data = s3_fetch_feature_data('datatime', feature, table_name, month)
    return jsonify({'x': x_data, 'y': y_data})


# section 4, returns the data
@main.route("/get_feature_data_section4", methods=['GET'])
def get_feature_data_section4():
    feature = request.args.get('feature')
    tab = request.args.get('tab')
    month = request.args.get('month')
    model = request.args.get('model', 'model_1')  # Model parametresini alıyoruz

    # Model'e göre tablo adlarını belirliyoruz
    if model == 'model_1':
        # actual_table_name = 'actual_table_train_seq5' if tab == "train" else 'actual_table_test_seq5'
        # prediction_table_name = 'prediction_table_train_seq5' if tab == "train" else 'prediction_table_test_seq5'
        actual_table_name = 'actual_table_train' if tab == "train" else 'actual_table_test'
        prediction_table_name = 'prediction_table_train' if tab == "train" else 'prediction_table_test'
    elif model == 'model_2':
        # actual_table_name = 'actual_table_train_seq60' if tab == "train" else 'actual_table_test_seq60'
        # prediction_table_name = 'prediction_table_train_seq60' if tab == "train" else 'prediction_table_test_seq60'
        actual_table_name = 'actual_table_train' if tab == "train" else 'actual_table_test_seq5'
        prediction_table_name = 'prediction_table_train' if tab == "train" else 'prediction_table_test_seq5_128'
    elif model == 'model_3':
        # actual_table_name = 'actual_table_train_seq128' if tab == "train" else 'actual_table_test_seq128'
        # prediction_table_name = 'prediction_table_train_seq128' if tab == "train" else 'prediction_table_test_seq128'
        actual_table_name = 'actual_table_train' if tab == "train" else 'actual_table_test_seq60'
        prediction_table_name = 'prediction_table_train' if tab == "train" else 'prediction_table_test_seq60_64'
    else:
        return jsonify({'error': 'Invalid model selected'}), 400

    x_data, y_actual = s3_fetch_feature_data('datatime', feature, actual_table_name, month)
    _, y_prediction = s3_fetch_feature_data('datatime', feature, prediction_table_name, month)
    return jsonify({'x': x_data, 'y_actual': y_actual, 'y_prediction': y_prediction})
