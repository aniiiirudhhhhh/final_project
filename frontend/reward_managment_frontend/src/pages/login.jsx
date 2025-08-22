import React, { useState } from 'react'

const Login = () => {

  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = (event) => {
    event.preventDefault();

  }

  return (
    <form onSubmit={onSubmitHandler}>
      <div>
        <p>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        {state === 'Sign Up'
          ? <div >
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} type="text" required />
          </div>
          : null
        }
        <div >
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" required />
        </div>
        <div >
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" required />
        </div>
        <button>{state === 'Sign Up' ? 'Create account' : 'Login'}</button>
        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} >Login here</span></p>
          : <p>Create an new account? <span onClick={() => setState('Sign Up')} >Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login