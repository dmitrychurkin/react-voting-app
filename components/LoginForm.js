import { reduxForm, Field } from 'redux-form';
import Router from 'next/router';
import { Button, Typography, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { login } from '../actions';

const validate = values => {

  const errors = {};

  const requiredFields = [
    'email', 'password'
  ];

  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'This field required';
    }
  });

  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;

};

const renderTextField = ({ label, type, input, meta: { touched, invalid, error }, ...custom }) => (
  <TextField 
    type={type}
    label={label}
    placeholder={label}
    error={touched && invalid}
    helperText={touched && error}
    {...input}
    {...custom}
  />
);

const renderCheckbox = ({ input, label }) => (
  <FormControlLabel
    control={
      <Checkbox 
        checked={input.value ? true : false}
        onChange={input.onChange}
      />
    }
    label={label}
  />
);

const MaterialLoginForm = ({ handleSubmit, pristine, submitting, error, valid, reset, query }) => {
  
  const submit = handleSubmit(login);
  return (
    <form onSubmit={async (...args) => {
      const result = await submit(...args);
      console.log('result login ', result);
      
      if (typeof result !== 'object' || !('_error' in result)) {
        // clear form
        reset();
        if (result.emailConfirmationState != 3) {
          Router.push('/confirm-email');
          return;
        }
        console.log('Login component query ', query);
        Router.push(query.r || '/account');
        
      }
    }}>
      <Field 
        type="hidden"
        name="_csrf" 
        component="input"
      />
      <div>
        <Field 
          style={{ width: `${100}%` }}
          type="email"
          name="email"
          component={renderTextField}
          label="Email"
        />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            type="password"
            name="password"
            component={renderTextField}
            label="Password"
          />
      </div>
      <div>
        <Field name="remember_me" component={renderCheckbox} label="Keep me signed" />
      </div>
      {error && <Typography color="error">{error.toString().charAt(0).toUpperCase() + error.toString().slice(1)}</Typography>}
      <div>
        <Button type="submit" variant="contained" color="primary" disabled={pristine || submitting || !valid}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'loginUIForm',
  validate
})(MaterialLoginForm);