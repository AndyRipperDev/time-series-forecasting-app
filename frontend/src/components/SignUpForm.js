import { Link } from 'react-router-dom'
import FormInput from './FormInput'
import { useUserActions } from '../actions'
import { useState } from 'react'
import BasicForm from './BasicForm'


// function SignUpForm({ history, submit, label }) {
function SignUpForm() {
  const userActions = useUserActions();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    return userActions.signup(form)
  };

  return (
    <BasicForm
      onSubmit={handleSubmit}
      heading={'Sign Up'}
      action={'Sign Up'}
      details={<p>Already have an account? <Link to="/login" className="link link-primary">Log In Here</Link></p>}
    >
      <FormInput
        label={'Full Name'}
        type={'text'}
        name={'fullName'}
        forId={'fullNameId'}
        value={form.fullName}
        onChange={handleChange}
      />
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

export default SignUpForm
