from flask import Flask, render_template, request, jsonify, session
import os, random, smtplib, pg8000.dbapi, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

app = Flask(__name__)

secret = os.environ.get('SECRET_KEY')
if not secret:
    raise RuntimeError("SECRET_KEY environment variable is not set!")
app.secret_key = secret
app.permanent_session_lifetime = timedelta(days=90)

GMAIL_USER = os.environ.get('GMAIL_USER', '')
GMAIL_PASS = os.environ.get('GMAIL_PASS', '')

# ── DATABASE ──────────────────────────────────────────────────────────────────

def get_db():
    from urllib.parse import urlparse, unquote
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set!")
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    parsed   = urlparse(db_url)
    user     = unquote(parsed.username)
    password = unquote(parsed.password)
    host     = parsed.hostname
    port     = parsed.port or 5432
    dbname   = parsed.path.lstrip('/')
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    con = pg8000.dbapi.connect(
        user=user, password=password, host=host,
        port=port, database=dbname, ssl_context=ssl_context
    )
    return con

def query(sql, params=None):
    con = get_db()
    try:
        cur = con.cursor()
        cur.execute(sql, params or [])
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = cur.fetchall() if cur.description else []
        con.commit()
        return [dict(zip(cols, row)) for row in rows]
    finally:
        con.close()

def execute(sql, params=None):
    con = get_db()
    try:
        cur = con.cursor()
        cur.execute(sql, params or [])
        result = cur.fetchall() if cur.description else []
        con.commit()
        return result
    finally:
        con.close()

