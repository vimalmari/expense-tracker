from flask import Flask, render_template, request, jsonify, session
import os, pg8000.native
from datetime import datetime

app = Flask(__name__)

# Secret key — MUST be set as environment variable on Render
secret = os.environ.get('SECRET_KEY')
if not secret:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
app.secret_key = secret

FAMILY = [
    {'id': 'vimal',        'name': 'Vimal',        'emoji': '🧑🏻', 'pin': '1617'},
    {'id': 'dharani',      'name': 'Dharani',       'emoji': '👩🏻', 'pin': '1224'},
    {'id': 'dharmaraj',    'name': 'Dharmaraj',     'emoji': '👨🏻', 'pin': '4476'},
    {'id': 'dhanalakshmi', 'name': 'Dhanalakshmi',  'emoji': '👩🏻', 'pin': '2510'},
    {'id': 'marimuthu',    'name': 'Marimuthu',     'emoji': '👴🏻', 'pin': '1786'},
    {'id': 'valarmathi',   'name': 'Valarmathi',    'emoji': '👵🏻', 'pin': '1234'},
]

# ── DATABASE ──────────────────────────────────────────────────────────────────

def get_db():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set!")

    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)

    url = db_url.replace('postgresql://', '')
    user_pass, rest = url.split('@', 1)
    user, password = user_pass.split(':', 1)
    host_port, dbname = rest.split('/', 1)

    if ':' in host_port:
        host, port = host_port.split(':', 1)
        port = int(port)
    else:
        host = host_port
        port = 5432

    dbname = dbname.split('?')[0]

    con = pg8000.native.Connection(
        user=user,
        password=password,
        host=host,
        port=port,
        database=dbname,
        ssl_context=True
    )
    return con

def run_query(sql, params=(), fetch=None):
    con = get_db()
    try:
        result = con.run(sql, parameters=list(params)) if params else con.run(sql)
        if fetch == 'all':
            cols = [c['name'] for c in con.columns]
            return [dict(zip(cols, row)) for row in result]
        elif fetch == 'one':
            cols = [c['name'] for c in con.columns]
            return dict(zip(cols, result[0])) if result else None
        return None
    finally:
        con.close()

def run_insert(sql, params=()):
    con = get_db()
    try:
        result = con.run(sql, parameters=list(params))
        return result[0][0] if result else None
    finally:
        con.close()

def run_write(sql, params=()):
    con = get_db()
    try:
        con.run(sql, parameters=list(params)) if params else con.run(sql)
    finally:
        con.close()

def init_db():
    run_write("""
        CREATE TABLE IF NOT EXISTS expenses (
            id         SERIAL PRIMARY KEY,
            user_id    TEXT   NOT NULL,
            exp_time   TEXT   NOT NULL,
            amount     REAL   NOT NULL,
            grp        TEXT   NOT NULL,
            sub        TEXT   NOT NULL,
            icon       TEXT   NOT NULL,
            date       TEXT   NOT NULL,
            year_month TEXT   NOT NULL DEFAULT ''
        )
    """)

init_db()

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html', family=FAMILY)

@app.route('/api/login', methods=['POST'])
def login():
    data    = request.json
    user_id = data.get('user_id')
    pin     = data.get('pin')
    user    = next((f for f in FAMILY if f['id'] == user_id), None)
    if user and user['pin'] == pin:
        session['user_id'] = user_id
        return jsonify({'ok': True, 'user': {k: v for k, v in user.items() if k != 'pin'}})
    return jsonify({'ok': False, 'msg': 'Wrong PIN'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month')
    if month:
        rows = run_query(
            'SELECT * FROM expenses WHERE user_id=$1 AND year_month=$2 ORDER BY id DESC',
            (session['user_id'], month), fetch='all'
        )
    else:
        rows = run_query(
            'SELECT * FROM expenses WHERE user_id=$1 ORDER BY id DESC',
            (session['user_id'],), fetch='all'
        )
    return jsonify(rows)

@app.route('/api/monthly-summary', methods=['GET'])
def monthly_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    rows = run_query(
        """SELECT year_month, SUM(amount) as total, COUNT(*) as count
           FROM expenses WHERE user_id=$1
           GROUP BY year_month ORDER BY year_month DESC""",
        (session['user_id'],), fetch='all'
    )
    return jsonify(rows)

@app.route('/api/daily-summary', methods=['GET'])
def daily_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    rows = run_query(
        """SELECT date, SUM(amount) as total, COUNT(*) as count
           FROM expenses WHERE user_id=$1 AND year_month=$2
           GROUP BY date ORDER BY date DESC""",
        (session['user_id'], month), fetch='all'
    )
    return jsonify(rows)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    d = request.json
    try:
        dt = datetime.strptime(d['date'], '%d %b %Y')
        year_month = dt.strftime('%Y-%m')
    except Exception:
        year_month = datetime.now().strftime('%Y-%m')

    new_id = run_insert(
        """INSERT INTO expenses (user_id, exp_time, amount, grp, sub, icon, date, year_month)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id""",
        (session['user_id'], d['exp_time'], d['amount'], d['grp'], d['sub'], d['icon'], d['date'], year_month)
    )
    return jsonify({'ok': True, 'id': new_id, 'year_month': year_month})

@app.route('/api/expenses/<int:eid>', methods=['DELETE'])
def delete_expense(eid):
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    run_write('DELETE FROM expenses WHERE id=$1 AND user_id=$2', (eid, session['user_id']))
    return jsonify({'ok': True})

@app.route('/api/expenses/clear', methods=['DELETE'])
def clear_expenses():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month')
    if month:
        run_write('DELETE FROM expenses WHERE user_id=$1 AND year_month=$2', (session['user_id'], month))
    else:
        run_write('DELETE FROM expenses WHERE user_id=$1', (session['user_id'],))
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
