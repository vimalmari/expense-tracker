from flask import Flask, render_template, request, jsonify, session
import os, psycopg2, psycopg2.extras
from datetime import datetime

app = Flask(__name__)

# Secret key — MUST be set as environment variable on Render, no unsafe fallback
secret = os.environ.get('SECRET_KEY')
if not secret:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
app.secret_key = secret

FAMILY = [
    {'id': 'vimal',        'name': 'Vimal',        'emoji': '🧑🏻', 'pin': '1617'},
    {'id': 'dharani',      'name': 'Dharani',       'emoji': '👩🏻', 'pin': '1224'},
    {'id': 'dharmaraj',    'name': 'Dharmaraj',     'emoji': '👨🏻', 'pin': '4476'},
    {'id': 'dhanalakshmi', 'name': 'Dhanalakshmi',  'emoji': '👩🏻', 'pin': '2510'},
]

# ── DATABASE ──────────────────────────────────────────────────────────────────

def get_db():
    """Open a new PostgreSQL connection using the DATABASE_URL env variable."""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set!")
    # Render gives URLs starting with postgres://, psycopg2 needs postgresql://
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    con = psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)
    return con

def init_db():
    """Create the expenses table if it doesn't exist."""
    with get_db() as con:
        with con.cursor() as cur:
            cur.execute('''
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
            ''')
        con.commit()

# Call at module level so Gunicorn also runs it
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
    with get_db() as con:
        with con.cursor() as cur:
            if month:
                cur.execute(
                    'SELECT * FROM expenses WHERE user_id=%s AND year_month=%s ORDER BY id DESC',
                    (session['user_id'], month)
                )
            else:
                cur.execute(
                    'SELECT * FROM expenses WHERE user_id=%s ORDER BY id DESC',
                    (session['user_id'],)
                )
            rows = cur.fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/monthly-summary', methods=['GET'])
def monthly_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    with get_db() as con:
        with con.cursor() as cur:
            cur.execute(
                '''SELECT year_month, SUM(amount) as total, COUNT(*) as count
                   FROM expenses WHERE user_id=%s
                   GROUP BY year_month ORDER BY year_month DESC''',
                (session['user_id'],)
            )
            rows = cur.fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/daily-summary', methods=['GET'])
def daily_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    with get_db() as con:
        with con.cursor() as cur:
            cur.execute(
                '''SELECT date, SUM(amount) as total, COUNT(*) as count
                   FROM expenses WHERE user_id=%s AND year_month=%s
                   GROUP BY date ORDER BY date DESC''',
                (session['user_id'], month)
            )
            rows = cur.fetchall()
    return jsonify([dict(r) for r in rows])

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
    with get_db() as con:
        with con.cursor() as cur:
            cur.execute(
                '''INSERT INTO expenses (user_id, exp_time, amount, grp, sub, icon, date, year_month)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id''',
                (session['user_id'], d['exp_time'], d['amount'], d['grp'], d['sub'], d['icon'], d['date'], year_month)
            )
            new_id = cur.fetchone()['id']
        con.commit()
    return jsonify({'ok': True, 'id': new_id, 'year_month': year_month})

@app.route('/api/expenses/<int:eid>', methods=['DELETE'])
def delete_expense(eid):
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    with get_db() as con:
        with con.cursor() as cur:
            cur.execute('DELETE FROM expenses WHERE id=%s AND user_id=%s', (eid, session['user_id']))
        con.commit()
    return jsonify({'ok': True})

@app.route('/api/expenses/clear', methods=['DELETE'])
def clear_expenses():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month')
    with get_db() as con:
        with con.cursor() as cur:
            if month:
                cur.execute('DELETE FROM expenses WHERE user_id=%s AND year_month=%s', (session['user_id'], month))
            else:
                cur.execute('DELETE FROM expenses WHERE user_id=%s', (session['user_id'],))
        con.commit()
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
