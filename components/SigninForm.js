import { reduxForm, Field } from 'redux-form';
import { TextField, Button } from '@material-ui/core';
import { login } from '../actions';

const fieldNames = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM: 'confirmPassword',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName'
};

const validate = (...args) => {
  console.log(args);
  const values = args[0];
  const errors = {};

  Object.keys(fieldNames).forEach(field => {
    if (!values[fieldNames[field]]) {
      errors[fieldNames[field]] = 'This field required';
    }
  });

  const lengthErrorMessage = 'Name must have atleast 3 characters';

  if (values[fieldNames.FIRST_NAME] && values[fieldNames.FIRST_NAME].length < 3) {
    errors[fieldNames.FIRST_NAME] = lengthErrorMessage
  }

  if (values[fieldNames.LAST_NAME] && values[fieldNames.LAST_NAME].length < 3) {
    errors[fieldNames.LAST_NAME] = lengthErrorMessage;
  }

  if (values[fieldNames.EMAIL] && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values[fieldNames.EMAIL])) {
    errors[fieldNames.EMAIL] = 'Invalid email address';
  }

  if (values[fieldNames.PASSWORD] !== values[fieldNames.CONFIRM]) {
    errors[fieldNames.PASSWORD] = 'Passwords should match';
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


const MaterialLoginForm = props => {
  const { handleSubmit, pristine, submitting, error, valid } = props;
  
  const submit = handleSubmit(login);
  return (
    <form onSubmit={submit}>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="text"
            name={fieldNames.FIRST_NAME}
            component={renderTextField}
            label="First name"
          />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="text"
            name={fieldNames.LAST_NAME}
            component={renderTextField}
            label="Last name"
          />
      </div>
      <div>
        <Field 
          style={{ width: `${100}%` }}
          required
          type="email"
          name={fieldNames.EMAIL}
          component={renderTextField}
          label="Email"
        />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="password"
            name={fieldNames.PASSWORD}
            component={renderTextField}
            label="Password"
          />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="password"
            name={fieldNames.CONFIRM}
            component={renderTextField}
            label="Password"
          />
      </div>
      {error && <strong>{error}</strong>}
      <div>
        <Button type="submit" variant="contained" color="primary" disabled={pristine || submitting || !valid}>
          Signin
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'signinUIForm',
  validate
})(MaterialLoginForm);