def init_db():
    # Users table
    execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         SERIAL PRIMARY KEY,
            email      TEXT   NOT NULL UNIQUE,
            name       TEXT   NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    # OTP table
    execute("""
        CREATE TABLE IF NOT EXISTS otps (
            id         SERIAL PRIMARY KEY,
            email      TEXT   NOT NULL,
            otp        TEXT   NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used       BOOLEAN DEFAULT FALSE
        )
    """)
    # Expenses table
    execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER NOT NULL,
            exp_time   TEXT    NOT NULL,
            amount     REAL    NOT NULL,
            grp        TEXT    NOT NULL,
            sub        TEXT    NOT NULL,
            icon       TEXT    NOT NULL,
            date       TEXT    NOT NULL,
            year_month TEXT    NOT NULL DEFAULT ''
        )
    """)

init_db()

# ── EMAIL OTP ─────────────────────────────────────────────────────────────────

def send_otp_email(to_email, otp, name=''):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'{otp} is your Expense Tracker OTP'
        msg['From']    = f'Expense Tracker <{GMAIL_USER}>'
        msg['To']      = to_email

        greeting = f'Hi {name},' if name else 'Hi,'

        html = f"""
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d14;border-radius:20px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#f4845f,#c77dff);padding:32px;text-align:center;">
            <div style="font-size:48px;">💰</div>
            <h1 style="color:#fff;margin:12px 0 4px;font-size:24px;font-weight:800;">Expense Tracker</h1>
            <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Your one-time login code</p>
          </div>
          <div style="padding:32px;background:#16152a;">
            <p style="color:#f0eeff;font-size:16px;margin:0 0 24px;">{greeting}</p>
            <p style="color:#9896b0;font-size:14px;margin:0 0 20px;">Your OTP for Expense Tracker is:</p>
            <div style="background:linear-gradient(135deg,#f4845f22,#c77dff22);border:1px solid rgba(244,132,95,0.3);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#f4845f;">{otp}</span>
            </div>
            <p style="color:#9896b0;font-size:13px;margin:0 0 8px;">⏱️ This OTP expires in <strong style="color:#f0eeff;">10 minutes</strong></p>
            <p style="color:#9896b0;font-size:13px;margin:0;">🔒 Do not share this OTP with anyone</p>
          </div>
          <div style="padding:16px 32px;background:#0d0d14;text-align:center;">
            <p style="color:#5a5870;font-size:12px;margin:0;">Expense Tracker — Track your spending easily</p>
          </div>
        </div>
        """

        part = MIMEText(html, 'html')
        msg.attach(part)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

# ── SEND OTP ──
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data  = request.json
    email = (data.get('email') or '').strip().lower()
    name  = (data.get('name')  or '').strip()

    if not email or '@' not in email:
        return jsonify({'ok': False, 'msg': 'Invalid email address.'}), 400
    if not name:
        return jsonify({'ok': False, 'msg': 'Please enter your name.'}), 400

    # Check if user exists
    users = query('SELECT * FROM users WHERE email=%s', [email])
    is_new = len(users) == 0

    # If new user, store name temporarily in session
    session['pending_email'] = email
    session['pending_name']  = name

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now() + timedelta(minutes=10)

    # Save OTP to DB
    execute('DELETE FROM otps WHERE email=%s', [email])
    execute(
        'INSERT INTO otps (email, otp, expires_at) VALUES (%s, %s, %s)',
        [email, otp, expires_at]
    )

    # Send email
    display_name = name if is_new else (users[0]['name'] if users else name)
    sent = send_otp_email(email, otp, display_name)

    if not sent:
        return jsonify({'ok': False, 'msg': 'Failed to send OTP. Please check your email and try again.'}), 500

    return jsonify({'ok': True, 'is_new': is_new})

# ── VERIFY OTP ──
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data  = request.json
    email = (data.get('email') or '').strip().lower()
    otp   = (data.get('otp')   or '').strip()

    if not email or not otp:
        return jsonify({'ok': False, 'msg': 'Missing email or OTP.'}), 400

    # Check OTP
    rows = query(
        'SELECT * FROM otps WHERE email=%s AND otp=%s AND used=FALSE AND expires_at > NOW()',
        [email, otp]
    )

    if not rows:
        return jsonify({'ok': False, 'msg': 'Invalid or expired OTP. Try again.'}), 401

    # Mark OTP as used
    execute('UPDATE otps SET used=TRUE WHERE email=%s', [email])

    # Get or create user
    users = query('SELECT * FROM users WHERE email=%s', [email])
    if users:
        user = users[0]
    else:
        name = session.get('pending_name', email.split('@')[0])
        result = execute(
            'INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id, email, name',
            [email, name]
        )
        if result:
            user = {'id': result[0][0], 'email': result[0][1], 'name': result[0][2]}
        else:
            return jsonify({'ok': False, 'msg': 'Failed to create account.'}), 500

    # Set session
    session.permanent = True
    session['user_id']   = user['id']
    session['user_email']= user['email']
    session['user_name'] = user['name']
    session.pop('pending_email', None)
    session.pop('pending_name',  None)

    return jsonify({'ok': True, 'user': {
        'id':    user['id'],
        'email': user['email'],
        'name':  user['name'],
        'emoji': '👤'
    }})

# ── CHECK SESSION ──
@app.route('/api/me', methods=['GET'])
def me():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    return jsonify({'ok': True, 'user': {
        'id':    session['user_id'],
        'email': session['user_email'],
        'name':  session['user_name'],
        'emoji': '👤'
    }})

# ── LOGOUT ──
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})

# ── EXPENSES ──
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month')
    if month:
        rows = query(
            'SELECT * FROM expenses WHERE user_id=%s AND year_month=%s ORDER BY id DESC',
            [session['user_id'], month]
        )
    else:
        rows = query(
            'SELECT * FROM expenses WHERE user_id=%s ORDER BY id DESC',
            [session['user_id']]
        )
    return jsonify(rows)

@app.route('/api/monthly-summary', methods=['GET'])
def monthly_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    rows = query(
        """SELECT year_month, SUM(amount) as total, COUNT(*) as count
           FROM expenses WHERE user_id=%s
           GROUP BY year_month ORDER BY year_month DESC""",
        [session['user_id']]
    )
    return jsonify(rows)

@app.route('/api/daily-summary', methods=['GET'])
def daily_summary():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    rows = query(
        """SELECT date, SUM(amount) as total, COUNT(*) as count
           FROM expenses WHERE user_id=%s AND year_month=%s
           GROUP BY date ORDER BY date DESC""",
        [session['user_id'], month]
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
    result = execute(
        """INSERT INTO expenses (user_id, exp_time, amount, grp, sub, icon, date, year_month)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
        [session['user_id'], d['exp_time'], d['amount'], d['grp'], d['sub'], d['icon'], d['date'], year_month]
    )
    new_id = result[0][0] if result else None
    return jsonify({'ok': True, 'id': new_id, 'year_month': year_month})

@app.route('/api/expenses/<int:eid>', methods=['DELETE'])
def delete_expense(eid):
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    execute('DELETE FROM expenses WHERE id=%s AND user_id=%s', [eid, session['user_id']])
    return jsonify({'ok': True})

@app.route('/api/expenses/clear', methods=['DELETE'])
def clear_expenses():
    if 'user_id' not in session:
        return jsonify({'ok': False}), 401
    month = request.args.get('month')
    if month:
        execute('DELETE FROM expenses WHERE user_id=%s AND year_month=%s', [session['user_id'], month])
    else:
        execute('DELETE FROM expenses WHERE user_id=%s', [session['user_id']])
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
