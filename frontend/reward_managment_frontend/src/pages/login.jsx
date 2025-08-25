import React, { useState } from 'react'
import axios from 'axios'

const Login = () => {
  const [state, setState] = useState('Sign Up')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Sign Up') {
        // Signup request
        const response = await axios.post("http://localhost:8000/api/auth/register", {
          name,
          email,
          password
        });
        console.log("Signup Success:", response.data);
        alert("Account created successfully!");
      } else {
        // Login request
        const response = await axios.post("http://localhost:8000/api/auth/login", {
          email,
          password
        });
        console.log("Login Success:", response.data);

        // If backend returns a token, save it
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        alert("Login successful!");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert(error.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <div>
        <p>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {state === 'Sign Up' && (
          <div>
            <p>Full Name</p>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              type="text" 
              required 
            />
          </div>
        )}

        <div>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            type="email" 
            required 
          />
        </div>

        <div>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            type="password" 
            required 
          />
        </div>

        <button type="submit">
          {state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>

        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} style={{cursor: "pointer", color:"blue"}}>Login here</span></p>
          : <p>Create a new account? <span onClick={() => setState('Sign Up')} style={{cursor: "pointer", color:"blue"}}>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
