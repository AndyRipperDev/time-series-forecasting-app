import { Link } from 'react-router-dom'
import { useState } from "react";
import { useUserActions } from 'actions';
import FormInput from './FormInput'
import BasicForm from './BasicForm'

// function LoginForm({ history, submit, label }) {
function LoginForm() {
  const userActions = useUserActions();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    return userActions.login(form.email, form.password)
  };

  return (
    <BasicForm
      onSubmit={handleSubmit}
      heading={'Log In'}
      action={'Log In'}
      details={<p>Don't have an account yet? <Link to="/signup" className="link link-primary">Sign Up Here</Link></p>}
    >
      <FormInput
        label={'E-Mail'}
        type={'email'}
        name={'email'}
        forId={'emailId'}
        value={form.email}
        onChange={handleChange}
      />
      <FormInput
        label={'Password'}
        type={'password'}
        name={'password'}
        forId={'passwordId'}
        value={form.password}
        onChange={handleChange}
      />
    </BasicForm>
  )
}

export default LoginForm
