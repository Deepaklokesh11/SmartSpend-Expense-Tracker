import { useState } from 'react'
import './App.css'

const API_BASE = '/api'

async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Request failed (' + response.status + ')')
  }
  return data
}

function localDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

function App() {
  const [mode, setMode] = useState('login')
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(localDate())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAuth(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'register') {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ displayName, email, password }),
        })
        setMode('login')
        setPassword('')
        setMessage('Account created. Sign in to continue.')
      } else {
        const result = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        const items = await apiRequest('/transactions', { token: result.accessToken })
        setToken(result.accessToken)
        setUser(result.user)
        setTransactions(items)
        setPassword('')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateTransaction(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const item = await apiRequest('/transactions', {
        method: 'POST',
        token,
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          description,
          transactionDate,
        }),
      })
      setTransactions((current) => [item, ...current])
      setAmount('')
      setCategory('')
      setDescription('')
      setTransactionDate(localDate())
      setMessage('Transaction saved.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    setToken('')
    setUser(null)
    setTransactions([])
    setMessage('')
    setError('')
  }

  const totals = transactions.reduce(
    (sum, item) => {
      const value = Number(item.amount)
      if (item.type === 'INCOME') sum.income += value
      else sum.expenses += value
      return sum
    },
    { income: 0, expenses: 0 },
  )

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-intro">
          <div className="brand-mark">S</div>
          <p className="eyebrow">YOUR MONEY, IN FOCUS</p>
          <h1>Make room for what matters.</h1>
          <p className="intro-copy">
            Keep everyday spending organized and see where your money goes.
          </p>
          <div className="intro-note">
            <span className="note-dot" />
            Your transactions stay tied to your account.
          </div>
        </section>

        <section className="auth-card">
          <div className="mobile-brand"><span className="brand-mark">S</span> SmartSpend</div>
          <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
          <h2>{mode === 'login' ? 'Sign in to SmartSpend' : 'Create your account'}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Use your account to view and manage your transactions.'
              : 'A few details and you’re ready to go.'}
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError(''); setMessage('') }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setError(''); setMessage('') }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleAuth} className="form-stack">
            {mode === 'register' && (
              <label>
                Name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                maxLength={255}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'register' ? 8 : 1}
                maxLength={72}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              />
            </label>
            {error && <p className="notice error" role="alert">{error}</p>}
            {message && <p className="notice success" role="status">{message}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="fine-print">Your password is stored as a secure hash.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="SmartSpend home">
          <span className="brand-mark">S</span>
          <span>SmartSpend</span>
        </a>
        <div className="account-actions">
          <span className="user-email">{user.email}</span>
          <button type="button" className="quiet-button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="welcome-row">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Good to see you, {user.displayName}.</h1>
          <p className="muted">Here’s a clear view of your money activity.</p>
        </div>
        <div className="welcome-badge"><span /> Account protected</div>
      </section>

      {error && <p className="notice error page-notice" role="alert">{error}</p>}
      {message && <p className="notice success page-notice" role="status">{message}</p>}

      <section className="summary-grid" aria-label="Transaction totals">
        <article className="summary-card">
          <p>Total income</p>
          <strong>{formatAmount(totals.income)}</strong>
          <span className="summary-icon income-icon">↗</span>
        </article>
        <article className="summary-card">
          <p>Total expenses</p>
          <strong>{formatAmount(totals.expenses)}</strong>
          <span className="summary-icon expense-icon">↘</span>
        </article>
        <article className="summary-card balance-card">
          <p>Net total</p>
          <strong>{formatAmount(totals.income - totals.expenses)}</strong>
          <span className="summary-caption">Income minus expenses</span>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel entry-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ADD A RECORD</p>
              <h2>New transaction</h2>
            </div>
            <span className="panel-mark">＋</span>
          </div>
          <form onSubmit={handleCreateTransaction} className="form-stack">
            <label>
              Transaction type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </label>
            <label>
              Amount
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                placeholder="0.00"
              />
            </label>
            <label>
              Category
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                maxLength={80}
                required
                placeholder="Food, transport, salary…"
              />
            </label>
            <label>
              Date
              <input
                type="date"
                value={transactionDate}
                onChange={(event) => setTransactionDate(event.target.value)}
                required
              />
            </label>
            <label>
              Description <span className="optional-label">Optional</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Add a note"
              />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save transaction'}
            </button>
          </form>
        </article>

        <article className="panel list-panel">
          <div className="panel-heading list-heading">
            <div>
              <p className="eyebrow">YOUR ACTIVITY</p>
              <h2>Transactions <span className="count-pill">{transactions.length}</span></h2>
            </div>
            <span className="muted small-copy">Newest dates first</span>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <h3>No transactions yet</h3>
              <p>Add your first income or expense to see it here.</p>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((item) => (
                <article className="transaction-row" key={item.id}>
                  <div className={'transaction-symbol ' + (item.type === 'INCOME' ? 'income-symbol' : 'expense-symbol')}>
                    {item.type === 'INCOME' ? '↗' : '↘'}
                  </div>
                  <div className="transaction-main">
                    <strong>{item.category}</strong>
                    <span>{item.description || item.type.toLowerCase()}</span>
                  </div>
                  <div className="transaction-meta">
                    <strong className={item.type === 'INCOME' ? 'income-amount' : ''}>
                      {item.type === 'INCOME' ? '+' : '−'}{formatAmount(item.amount)}
                    </strong>
                    <span>{new Date(item.transactionDate + 'T00:00:00').toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
      <footer className="app-footer">A clearer picture, one transaction at a time.</footer>
    </main>
  )
}

export default App

